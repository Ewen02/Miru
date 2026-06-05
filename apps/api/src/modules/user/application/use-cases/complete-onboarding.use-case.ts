import { Inject, Injectable } from "@nestjs/common";
import { WatchStatus } from "@miru/types";
import { ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { WatchlistEntryEntity } from "@modules/watchlist/domain/entities/watchlist-entry.entity";
import { WATCHLIST_REPOSITORY } from "@modules/watchlist/application/tokens";
import type { WatchlistRepositoryPort } from "@modules/watchlist/domain/ports/watchlist-repository.port";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";
import { USER_REPOSITORY } from "../tokens";

const MAX_PICKS = 10;
const MAX_GENRES = 24;

export interface CompleteOnboardingInput {
  userId: string;
  /** Anime ids picked in step 2 — added as WatchlistEntry PLANNED if absent. */
  animeIds: string[];
  /** Genre slugs picked in step 3 — stored on UserPreferences for cold-start. */
  genres: string[];
}

export interface CompleteOnboardingResult {
  onboardedAt: Date;
  picksAdded: number;
  picksAlreadyPresent: number;
  genresStored: number;
}

/**
 * Persist the investment the user just made in /onboard:
 *  - picks become WatchlistEntry PLANNED rows (idempotent — re-running the
 *    flow doesn't churn the watchlist)
 *  - genres land on UserPreferences.favoriteGenres for the cold-start scorer
 *  - User.onboardedAt is stamped (first-finish only)
 *
 * Lives in the user module because user owns the onboarding state. Calls
 * into the watchlist repository directly via its exported port token —
 * no event indirection, the user is waiting for the response.
 */
@Injectable()
export class CompleteOnboardingUseCase
  implements UseCase<CompleteOnboardingInput, CompleteOnboardingResult>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    @Inject(WATCHLIST_REPOSITORY) private readonly watchlist: WatchlistRepositoryPort,
  ) {}

  async execute(input: CompleteOnboardingInput): Promise<CompleteOnboardingResult> {
    const animeIds = dedupe(input.animeIds).slice(0, MAX_PICKS);
    const genres = dedupe(input.genres.map((g) => g.toLowerCase().trim()).filter(Boolean)).slice(
      0,
      MAX_GENRES,
    );

    if (animeIds.some((id) => !id || typeof id !== "string")) {
      throw new ValidationException("animeIds must be non-empty strings");
    }

    // 1. Add picks as PLANNED. We don't emit WATCHLIST_ADDED here because
    //    flooding the activity feed with a 10-item dump from a brand-new
    //    user adds noise without value — the feed will catch real adds.
    let picksAdded = 0;
    let picksAlreadyPresent = 0;
    for (const animeId of animeIds) {
      const existing = await this.watchlist.findOne(input.userId, animeId);
      if (existing) {
        picksAlreadyPresent += 1;
        continue;
      }
      const entry = WatchlistEntryEntity.create({
        userId: input.userId,
        animeId,
        status: WatchStatus.PLANNED,
        currentEpisode: 0,
        rating: null,
        isFavorite: false,
        startedAt: null,
        completedAt: null,
      });
      try {
        await this.watchlist.save(entry);
        picksAdded += 1;
      } catch {
        // The pick may reference an anime that no longer exists, or a race
        // created the same entry meanwhile. Either way, the right move is
        // to skip and keep going — never block onboarding on a single pick.
        picksAlreadyPresent += 1;
      }
    }

    // 2. Stash genres on preferences. updatePreferences upserts.
    await this.users.updatePreferences(input.userId, { favoriteGenres: genres });

    // 3. Stamp onboardedAt (only the first time — markOnboarded is idempotent).
    await this.users.markOnboarded(input.userId);
    const onboardedAt = (await this.users.onboardedAt(input.userId)) ?? new Date();

    return { onboardedAt, picksAdded, picksAlreadyPresent, genresStored: genres.length };
  }
}

function dedupe<T>(items: readonly T[]): T[] {
  return Array.from(new Set(items));
}
