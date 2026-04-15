export interface JikanEpisode {
  mal_id: number;
  title: string | null;
  title_japanese: string | null;
  title_romanji: string | null;
  duration: number | null;
  aired: string | null;
  filler: boolean;
  recap: boolean;
}

export interface JikanEpisodesResponse {
  data: JikanEpisode[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page?: number;
  };
}
