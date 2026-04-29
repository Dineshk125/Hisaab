"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return notifications;
}

export async function markAsRead(notificationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.notification.update({
    where: { 
      id: notificationId,
      userId: session.user.id 
    },
    data: { read: true },
  });

  revalidatePath("/profile/notifications");
  return { success: true };
}

export async function markAllAsRead() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.notification.updateMany({
    where: { 
      userId: session.user.id,
      read: false 
    },
    data: { read: true },
  });

  revalidatePath("/profile/notifications");
  return { success: true };
}
