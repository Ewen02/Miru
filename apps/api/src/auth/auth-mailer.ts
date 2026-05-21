import { Resend } from "resend";
import {
  passwordResetTemplate,
  verifyEmailTemplate,
  welcomeTemplate,
} from "@shared/mail/templates";

/**
 * Module-scope mailer used by the Better Auth callbacks. Better Auth's auth.ts
 * is loaded before the NestJS DI graph, so it cannot inject MailService — we
 * instantiate the SDK directly here and reuse the same HTML templates.
 *
 * When RESEND_API_KEY is missing, sends are no-op (logged) so dev still works.
 */
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.MAIL_FROM ?? "Miru <onboarding@resend.dev>";
const client = apiKey ? new Resend(apiKey) : null;

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!client) {
    // eslint-disable-next-line no-console
    console.warn(`[auth-mailer:dry-run] to=${to} subject=${subject}`);
    return;
  }
  const { error } = await client.emails.send({ from, to, subject, html });
  if (error) {
    // eslint-disable-next-line no-console
    console.error(`[auth-mailer] send failed (${to}): ${error.message}`);
  }
}

export const authMailer = {
  async sendVerify(to: string, verifyUrl: string): Promise<void> {
    await send(to, "Confirme ton adresse e-mail", verifyEmailTemplate({ verifyUrl }));
  },

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    await send(to, "Réinitialise ton mot de passe Miru", passwordResetTemplate({ resetUrl }));
  },

  async sendWelcome(to: string, name: string, ctaUrl: string): Promise<void> {
    await send(to, "Bienvenue sur Miru", welcomeTemplate({ name, ctaUrl }));
  },
};
