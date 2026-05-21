export type EpisodeLinkSource = "CRUNCHYROLL_SCRAPE" | "ADN_SCRAPE";

export interface EpisodePlatformLinkEntity {
  id: string;
  episodeId: string;
  source: EpisodeLinkSource;
  url: string;
  verifiedAt: Date;
  brokenAt: Date | null;
  createdAt: Date;
}
