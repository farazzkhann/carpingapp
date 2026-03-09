import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: env.FROM_EMAIL,
    to,
    subject: "Reset your Carping password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1A73E8; margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #6B7280; margin-bottom: 24px;">
          Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #1A73E8; color: #fff;
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  font-weight: 600; margin-bottom: 24px;">
          Reset Password
        </a>
        <p style="color: #9CA3AF; font-size: 13px;">
          If you didn't request this, ignore this email — your password won't change.
        </p>
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 16px;">
          Or copy this link: ${resetUrl}
        </p>
      </div>
    `,
  });
}
