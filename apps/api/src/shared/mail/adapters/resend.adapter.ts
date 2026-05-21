import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import type { MailPort, SendMailInput } from "../mail.port";

/**
 * Resend implementation of MailPort.
 *
 * When `RESEND_API_KEY` is missing (dev / CI), the adapter silently logs the
 * intended message instead of sending — keeps the dev loop unblocked without
 * exposing live credentials.
 */
@Injectable()
export class ResendMailAdapter implements MailPort {
  private readonly logger = new Logger(ResendMailAdapter.name);
  private readonly client: Resend | null;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.from = process.env.MAIL_FROM ?? "Miru <onboarding@resend.dev>";
    this.client = apiKey ? new Resend(apiKey) : null;
    if (!this.client) {
      this.logger.warn(
        "RESEND_API_KEY not set — emails will be logged instead of sent.",
      );
    }
  }

  async send({ to, subject, html }: SendMailInput): Promise<void> {
    if (!this.client) {
      this.logger.log(`[mail:dry-run] to=${to} subject=${subject}`);
      return;
    }
    const { error } = await this.client.emails.send({
      from: this.from,
      to,
      subject,
      html,
    });
    if (error) {
      this.logger.error(`Resend send failed (to=${to}): ${error.message}`);
      throw new Error(`Mail send failed: ${error.message}`);
    }
  }
}
