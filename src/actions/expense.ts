"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { pusherServer } from "@/lib/pusher";
import { simplifyDebts } from "@/lib/settlement-engine";
import { notifyGroupActivity } from "@/lib/mail";

const ExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  category: z.string(),
  groupId: z.string(),
  paidById: z.string(),
  date: z.string().optional(),
  splits: z.array(
    z.object({
      userId: z.string(),
      amount: z.number(),
    })
  ),
});

/**
 * Shared logic to update pair-wise balances
 */
async function updateBalances(tx: any, groupId: string, paidById: string, splits: any[], type: 'add' | 'remove') {
  for (const split of splits) {
    if (split.userId === paidById) continue;

    const userAId = split.userId < paidById ? split.userId : paidById;
    const userBId = split.userId < paidById ? paidById : split.userId;

    const multiplier = type === 'add' ? 1 : -1;
    const change = (split.userId === userAId ? split.amount : -split.amount) * multiplier;

    await tx.balance.upsert({
      where: {
        groupId_userAId_userBId: {
          groupId,
          userAId,
          userBId,
        },
      },
      update: {
        amount: { increment: change },
      },
      create: {
        groupId,
        userAId,
        userBId,
        amount: change,
      },
    });
  }
}

export async function addExpense(data: z.infer<typeof ExpenseSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const validatedData = ExpenseSchema.parse(data);
  const { amount, description, category, groupId, paidById, splits, date } = validatedData;

  const result = await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        amount,
        description,
        category,
        groupId,
        paidById,
        splits,
        date: date ? new Date(date) : undefined,
      },
    });

    await updateBalances(tx, groupId, paidById, splits, 'add');

    await tx.activityLog.create({
      data: {
        groupId,
        userId: paidById,
        action: "ADD_EXPENSE",
        metadata: { description, amount },
      },
    });

    return expense;
  });

  await notifyGroupActivity(groupId, "ADD_EXPENSE", { description, amount }, paidById);

  try {
    await pusherServer?.trigger(`group-${groupId}`, "balance-updated", {
      message: `${session.user.name} added ₹${amount}`,
    });
  } catch (err) {}

  revalidatePath(`/groups/${groupId}`);
  return result;
}

export async function updateExpense(id: string, data: z.infer<typeof ExpenseSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const validatedData = ExpenseSchema.parse(data);
  const { amount, description, category, groupId, paidById, splits, date } = validatedData;

  const result = await prisma.$transaction(async (tx) => {
    const oldExpense = await tx.expense.findUnique({ where: { id } });
    if (!oldExpense) throw new Error("Expense not found");

    await updateBalances(tx, oldExpense.groupId, oldExpense.paidById, oldExpense.splits as any[], 'remove');

    const expense = await tx.expense.update({
      where: { id },
      data: {
        amount,
        description,
        category,
        paidById,
        splits,
        date: date ? new Date(date) : undefined,
      },
    });

    await updateBalances(tx, groupId, paidById, splits, 'add');

    await tx.activityLog.create({
      data: {
        groupId,
        userId: paidById,
        action: "UPDATE_EXPENSE",
        metadata: { description, amount },
      },
    });

    return expense;
  });

  await notifyGroupActivity(groupId, "UPDATE_EXPENSE", { description, amount }, paidById);

  revalidatePath(`/groups/${groupId}`);
  return result;
}

export async function deleteExpense(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  let groupId = "";
  let paidById = "";
  let description = "";
  let amount = 0;

  await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.findUnique({ where: { id } });
    if (!expense) throw new Error("Expense not found");

    groupId = expense.groupId;
    paidById = expense.paidById;
    description = expense.description;
    amount = expense.amount;

    await updateBalances(tx, expense.groupId, expense.paidById, expense.splits as any[], 'remove');
    await tx.expense.delete({ where: { id } });

    await tx.activityLog.create({
      data: {
        groupId: expense.groupId,
        userId: expense.paidById,
        action: "DELETE_EXPENSE",
        metadata: { description: expense.description, amount: expense.amount },
      },
    });
  });

  if (groupId) {
    await notifyGroupActivity(groupId, "DELETE_EXPENSE", { description, amount }, paidById);
  }

  revalidatePath("/dashboard");
}

export async function getGroupExpenses(groupId: string) {
  return await prisma.expense.findMany({
    where: { groupId },
    include: { paidBy: true },
    orderBy: { date: "desc" },
  });
}

export async function getGroupBalances(groupId: string) {
  const rawBalances = await prisma.balance.findMany({
    where: { groupId },
    include: {
      userA: true,
      userB: true,
    },
  });

  const simplified = simplifyDebts(rawBalances);
  
  return {
    raw: rawBalances,
    simplified
  };
}

/**
 * Initiates a settlement request. 
 * Does NOT update balances until approved by the recipient.
 */
export async function settleUp(data: {
  amount: number;
  groupId: string;
  fromUserId: string;
  toUserId: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { amount, groupId, fromUserId, toUserId } = data;

  const settlement = await prisma.settlement.create({
    data: {
      amount,
      groupId,
      fromUserId,
      toUserId,
      status: "PENDING",
    },
  });

  try {
    await pusherServer?.trigger(`group-${groupId}`, "settlement-requested", {
      message: `${session.user.name} marked ₹${amount} as paid`,
      toUserId,
    });
  } catch (err) {}

  revalidatePath(`/groups/${groupId}`);
  return settlement;
}

/**
 * Recipient approves the settlement. 
 * Balances are updated ONLY at this step.
 */
export async function approveSettlement(settlementId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
  });

  if (!settlement) throw new Error("Settlement not found");
  if (settlement.toUserId !== session.user.id) throw new Error("Only the recipient can approve");
  if (settlement.status !== "PENDING") throw new Error("Already processed");

  await prisma.$transaction(async (tx) => {
    // 1. Mark as Approved
    await tx.settlement.update({
      where: { id: settlementId },
      data: { status: "APPROVED" },
    });

    // 2. Update Balance Table
    const { fromUserId, toUserId, amount, groupId } = settlement;
    const userAId = fromUserId < toUserId ? fromUserId : toUserId;
    const userBId = fromUserId < toUserId ? toUserId : fromUserId;
    const change = fromUserId === userAId ? -amount : amount;

    await tx.balance.upsert({
      where: { groupId_userAId_userBId: { groupId, userAId, userBId } },
      update: { amount: { increment: change } },
      create: { groupId, userAId, userBId, amount: change },
    });

    // 3. Activity Log
    await tx.activityLog.create({
      data: {
        groupId,
        userId: fromUserId,
        action: "SETTLE",
        metadata: { amount, toUserId, status: "APPROVED" },
      },
    });
  });

  await notifyGroupActivity(
    settlement.groupId,
    "SETTLE",
    { amount: settlement.amount, toUserId: settlement.toUserId, status: "APPROVED" },
    settlement.fromUserId
  );

  revalidatePath(`/groups/${settlement.groupId}`);
}

export async function rejectSettlement(settlementId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
  });

  if (!settlement || settlement.toUserId !== session.user.id) throw new Error("Unauthorized");

  await prisma.settlement.update({
    where: { id: settlementId },
    data: { status: "REJECTED" },
  });

  revalidatePath(`/groups/${settlement.groupId}`);
}

export async function getPendingSettlements(groupId: string, userId: string) {
  return await prisma.settlement.findMany({
    where: {
      groupId,
      toUserId: userId,
      status: "PENDING",
    },
    include: {
      fromUser: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
