import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOTP } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database (expire in 10 minutes)
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
    await sendOTP(email, otp);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
  }
}
