import { Inject, Injectable } from "@nestjs/common";
import { MAIL_PORT, type MailPort } from "./mail.port";
import {
  dayThreeNurtureTemplate,
  episodeAiredTemplate,
  passwordResetTemplate,
  reviewReplyTemplate,
  verifyEmailTemplate,
  weeklyRecapTemplate,
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

  /** S2-02 — fires when a tracked episode airs and the user opts in. */
  async sendEpisodeAired(input: {
    to: string;
    animeTitle: string;
    animeSlug: string;
    episodeNumber: number;
    episodeTitle: string | null;
    coverUrl: string | null;
  }): Promise<void> {
    await this.mail.send({
      to: input.to,
      subject: `${input.animeTitle} — épisode ${input.episodeNumber}`,
      html: episodeAiredTemplate({
        animeTitle: input.animeTitle,
        episodeNumber: input.episodeNumber,
        episodeTitle: input.episodeTitle,
        animeUrl: `${WEB_ORIGIN}/anime/${input.animeSlug}`,
        coverUrl: input.coverUrl,
      }),
    });
  }

  /** S2-03 — Sunday 20h digest. */
  async sendWeeklyRecap(input: {
    to: string;
    firstName: string;
    episodesWatched: number;
    animesCompleted: number;
    year: number;
  }): Promise<void> {
    await this.mail.send({
      to: input.to,
      subject: "Ta semaine sur Miru",
      html: weeklyRecapTemplate({
        firstName: input.firstName,
        episodesWatched: input.episodesWatched,
        animesCompleted: input.animesCompleted,
        recapUrl: `${WEB_ORIGIN}/year-in-review/${input.year}`,
      }),
    });
  }

  /** S2-04 — someone replied to one of the user's reviews. */
  async sendReviewReply(input: {
    to: string;
    replierName: string;
    animeTitle: string;
    excerpt: string;
    reviewId: string;
  }): Promise<void> {
    await this.mail.send({
      to: input.to,
      subject: `${input.replierName} a répondu à ton avis`,
      html: reviewReplyTemplate({
        replierName: input.replierName,
        animeTitle: input.animeTitle,
        excerpt: input.excerpt,
        reviewUrl: `${WEB_ORIGIN}/reviews/${input.reviewId}`,
      }),
    });
  }

  /** S2-08 — day-3 nurture, gentle re-engagement. */
  async sendDayThreeNurture(input: {
    to: string;
    firstName: string;
    watchlistCount: number;
  }): Promise<void> {
    await this.mail.send({
      to: input.to,
      subject: "Pour toi, sur Miru",
      html: dayThreeNurtureTemplate({
        firstName: input.firstName,
        watchlistCount: input.watchlistCount,
        forYouUrl: `${WEB_ORIGIN}/for-you`,
      }),
    });
  }
}
