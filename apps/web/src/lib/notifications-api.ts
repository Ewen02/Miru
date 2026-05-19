import { API_URL } from "./env";

export const notificationsApi = {
  async markRead(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/notifications/${encodeURIComponent(id)}/read`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`notifications.markRead ${res.status}`);
  },

  async markAllRead(): Promise<void> {
    const res = await fetch(`${API_URL}/notifications/read-all`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`notifications.markAllRead ${res.status}`);
  },
};
