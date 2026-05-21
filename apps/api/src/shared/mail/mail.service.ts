import { Inject, Injectable } from "@nestjs/common";
import { MAIL_PORT, type MailPort } from "./mail.port";
import {
  passwordResetTemplate,
  verifyEmailTemplate,
  welcomeTemplate,
} from "./templates";

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3000";

/**
 * High-level templated sends. Other modules call these methods rather than
 * the raw MailPort — keeps the subject/body in one place and makes them
 * easy to swap for a different look later.
 */
@Injectable()
export class MailService {
  constructor(@Inject(MAIL_PORT) private readonly mail: MailPort) {}

  async sendWelcome(input: { to: string; name: string }): Promise<void> {
    await this.mail.send({
      to: input.to,
      subject: "Bienvenue sur Miru",
      html: welcomeTemplate({ name: input.name, ctaUrl: `${WEB_ORIGIN}/onboard` }),
    });
  }

  async sendVerifyEmail(input: { to: string; verifyUrl: string }): Promise<void> {
    await this.mail.send({
      to: input.to,
      subject: "Confirme ton adresse e-mail",
      html: verifyEmailTemplate({ verifyUrl: input.verifyUrl }),
    });
  }

  async sendPasswordReset(input: { to: string; resetUrl: string }): Promise<void> {
    await this.mail.send({
      to: input.to,
      subject: "Réinitialise ton mot de passe Miru",
      html: passwordResetTemplate({ resetUrl: input.resetUrl }),
    });
  }
}
