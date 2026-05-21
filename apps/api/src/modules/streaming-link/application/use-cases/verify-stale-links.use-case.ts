import { Inject, Injectable, Logger } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { EpisodeLinkRepositoryPort } from "../../domain/ports/episode-link-repository.port";
import { EPISODE_LINK_REPOSITORY } from "../tokens";

interface Input {
  /** Re-verify links last verified before this date. */
  olderThan: Date;
  /** Cap on links checked per run — keeps cron bounded. */
  limit?: number;
}

interface Output {
  checked: number;
  brokenNow: number;
  refreshed: number;
}

const HEAD_TIMEOUT_MS = 8000;

/**
 * Cron-driven sanity check. HEADs every stale link; 404/410 → brokenAt,
 * 2xx/3xx → bumps verifiedAt. Other errors are left as-is so transient
 * outages don't poison the data.
 */
@Injectable()
export class VerifyStaleLinksUseCase implements UseCase<Input, Output> {
  private readonly logger = new Logger(VerifyStaleLinksUseCase.name);

  constructor(
    @Inject(EPISODE_LINK_REPOSITORY)
    private readonly repo: EpisodeLinkRepositoryPort,
  ) {}

  async execute({ olderThan, limit = 50 }: Input): Promise<Output> {
    if (process.env.ENABLE_SCRAPERS !== "true") {
      return { checked: 0, brokenNow: 0, refreshed: 0 };
    }

    const stale = await this.repo.findStale(olderThan, limit);
    let brokenNow = 0;
    let refreshed = 0;

    for (const link of stale) {
      try {
        const res = await fetch(link.url, {
          method: "HEAD",
          redirect: "follow",
          signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
        });
        if (res.status === 404 || res.status === 410) {
          await this.repo.markBroken(link.id);
          brokenNow += 1;
        } else if (res.ok || (res.status >= 300 && res.status < 400)) {
          await this.repo.markVerified(link.id);
          refreshed += 1;
        }
      } catch (err) {
        this.logger.debug(
          `Verify probe inconclusive for ${link.url}: ${(err as Error).message}`,
        );
      }
    }

    return { checked: stale.length, brokenNow, refreshed };
  }
}
