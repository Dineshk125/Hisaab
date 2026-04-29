"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { 
  name?: string; 
  upiId?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      upiId: data.upiId,
      bankAccountNumber: data.bankAccountNumber,
      ifscCode: data.ifscCode,
    },
  });

  revalidatePath("/profile");
  return updatedUser;
}

export async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      upiId: true,
      bankAccountNumber: true,
      ifscCode: true,
    }
  });
}
