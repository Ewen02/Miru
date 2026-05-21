import { Injectable, Inject, Logger } from "@nestjs/common";
import { ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { WatchStatus } from "@miru/types";
import {
  AniListClient,
  AniListUnavailableError,
  type AniListMediaListEntry,
  type AniListMediaListStatus,
} from "@miru/anilist";
import { AnimeRepositoryPort } from "@modules/anime/domain/ports/anime-repository.port";
import { ANIME_REPOSITORY, ANILIST_CLIENT } from "@modules/anime/application/tokens";
import { WatchlistEntryEntity } from "../../domain/entities/watchlist-entry.entity";
import { WatchlistRepositoryPort } from "../../domain/ports/watchlist-repository.port";
import { WATCHLIST_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  /** AniList public username. */
  username: string;
}

interface Output {
  totalFetched: number;
  imported: number;
  skipped: number;
  /** External AniList ids that were not found in our local catalog. */
  unknownAnilistIds: number[];
}

const STATUS_MAP: Record<AniListMediaListStatus, WatchStatus> = {
  CURRENT: "WATCHING" as WatchStatus,
  PLANNING: "PLANNED" as WatchStatus,
  COMPLETED: "COMPLETED" as WatchStatus,
  DROPPED: "DROPPED" as WatchStatus,
  PAUSED: "ON_HOLD" as WatchStatus,
  REPEATING: "WATCHING" as WatchStatus,
};

@Injectable()
export class ImportAniListWatchlistUseCase implements UseCase<Input, Output> {
  private readonly logger = new Logger(ImportAniListWatchlistUseCase.name);

  constructor(
    @Inject(ANILIST_CLIENT) private readonly anilist: AniListClient,
    @Inject(ANIME_REPOSITORY) private readonly animes: AnimeRepositoryPort,
    @Inject(WATCHLIST_REPOSITORY) private readonly watchlist: WatchlistRepositoryPort,
  ) {}

  async execute({ userId, username }: Input): Promise<Output> {
    const cleaned = username.trim();
    if (cleaned.length < 2 || cleaned.length > 50) {
      throw new ValidationException("Username must be between 2 and 50 characters");
    }

    let entries: AniListMediaListEntry[];
    try {
      entries = await this.anilist.getUserMediaList(cleaned);
    } catch (err) {
      if (err instanceof AniListUnavailableError) {
        throw new ValidationException(
          "AniList is unavailable right now — try again in a few minutes.",
        );
      }
      // Common case: 404 when username doesn't exist or list is private.
      this.logger.warn(`getUserMediaList failed for "${cleaned}": ${(err as Error).message}`);
      throw new ValidationException(
        "Username introuvable, ou la liste est privée. Vérifie l'orthographe et le réglage de confidentialité côté AniList.",
      );
    }

    if (entries.length === 0) {
      return { totalFetched: 0, imported: 0, skipped: 0, unknownAnilistIds: [] };
    }

    // Resolve external AniList ids → local anime ids in one shot.
    const anilistIds = entries.map((e) => e.mediaId);
    const slugByAnilistId = await this.animes.findSlugsByAnilistIds(anilistIds);

    // Re-fetch anime entities by slug to get the local cuid id. The port's
    // findSlugsByAnilistIds returns slug only; we resolve id below.
    const slugs = Array.from(slugByAnilistId.values());
    if (slugs.length === 0) {
      return {
        totalFetched: entries.length,
        imported: 0,
        skipped: entries.length,
        unknownAnilistIds: anilistIds,
      };
    }

    // Map slug → id by reading each matched anime — cheap because batched.
    const idBySlug = new Map<string, string>();
    for (const slug of slugs) {
      const anime = await this.animes.findBySlug(slug);
      if (anime) idBySlug.set(slug, anime.id);
    }

    let imported = 0;
    let skipped = 0;
    const unknownAnilistIds: number[] = [];

    for (const entry of entries) {
      const slug = slugByAnilistId.get(entry.mediaId);
      const animeId = slug ? idBySlug.get(slug) : undefined;
      if (!animeId) {
        unknownAnilistIds.push(entry.mediaId);
        skipped += 1;
        continue;
      }

      const status = STATUS_MAP[entry.status];
      const rating = entry.score != null && entry.score > 0 ? Math.round(entry.score) : null;

      const watchlistEntry = WatchlistEntryEntity.create({
        userId,
        animeId,
        status,
        currentEpisode: entry.progress,
        rating,
        isFavorite: false,
        startedAt: this.fuzzyToDate(entry.startedAt),
        completedAt: this.fuzzyToDate(entry.completedAt),
      });

      await this.watchlist.save(watchlistEntry);
      imported += 1;
    }

    this.logger.log(
      `AniList import for ${userId}: ${imported}/${entries.length} entries (${skipped} skipped)`,
    );

    return {
      totalFetched: entries.length,
      imported,
      skipped,
      unknownAnilistIds,
    };
  }

  private fuzzyToDate(
    fuzzy: { year?: number | null; month?: number | null; day?: number | null } | null | undefined,
  ): Date | null {
    if (!fuzzy?.year) return null;
    // AniList months/days are 1-indexed; default to Jan 1 when partial.
    return new Date(Date.UTC(fuzzy.year, (fuzzy.month ?? 1) - 1, fuzzy.day ?? 1));
  }
}
