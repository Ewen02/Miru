export interface AniListAnime {
  id: number;
  idMal: number | null;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
  description: string | null;
  coverImage: {
    large: string | null;
    extraLarge: string | null;
    color: string | null;
  };
  bannerImage: string | null;
  format: string | null;
  status: string | null;
  season: string | null;
  seasonYear: number | null;
  episodes: number | null;
  duration: number | null;
  genres: string[];
  averageScore: number | null;
  studios: { nodes: { name: string }[] };
  characters: {
    edges: AniListCharacterEdge[];
  };
  streamingEpisodes: {
    title: string;
    thumbnail: string | null;
    url: string;
    site: string;
  }[];
}

export interface AniListCharacterEdge {
  role: "MAIN" | "SUPPORTING" | "BACKGROUND";
  node: {
    id: number;
    name: { full: string; native: string | null };
    image: { large: string | null };
  };
  voiceActors: { name: { full: string } }[];
}
