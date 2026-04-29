"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { pusherServer } from "@/lib/pusher";

const AddMemberSchema = z.object({
  groupId: z.string(),
  email: z.string().email("Invalid email address"),
});

export async function addMemberByEmail(groupId: string, email: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userToAdd = await prisma.user.findUnique({
    where: { email },
  });

  if (!userToAdd) {
    throw new Error("User not found. Ask them to sign up first!");
  }

  const existingMember = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: userToAdd.id,
        groupId,
      },
    },
  });

  if (existingMember) {
    throw new Error("User is already a member of this group");
  }

  const member = await prisma.groupMember.create({
    data: {
      userId: userToAdd.id,
      groupId,
      role: "MEMBER",
    },
  });

  await prisma.activityLog.create({
    data: {
      groupId,
      userId: session.user.id,
      action: "ADD_MEMBER",
      metadata: { addedBy: session.user.name, newMember: userToAdd.name },
    },
  });

  revalidatePath(`/groups/${groupId}`);
  return member;
}

export async function removeMember(groupId: string, userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { adminId: true },
  });

  if (group?.adminId !== session.user.id && session.user.id !== userId) {
    throw new Error("Only admins can remove other members");
  }

  await prisma.groupMember.delete({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  });

  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}

export async function sendReminder(data: {
  groupId: string;
  toUserId: string;
  amount: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { groupId, toUserId, amount } = data;

  // 1. Create Notification in DB
  await prisma.notification.create({
    data: {
      userId: toUserId,
      title: "Payment Reminder 🔔",
      message: `${session.user.name} reminded you about the ₹${amount.toFixed(2)} debt in your group.`,
      type: "SETTLE"
    }
  });

  // 2. Real-time push via Pusher
  try {
    await pusherServer?.trigger(`user-${toUserId}`, "notification", {
      title: "New Reminder",
      message: `${session.user.name} is waiting for payment.`,
    });
  } catch (err) {}

  // 3. Log the activity
  await prisma.activityLog.create({
    data: {
      groupId,
      userId: session.user.id,
      action: "REMIND",
      metadata: { toUserId, amount }
    }
  });

  return { success: true };
}

export async function searchUsers(query: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!query || query.length < 3) return [];

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ],
      NOT: { id: session.user.id }, // Exclude self
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
    take: 5,
  });

  return users;
}

export async function claimPendingInvitations() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) return;

  // @ts-ignore - Prisma client needs regeneration
  if (!(prisma as any).invitation) return;

  const invitations = await (prisma as any).invitation.findMany({
    where: { email: session.user.email },
  });

  if (invitations.length === 0) return;

  for (const invitation of invitations) {
    await prisma.groupMember.upsert({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: invitation.groupId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        groupId: invitation.groupId,
        role: "MEMBER",
      },
    });

    await prisma.activityLog.create({
      data: {
        groupId: invitation.groupId,
        userId: session.user.id,
        action: "JOIN_GROUP",
        metadata: { method: "INVITATION" },
      },
    });
  }

  // @ts-ignore - Prisma client needs regeneration
  if ((prisma as any).invitation) {
    await (prisma as any).invitation.deleteMany({
      where: { email: session.user.email },
    });
  }

  revalidatePath("/dashboard");
}
