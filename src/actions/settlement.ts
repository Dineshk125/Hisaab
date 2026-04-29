"use server";

import prisma from "../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { pusherServer } from "../lib/pusher";

const SettlementSchema = z.object({
  amount: z.number().positive(),
  groupId: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
});

export async function settleUp(data: z.infer<typeof SettlementSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const { amount, groupId, fromUserId, toUserId } = SettlementSchema.parse(data);

  // 1. Create Settlement record
  const settlement = await prisma.settlement.create({
    data: {
      amount,
      groupId,
      fromUserId,
      toUserId,
    },
  });

  // 2. Update Balances
  // fromUserId is paying toUserId.
  // Debt of fromUserId towards toUserId decreases.
  const userAId = fromUserId < toUserId ? fromUserId : toUserId;
  const userBId = fromUserId < toUserId ? toUserId : fromUserId;

  // If fromUserId is userA, amount they owe userB decreases (amount becomes less positive).
  // If fromUserId is userB, amount userA owes them increases (amount becomes more positive, but wait).
  // Let's re-verify:
  // userA owes userB 'amount' in DB.
  // If userA pays userB $X, DB amount decreases by $X.
  // If userB pays userA $X, DB amount increases by $X.
  const change = fromUserId === userAId ? -amount : amount;

  await prisma.balance.update({
    where: {
      groupId_userAId_userBId: {
        groupId,
        userAId,
        userBId,
      },
    },
    data: {
      amount: { increment: change },
    },
  });

  // 3. Activity Log
  await prisma.activityLog.create({
    data: {
      groupId,
      userId: fromUserId,
      action: "SETTLE",
      metadata: { amount, toUserId },
    },
  });

  await pusherServer?.trigger(`group-${groupId}`, "settlement", {
    amount,
    fromUserId,
    toUserId,
  });

  revalidatePath(`/groups/${groupId}`);
  return settlement;
}
