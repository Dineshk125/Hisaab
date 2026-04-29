import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Verify OTP
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: otp,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return NextResponse.json({ message: "Invalid or expired reset code" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    // Delete used OTP
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
