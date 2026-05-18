import { AnimeStatus, AnimeFormat } from "@miru/types";
import {
  AnimeEntity,
  AnimeRelationSummary,
  CharacterSummary,
  EpisodeSummary,
} from "../anime.entity";

interface OverrideProps {
  id?: string;
  slug?: string;
  title?: string;
  status?: AnimeStatus;
  format?: AnimeFormat;
  externalAnilistId?: number | null;
  relations?: AnimeRelationSummary[];
  characters?: CharacterSummary[];
  episodes?: EpisodeSummary[];
  averageRating?: number | null;
}

/**
 * Build an AnimeEntity with sane defaults for tests.
 * Override only the fields the test cares about.
 */
export function makeAnimeEntity(overrides: OverrideProps = {}): AnimeEntity {
  const id = overrides.id ?? "anime-1";
  return AnimeEntity.create(id, {
    slug: overrides.slug ?? "test-anime",
    title: overrides.title ?? "Test Anime",
    titleJp: null,
    titleEn: null,
    synopsis: null,
    status: overrides.status ?? AnimeStatus.AIRING,
    format: overrides.format ?? AnimeFormat.TV,
    episodeCount: null,
    year: 2025,
    studioName: null,
    studioSlug: null,
    coverUrl: null,
    bannerUrl: null,
    accentHex: null,
    averageRating: overrides.averageRating ?? 8.5,
    externalAnilistId: overrides.externalAnilistId ?? 1,
    externalMalId: null,
    genres: [],
    episodes: overrides.episodes ?? [],
    characters: overrides.characters ?? [],
    relations: overrides.relations ?? [],
  });
}
