import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { VerifyStaleLinksUseCase } from "../../application/use-cases/verify-stale-links.use-case";

/**
 * Phase 4 cron. Re-verifies links not checked in the last 7 days.
 *
 * Guarded by **both** `ENABLE_SCHEDULER` (matches the project convention)
 * **and** `ENABLE_SCRAPERS` (Phase 4 feature flag). Either disabled →
 * the cron is a no-op. Triggers no outbound request when off.
 */
const SCHEDULER_ENABLED = process.env.ENABLE_SCHEDULER === "true";
const SCRAPERS_ENABLED = process.env.ENABLE_SCRAPERS === "true";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class StreamingLinkScheduler {
  private readonly logger = new Logger(StreamingLinkScheduler.name);

  constructor(private readonly verifyUseCase: VerifyStaleLinksUseCase) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async runVerifyCron(): Promise<void> {
    if (!SCHEDULER_ENABLED || !SCRAPERS_ENABLED) return;

    const olderThan = new Date(Date.now() - SEVEN_DAYS_MS);
    const result = await this.verifyUseCase.execute({ olderThan, limit: 100 });
    this.logger.log(
      `Verify cron: ${result.checked} checked, ${result.brokenNow} broken, ${result.refreshed} refreshed`,
    );
  }
}
