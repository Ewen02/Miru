import { API_URL } from "./env";

/**
 * Client-side list mutations. Rely on credentials: include so Better Auth
 * cookies travel cross-origin (dev: 3000 → 3001).
 */
export interface MyListSummary {
  id: string;
  title: string;
  itemCount: number;
  containsAnimeId?: boolean;
}

export const listsApi = {
  async listMine(): Promise<MyListSummary[]> {
    const res = await fetch(`${API_URL}/lists?filter=mine`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(`lists.listMine ${res.status}`);
    const summaries = (await res.json()) as Array<{
      id: string;
      title: string;
      itemCount: number;
    }>;
    return summaries.map((s) => ({ id: s.id, title: s.title, itemCount: s.itemCount }));
  },

  async create(input: {
    title: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<{ id: string; slug: string }> {
    const res = await fetch(`${API_URL}/lists`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`lists.create ${res.status}`);
    return res.json();
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/lists/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok && res.status !== 204) throw new Error(`lists.remove ${res.status}`);
  },

  async addItem(listId: string, animeId: string, note?: string): Promise<void> {
    const res = await fetch(
      `${API_URL}/lists/${encodeURIComponent(listId)}/items`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animeId, note }),
      },
    );
    if (!res.ok && res.status !== 204) throw new Error(`lists.addItem ${res.status}`);
  },

  async removeItem(listId: string, animeId: string): Promise<void> {
    const res = await fetch(
      `${API_URL}/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(animeId)}`,
      { method: "DELETE", credentials: "include" },
    );
    if (!res.ok && res.status !== 204) throw new Error(`lists.removeItem ${res.status}`);
  },

  async toggleLike(listId: string, action: "like" | "unlike"): Promise<void> {
    const method = action === "like" ? "PUT" : "DELETE";
    const res = await fetch(
      `${API_URL}/lists/${encodeURIComponent(listId)}/like`,
      { method, credentials: "include" },
    );
    if (!res.ok && res.status !== 204) throw new Error(`lists.toggleLike ${res.status}`);
  },
};
