import { Injectable, Inject, Logger } from "@nestjs/common";
import { AniListClient, AniListUnavailableError } from "@miru/anilist";
import type { AniListAnime } from "@miru/anilist";
import { AnimeStatus, AnimeFormat, CharacterRole } from "@miru/types";
import { slugify } from "@shared/utils/slugify";
import { cleanSynopsis } from "@shared/utils/clean-synopsis";
import { extractAccentHex } from "@shared/utils/extract-accent-hex";
import { AnimeSyncPort, MediaSeason, StreamingEpisodeInput } from "../../domain/ports/anime-sync.port";
import {
  AnimeEntity,
  AnimePlatformSummary,
  AnimeRelationSummary,
  CharacterSummary,
  RelationType,
} from "../../domain/entities/anime.entity";

const ALLOWED_RELATION_TYPES = new Set<RelationType>([
  "SEQUEL",
  "PREQUEL",
  "SIDE_STORY",
  "SPIN_OFF",
]);

function isAllowedRelationType(value: string): value is RelationType {
  return (ALLOWED_RELATION_TYPES as Set<string>).has(value);
}
import { ANILIST_CLIENT } from "../../application/tokens";

@Injectable()
export class AniListSyncAdapter implements AnimeSyncPort {
  private readonly logger = new Logger(AniListSyncAdapter.name);

  constructor(@Inject(ANILIST_CLIENT) private readonly client: AniListClient) {}

  async fetchTrending(page: number, perPage: number): Promise<AnimeEntity[]> {
    const list = await this.client.getTrending(page, perPage);
    return Promise.all(list.map((a) => this.toDomain(a)));
  }

  async fetchBySeason(
    season: MediaSeason,
    seasonYear: number,
    page: number,
    perPage: number,
  ): Promise<AnimeEntity[]> {
    const list = await this.client.getBySeason(season, seasonYear, page, perPage);
    return Promise.all(list.map((a) => this.toDomain(a)));
  }

  async fetchById(externalId: number): Promise<AnimeEntity | null> {
    try {
      const a = await this.client.getById(externalId);
      return a ? await this.toDomain(a) : null;
    } catch (err) {
      this.logger.warn(`fetchById(${externalId}) failed: ${(err as Error).message}`);
      return null;
    }
  }

  async searchByTitle(query: string): Promise<AnimeEntity[]> {
    const list = await this.client.search(query);
    return Promise.all(list.map((a) => this.toDomain(a)));
  }

  async fetchStreamingEpisodes(externalId: number): Promise<StreamingEpisodeInput[]> {
    try {
      const a = await this.client.getById(externalId);
      return (a.streamingEpisodes ?? [])
        .map((se, idx) => {
          const number = this.parseEpisodeNumber(se.title) ?? idx + 1;
          return {
            number,
            thumbnail: se.thumbnail ?? null,
            url: se.url ?? null,
            site: se.site ?? null,
          };
        })
        .filter((se) => se.thumbnail != null || se.url != null);
    } catch (err) {
      // Outage: surface to the caller so it can abort the batch. Per-anime
      // failures (parse error, missing data) still swallow to []. We only
      // log here in the swallow path, not on the rethrow — the batch logs
      // the outage once at its level.
      if (err instanceof AniListUnavailableError) throw err;
      this.logger.warn(`fetchStreamingEpisodes(${externalId}) failed: ${(err as Error).message}`);
      return [];
    }
  }

  private parseEpisodeNumber(title: string | null | undefined): number | null {
    if (!title) return null;
    const match = title.match(/(?:episode|ep|第)\s*(\d+)/i);
    if (match) return Number(match[1]);
    const loose = title.match(/^\s*(\d+)/);
    return loose ? Number(loose[1]) : null;
  }

  private async toDomain(a: AniListAnime): Promise<AnimeEntity> {
    const studioName = a.studios.nodes[0]?.name ?? null;
    const title = a.title.romaji ?? a.title.english ?? a.title.native ?? "Untitled";
    const coverUrl = a.coverImage.extraLarge ?? a.coverImage.large ?? null;
    const accentHex = await extractAccentHex(coverUrl);

    const relations: AnimeRelationSummary[] = (a.relations?.edges ?? [])
      .filter((edge) => isAllowedRelationType(edge.relationType))
      .map((edge) => {
        const n = edge.node;
        const title = n.title.romaji ?? n.title.english ?? n.title.native ?? `anilist-${n.id}`;
        return {
          relatedExternalAnilistId: n.id,
          relationType: edge.relationType as RelationType,
          title,
          coverUrl: n.coverImage?.extraLarge ?? n.coverImage?.large ?? null,
          format: n.format ?? null,
          year: n.seasonYear ?? null,
        };
      });

    const characters: CharacterSummary[] = (a.characters?.edges ?? []).map((edge, idx) => {
      const va = edge.voiceActors[0] ?? null;
      return {
        id: null,
        externalAnilistId: edge.node.id,
        name: edge.node.name.full,
        nameJp: edge.node.name.native ?? null,
        imageUrl: edge.node.image.large ?? null,
        role: this.mapRole(edge.role),
        voiceActorAnilistId: va?.id ?? null,
        voiceActorName: va?.name.full ?? null,
        order: idx,
      };
    });

    return AnimeEntity.create(`anilist-${a.id}`, {
      slug: slugify(title) || `anilist-${a.id}`,
      title,
      titleJp: a.title.native,
      titleEn: a.title.english,
      synopsis: cleanSynopsis(a.description ?? null),
      status: this.mapStatus(a.status ?? null),
      format: this.mapFormat(a.format ?? null),
      episodeCount: a.episodes ?? null,
      year: a.seasonYear ?? null,
      studioName,
      studioSlug: studioName ? slugify(studioName) : null,
      coverUrl,
      bannerUrl: a.bannerImage ?? null,
      accentHex,
      averageRating: a.averageScore != null ? a.averageScore / 10 : null,
      externalAnilistId: a.id,
      externalMalId: a.idMal,
      genres: a.genres ?? [],
      episodes: [],
      characters,
      relations,
      platforms: this.toPlatforms(a),
    });
  }

  /**
   * Filtre les externalLinks AniList pour ne garder que les vraies plateformes de
   * streaming et les déduplique par origin (deux entrées pour le même site = idem).
   */
  private toPlatforms(a: AniListAnime): AnimePlatformSummary[] {
    const seen = new Set<string>();
    const out: AnimePlatformSummary[] = [];

    for (const link of a.externalLinks ?? []) {
      if (link.type !== "STREAMING") continue;
      const baseUrl = this.originOf(link.url);
      if (!baseUrl || seen.has(baseUrl)) continue;
      seen.add(baseUrl);

      out.push({
        slug: slugify(link.site),
        name: link.site,
        iconUrl: link.icon ?? null,
        color: link.color ?? null,
        url: link.url,
      });
    }

    return out;
  }

  private originOf(url: string): string | null {
    try {
      return new URL(url).origin;
    } catch {
      return null;
    }
  }

  private mapRole(r: string): CharacterRole {
    switch (r) {
      case "MAIN":
        return CharacterRole.MAIN;
      case "SUPPORTING":
        return CharacterRole.SUPPORTING;
      case "BACKGROUND":
        return CharacterRole.BACKGROUND;
      default:
        return CharacterRole.SUPPORTING;
    }
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
