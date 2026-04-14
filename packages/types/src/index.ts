// Enums
export enum AnimeStatus {
  AIRING = "AIRING",
  FINISHED = "FINISHED",
  ANNOUNCED = "ANNOUNCED",
  HIATUS = "HIATUS",
}

export enum AnimeFormat {
  TV = "TV",
  MOVIE = "MOVIE",
  OVA = "OVA",
  ONA = "ONA",
  SPECIAL = "SPECIAL",
}

export enum WatchStatus {
  WATCHING = "WATCHING",
  COMPLETED = "COMPLETED",
  PLANNED = "PLANNED",
  DROPPED = "DROPPED",
  ON_HOLD = "ON_HOLD",
}

export enum CharacterRole {
  MAIN = "MAIN",
  SUPPORTING = "SUPPORTING",
  ANTAGONIST = "ANTAGONIST",
}

// Shared interfaces (used across apps, distinct from Prisma models)
export interface AnimeCard {
  id: string;
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

export interface EpisodeItem {
  id: string;
  number: number;
  title: string | null;
  duration: number | null;
  airedAt: Date | null;
}

export interface CharacterCard {
  id: string;
  name: string;
  nameJp: string | null;
  imageUrl: string | null;
  role: CharacterRole;
}

export interface UserAnimeEntry {
  animeId: string;
  status: WatchStatus;
  currentEpisode: number;
  rating: number | null;
  isFavorite: boolean;
}
