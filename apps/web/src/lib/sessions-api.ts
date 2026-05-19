import { API_URL } from "./env";

export const sessionsApi = {
  async revoke(sessionId: string): Promise<void> {
    const res = await fetch(
      `${API_URL}/users/me/sessions/${encodeURIComponent(sessionId)}`,
      { method: "DELETE", credentials: "include" },
    );
    if (!res.ok && res.status !== 204) {
      throw new Error(`sessions.revoke ${res.status}`);
    }
  },
};
