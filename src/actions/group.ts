"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { nanoid } from "nanoid";

import { sendJoinEmail, sendInviteEmail, notifyGroupActivity } from "@/lib/mail";

const CreateGroupSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters"),
  description: z.string().optional(),
  members: z.array(z.string()).optional(),
});

export async function createGroup(formData: z.infer<typeof CreateGroupSchema>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { name, description, members = [] } = CreateGroupSchema.parse(formData);
  const inviteCode = nanoid(8);

  // Find users who already exist
  const existingUsers = await prisma.user.findMany({
    where: {
      email: {
        in: members.filter(email => email !== session.user.email),
      },
    },
    select: { id: true, email: true },
  });

  const existingEmails = existingUsers.map(u => u.email);
  const pendingInvites = members.filter(email => 
    email !== session.user.email && !existingEmails.includes(email)
  );

  const group = await prisma.group.create({
    data: {
      name,
      description,
      inviteCode,
      adminId: session.user.id,
      members: {
        create: [
          {
            userId: session.user.id,
            role: "ADMIN",
          },
          ...existingUsers.map((user) => ({
            userId: user.id,
            role: "MEMBER",
          })),
        ],
      },
      // @ts-ignore - Prisma client needs regeneration
      ...( (prisma as any).invitation ? {
        invitations: {
          create: pendingInvites.map(email => ({
            email,
            invitedBy: session.user.id
          }))
        }
      } : {})
    },
  });

  await prisma.activityLog.create({
    data: {
      groupId: group.id,
      userId: session.user.id,
      action: "CREATE_GROUP",
      metadata: { 
        groupName: name,
        initialMembers: existingUsers.length,
        invitations: pendingInvites.length
      },
    },
  });

  // Send Emails to added / invited members
  for (const user of existingUsers) {
    await sendJoinEmail({
      to: user.email!,
      groupName: name,
      invitedBy: session.user.name || session.user.email || "Someone",
    });
  }

  for (const email of pendingInvites) {
    await sendInviteEmail({
      to: email,
      groupName: name,
      invitedBy: session.user.name || session.user.email || "Someone",
    });
  }

  revalidatePath("/dashboard");
  return group;
}

export async function getGroups() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return [];
  }

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          members: {
            include: { user: true }
          }
        }
      }
    }
  });

  return memberships.map(m => m.group);
}

export async function updateGroup(groupId: string, data: { name: string; description?: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { adminId: true },
  });

  if (group?.adminId !== session.user.id) {
    throw new Error("Only admins can edit group details");
  }

  const updatedGroup = await prisma.group.update({
    where: { id: groupId },
    data: {
      name: data.name,
      description: data.description,
    },
  });

  await prisma.activityLog.create({
    data: {
      groupId,
      userId: session.user.id,
      action: "UPDATE_GROUP",
      metadata: { newName: data.name },
    },
  });

  await notifyGroupActivity(groupId, "UPDATE_GROUP", { newName: data.name }, session.user.id);

  revalidatePath(`/groups/${groupId}`);
  return updatedGroup;
}

export async function getGroupByInviteCode(code: string) {
  return await prisma.group.findUnique({
    where: { inviteCode: code },
    include: {
      members: {
        include: { user: true }
      },
      _count: {
        select: { members: true }
      }
    }
  });
}

export async function joinGroupByInviteCode(code: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Please login to join");

  const group = await prisma.group.findUnique({
    where: { inviteCode: code },
    select: { id: true }
  });

  if (!group) throw new Error("Invalid invite code");

  // Check if already a member
  const existingMember = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: group.id
      }
    }
  });

  if (existingMember) return { groupId: group.id };

  await prisma.groupMember.create({
    data: {
      userId: session.user.id,
      groupId: group.id,
      role: "MEMBER"
    }
  });

  await prisma.activityLog.create({
    data: {
      groupId: group.id,
      userId: session.user.id,
      action: "JOIN_GROUP",
      metadata: { method: "INVITE_CODE" }
    }
  });

  await notifyGroupActivity(group.id, "JOIN_GROUP", { method: "INVITE_CODE" }, session.user.id);

  revalidatePath(`/groups/${group.id}`);
  revalidatePath("/dashboard");
  
  return { groupId: group.id };
}
