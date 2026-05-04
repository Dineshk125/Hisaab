import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendMail({ to, subject, htmlContent }: { to: string; subject: string; htmlContent: string }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set. Falling back to console log for OTP.");
    console.log("\n" + "=".repeat(50));
    console.log("🔐 DEVELOPER OTP LOG (NO EMAIL CONFIG):");
    console.log(`   To: ${to}`);
    console.log(`   ${subject}`);
    console.log("=".repeat(50) + "\n");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Hisaab Premium" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`✅ Email sent successfully via Gmail. MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Gmail Error:", error);
    throw error;
  }
}

export async function sendOTP(email: string, otp: string) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #000; color: #fff;">
      <h1 style="color: #f97316; text-align: center;">Hisaab Verification</h1>
      <p style="font-size: 16px; line-height: 1.5; text-align: center;">Your one-time password (OTP) for secure access is:</p>
      <div style="font-size: 32px; font-weight: bold; text-align: center; color: #f97316; padding: 20px; background: rgba(249, 115, 22, 0.1); border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="font-size: 14px; color: #888; text-align: center;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;" />
      <p style="font-size: 12px; color: #555; text-align: center;">© 2026 Hisaab Inc. Empowering Your Financial Future.</p>
    </div>
  `;

  return sendMail({
    to: email,
    subject: `Your Hisaab OTP: ${otp}`,
    htmlContent,
  });
}

export async function sendResetOTP(email: string, otp: string) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #000; color: #fff;">
      <h1 style="color: #f97316; text-align: center;">Reset Your Password</h1>
      <p style="font-size: 16px; line-height: 1.5; text-align: center;">We received a request to reset your Hisaab password. Use the following code to proceed:</p>
      <div style="font-size: 32px; font-weight: bold; text-align: center; color: #f97316; padding: 20px; background: rgba(249, 115, 22, 0.1); border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="font-size: 14px; color: #888; text-align: center;">If you didn't request this, you can safely ignore this email. Your password won't change until you create a new one.</p>
      <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;" />
      <p style="font-size: 12px; color: #555; text-align: center;">© 2026 Hisaab Inc. Empowering Your Financial Future.</p>
    </div>
  `;

  return sendMail({
    to: email,
    subject: `Reset Your Hisaab Password: ${otp}`,
    htmlContent,
  });
}

import prisma from "@/lib/prisma";

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export async function sendJoinEmail({
  to,
  groupName,
  invitedBy,
}: {
  to: string;
  groupName: string;
  invitedBy: string;
}) {
  const baseUrl = getBaseUrl();
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #000; color: #fff;">
      <h1 style="color: #f97316; text-align: center;">You've been added to ${groupName}!</h1>
      <p style="font-size: 16px; line-height: 1.5; text-align: center;">Hi there!</p>
      <p style="font-size: 16px; line-height: 1.5; text-align: center;">You have been added to the group <strong>${groupName}</strong> by <strong>${invitedBy}</strong> on Hisaab.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${baseUrl}" style="font-size: 18px; font-weight: bold; color: #fff; background-color: #f97316; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Go to Dashboard</a>
      </div>
      <p style="font-size: 14px; color: #888; text-align: center;">Start managing your shared expenses immediately.</p>
      <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;" />
      <p style="font-size: 12px; color: #555; text-align: center;">© 2026 Hisaab Inc. Empowering Your Financial Future.</p>
    </div>
  `;

  return sendMail({
    to,
    subject: `You've been added to ${groupName} on Hisaab`,
    htmlContent,
  });
}

export async function sendInviteEmail({
  to,
  groupName,
  invitedBy,
}: {
  to: string;
  groupName: string;
  invitedBy: string;
}) {
  const baseUrl = getBaseUrl();
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #000; color: #fff;">
      <h1 style="color: #f97316; text-align: center;">Join Hisaab & ${groupName}!</h1>
      <p style="font-size: 16px; line-height: 1.5; text-align: center;">Hi there!</p>
      <p style="font-size: 16px; line-height: 1.5; text-align: center;"><strong>${invitedBy}</strong> has invited you to join their group <strong>${groupName}</strong> on Hisaab.</p>
      <p style="font-size: 16px; line-height: 1.5; text-align: center;">To join the group, please register first using the link below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${baseUrl}/register" style="font-size: 18px; font-weight: bold; color: #fff; background-color: #f97316; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Register Now</a>
      </div>
      <p style="font-size: 14px; color: #888; text-align: center;">Once registered, you'll be automatically added to the group when you view your dashboard.</p>
      <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;" />
      <p style="font-size: 12px; color: #555; text-align: center;">© 2026 Hisaab Inc. Empowering Your Financial Future.</p>
    </div>
  `;

  return sendMail({
    to,
    subject: `Invitation to join ${groupName} on Hisaab`,
    htmlContent,
  });
}

export async function notifyGroupActivity(groupId: string, action: string, metadata: any, triggerUserId?: string) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: { user: true }
        }
      }
    });

    if (!group) return;

    let userName = "Someone";
    if (triggerUserId) {
      const u = await prisma.user.findUnique({ where: { id: triggerUserId } });
      if (u?.name) userName = u.name;
    }

    let actionDesc = "";
    if (action === "ADD_EXPENSE") {
      actionDesc = `${userName} added an expense: "${metadata.description}" of ₹${metadata.amount}`;
    } else if (action === "UPDATE_EXPENSE") {
      actionDesc = `${userName} updated the expense: "${metadata.description}" to ₹${metadata.amount}`;
    } else if (action === "DELETE_EXPENSE") {
      actionDesc = `${userName} deleted the expense: "${metadata.description}" of ₹${metadata.amount}`;
    } else if (action === "ADD_MEMBER") {
      actionDesc = `${userName} added a new member: ${metadata.newMember || "a user"}`;
    } else if (action === "JOIN_GROUP") {
      actionDesc = `${userName} joined the group`;
    } else if (action === "REMOVE_MEMBER") {
      actionDesc = `${userName} removed a member from the group`;
    } else if (action === "UPDATE_GROUP") {
      actionDesc = `${userName} updated the group details`;
    } else if (action === "SETTLE") {
      actionDesc = `${userName} settled up an amount of ₹${metadata.amount}`;
    } else if (action === "REMIND") {
      actionDesc = `${userName} sent a payment reminder for ₹${metadata.amount}`;
    } else {
      actionDesc = `An activity happened in the group: ${action}`;
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #000; color: #fff;">
        <h1 style="color: #f97316; text-align: center;">Hisaab Group Notification</h1>
        <p style="font-size: 16px; line-height: 1.5; text-align: center;">There is a new update in your group <strong>${group.name}</strong>:</p>
        <div style="font-size: 18px; font-weight: bold; text-align: center; color: #f97316; padding: 20px; background: rgba(249, 115, 22, 0.1); border-radius: 8px; margin: 20px 0;">
          ${actionDesc}
        </div>
        <p style="font-size: 14px; color: #888; text-align: center;">View the full details on your Hisaab dashboard.</p>
        <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;" />
        <p style="font-size: 12px; color: #555; text-align: center;">© 2026 Hisaab Inc. Empowering Your Financial Future.</p>
      </div>
    `;

    for (const m of group.members) {
      if (m.user?.email) {
        await sendMail({
          to: m.user.email,
          subject: `New activity in ${group.name}: ${action.replace("_", " ")}`,
          htmlContent,
        });
      }
    }
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
}
