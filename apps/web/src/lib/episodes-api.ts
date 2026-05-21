import { API_URL } from "./env";

export const episodesApi = {
  async markWatched(episodeId: string): Promise<void> {
    const res = await fetch(
      `${API_URL}/watchlist/episodes/${encodeURIComponent(episodeId)}/watched`,
      { method: "POST", credentials: "include" },
    );
    if (!res.ok && res.status !== 204) {
      throw new Error(`episodes.markWatched ${res.status}`);
    }
  },

  async unmarkWatched(episodeId: string): Promise<void> {
    const res = await fetch(
      `${API_URL}/watchlist/episodes/${encodeURIComponent(episodeId)}/watched`,
      { method: "DELETE", credentials: "include" },
    );
    if (!res.ok && res.status !== 204) {
      throw new Error(`episodes.unmarkWatched ${res.status}`);
    }
  },
};
