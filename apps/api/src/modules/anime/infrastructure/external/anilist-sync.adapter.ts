import { Injectable, Logger } from "@nestjs/common";
import { AniListClient } from "@miru/anilist";
import type { AniListAnime } from "@miru/anilist";
import { AnimeStatus, AnimeFormat } from "@miru/types";
import { slugify } from "@shared/utils/slugify";
import { cleanSynopsis } from "@shared/utils/clean-synopsis";
import { AnimeSyncPort } from "../../domain/ports/anime-sync.port";
import { AnimeEntity } from "../../domain/entities/anime.entity";

@Injectable()
export class AniListSyncAdapter implements AnimeSyncPort {
  private readonly logger = new Logger(AniListSyncAdapter.name);
  private readonly client = new AniListClient();

  async fetchTrending(page: number, perPage: number): Promise<AnimeEntity[]> {
    const list = await this.client.getTrending(page, perPage);
    return list.map((a) => this.toDomain(a));
  }

  async fetchById(externalId: number): Promise<AnimeEntity | null> {
    try {
      const a = await this.client.getById(externalId);
      return a ? this.toDomain(a) : null;
    } catch (err) {
      this.logger.warn(`fetchById(${externalId}) failed: ${(err as Error).message}`);
      return null;
    }
  }

  async searchByTitle(query: string): Promise<AnimeEntity[]> {
    const list = await this.client.search(query);
    return list.map((a) => this.toDomain(a));
  }

  private toDomain(a: AniListAnime): AnimeEntity {
    const studioName = a.studios.nodes[0]?.name ?? null;
    const title = a.title.romaji ?? a.title.english ?? a.title.native ?? "Untitled";

    return AnimeEntity.create(`anilist-${a.id}`, {
      slug: slugify(title) || `anilist-${a.id}`,
      title,
      titleJp: a.title.native,
      titleEn: a.title.english,
      synopsis: cleanSynopsis(a.description),
      status: this.mapStatus(a.status),
      format: this.mapFormat(a.format),
      episodeCount: a.episodes,
      year: a.seasonYear,
      studioName,
      studioSlug: studioName ? slugify(studioName) : null,
      coverUrl: a.coverImage.extraLarge ?? a.coverImage.large ?? null,
      bannerUrl: a.bannerImage,
      trailerUrl: null,
      averageRating: a.averageScore != null ? a.averageScore / 10 : null,
      externalAnilistId: a.id,
      externalMalId: a.idMal,
      genres: a.genres ?? [],
      episodes: [],
    });
  }

  private mapStatus(s: string | null): AnimeStatus {
    switch (s) {
      case "RELEASING":
        return AnimeStatus.AIRING;
      case "FINISHED":
        return AnimeStatus.FINISHED;
      case "NOT_YET_RELEASED":
        return AnimeStatus.ANNOUNCED;
      case "HIATUS":
        return AnimeStatus.HIATUS;
      case "CANCELLED":
        return AnimeStatus.FINISHED;
      default:
        return AnimeStatus.FINISHED;
    }
  }

  private mapFormat(f: string | null): AnimeFormat {
    switch (f) {
      case "TV":
      case "TV_SHORT":
        return AnimeFormat.TV;
      case "MOVIE":
        return AnimeFormat.MOVIE;
      case "OVA":
        return AnimeFormat.OVA;
      case "ONA":
      case "MUSIC":
        return AnimeFormat.ONA;
      case "SPECIAL":
        return AnimeFormat.SPECIAL;
      default:
        return AnimeFormat.TV;
    }
  }
}
