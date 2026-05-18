const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const reviewApi = {
  async upsert(animeId: string, payload: { rating: number; body: string | null }): Promise<void> {
    const res = await fetch(`${API_URL}/animes/${encodeURIComponent(animeId)}/reviews`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`review.upsert ${res.status}`);
  },

  async remove(reviewId: string): Promise<void> {
    const res = await fetch(`${API_URL}/reviews/${encodeURIComponent(reviewId)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok && res.status !== 204) throw new Error(`review.remove ${res.status}`);
  },
};
