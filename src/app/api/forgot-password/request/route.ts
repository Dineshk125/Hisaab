import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendResetOTP } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if user exists or not, but in this case the user wants it to work
      return NextResponse.json({ message: "No account found with this email" }, { status: 404 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email,
          token: otp,
        },
      },
      update: {
        expires,
      },
      create: {
        identifier: email,
        token: otp,
        expires,
      },
    });

    // Send via Brevo
    await sendResetOTP(email, otp);

    return NextResponse.json({ message: "Reset OTP sent successfully" });
  } catch (error) {
    console.error("Forgot password request error:", error);
    return NextResponse.json({ message: "Failed to send reset code" }, { status: 500 });
  }
}
