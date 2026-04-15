// Enums remplacés par const objects + type unions — compatibles avec Node strip-only TS
// et avec les imports runtime depuis des sources non compilées.

export const AnimeStatus = {
  AIRING: "AIRING",
  FINISHED: "FINISHED",
  ANNOUNCED: "ANNOUNCED",
  HIATUS: "HIATUS",
} as const;
export type AnimeStatus = (typeof AnimeStatus)[keyof typeof AnimeStatus];

export const AnimeFormat = {
  TV: "TV",
  MOVIE: "MOVIE",
  OVA: "OVA",
  ONA: "ONA",
  SPECIAL: "SPECIAL",
} as const;
export type AnimeFormat = (typeof AnimeFormat)[keyof typeof AnimeFormat];

export const WatchStatus = {
  WATCHING: "WATCHING",
  COMPLETED: "COMPLETED",
  PLANNED: "PLANNED",
  DROPPED: "DROPPED",
  ON_HOLD: "ON_HOLD",
} as const;
export type WatchStatus = (typeof WatchStatus)[keyof typeof WatchStatus];

export const CharacterRole = {
  MAIN: "MAIN",
  SUPPORTING: "SUPPORTING",
  BACKGROUND: "BACKGROUND",
} as const;
export type CharacterRole = (typeof CharacterRole)[keyof typeof CharacterRole];

// Shared interfaces (used across apps, distinct from Prisma models)
export interface AnimeCard {
  id: string;
  slug: string;
  title: string;
  titleJp: string | null;
  coverUrl: string | null;
  bannerUrl: string | null;
  status: AnimeStatus;
  format: AnimeFormat;
  year: number | null;
  studioName: string | null;
  averageRating: number | null;
  genres: string[];
}

export interface GenreCard {
  slug: string;
  name: string;
}

export interface EpisodeItem {
  id: string;
  number: number;
  title: string | null;
  titleJp: string | null;
  titleRomaji: string | null;
  duration: number | null;
  airedAt: Date | null;
  filler: boolean;
  recap: boolean;
  thumbnail: string | null;
  url: string | null;
}

export interface AnimeDetail extends AnimeCard {
  titleEn: string | null;
  synopsis: string | null;
  episodeCount: number | null;
  trailerUrl: string | null;
  episodes: EpisodeItem[];
}

export interface CharacterCard {
  id: string;
  name: string;
  nameJp: string | null;
  imageUrl: string | null;
  role: CharacterRole;
  voiceActor: string | null;
}

export interface UserAnimeEntry {
  animeId: string;
  status: WatchStatus;
  currentEpisode: number;
  rating: number | null;
  isFavorite: boolean;
}
