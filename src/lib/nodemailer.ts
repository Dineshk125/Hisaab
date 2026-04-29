import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Not your regular password, but an App Password
  },
});

export async function sendNodemailer({ to, subject, htmlContent }: { to: string; subject: string; htmlContent: string }) {
  try {
    const info = await transporter.sendMail({
      from: `"Hisaab Premium" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`✅ Email sent successfully via Nodemailer. MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    throw error;
  }
}
