export interface EpisodeInput {
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

export interface EpisodeSyncPort {
  fetchEpisodes(malId: number): Promise<EpisodeInput[]>;
}
