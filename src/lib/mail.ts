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
