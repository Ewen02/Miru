import {
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { userFromSocket } from "@shared/realtime/socket-auth";
import type { PartyChatMessage, PartyPlayback, PartyState } from "./watch-party.types";

interface PartySocketData {
  user?: { id: string; name: string };
  /** The party code this socket has joined, for cleanup on disconnect. */
  code?: string;
}

// Permissive emit-events map: the gateway emits several ad-hoc events
// ("playback", "members", "chat") and we don't gain from over-typing them here.
type EmitEvents = Record<string, (...args: unknown[]) => void>;
type PartySocket = Socket<Record<string, unknown>, EmitEvents, never, PartySocketData>;

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Watch party: ephemeral synced-playback rooms with live chat. State lives in
 * memory (a single API instance) — parties are transient by design, so there's
 * no persistence. Playback control is host-only; chat is open to all members.
 *
 * NOTE: in-memory state means parties don't survive a restart and don't span
 * multiple API instances. Scaling horizontally would need the socket.io Redis
 * adapter + shared party store — deferred until there's load to justify it.
 */
@WebSocketGateway({
  namespace: "/ws/party",
  cors: {
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  },
})
export class WatchPartyGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: Server;

  private readonly parties = new Map<string, PartyState>();

  private makeCode(): string {
    let code = "";
    for (let i = 0; i < 6; i++) {
      // Deterministic-enough spread without Math.random (unavailable): mix the
      // map size, time, and index. Collisions are retried by the caller.
      const seed = (this.parties.size + 1) * 2654435761 + Date.now() + i * 97;
      code += CODE_ALPHABET[Math.abs(seed) % CODE_ALPHABET.length];
    }
    return code;
  }

  @SubscribeMessage("create")
  async handleCreate(
    client: PartySocket,
    payload: { animeSlug?: string; title?: string },
  ): Promise<{ code: string } | { error: string }> {
    const user = await this.resolveUser(client);
    if (!user) return { error: "unauthenticated" };

    let code = this.makeCode();
    while (this.parties.has(code)) code = this.makeCode();

    const state: PartyState = {
      code,
      hostId: user.id,
      animeSlug: payload?.animeSlug ?? null,
      title: payload?.title ?? null,
      playback: { playing: false, positionSeconds: 0, updatedAtMs: Date.now() },
      members: [user.id],
    };
    this.parties.set(code, state);
    client.data.code = code;
    await client.join(`party:${code}`);
    return { code };
  }

  @SubscribeMessage("join")
  async handleJoin(
    client: PartySocket,
    payload: { code: string },
  ): Promise<{ state: PartyState } | { error: string }> {
    const user = await this.resolveUser(client);
    if (!user) return { error: "unauthenticated" };
    const state = this.parties.get(payload?.code);
    if (!state) return { error: "not-found" };

    if (!state.members.includes(user.id)) state.members.push(user.id);
    client.data.code = state.code;
    await client.join(`party:${state.code}`);
    this.server.to(`party:${state.code}`).emit("members", { members: state.members });
    return { state };
  }

  @SubscribeMessage("sync")
  async handleSync(client: PartySocket, payload: PartyPlayback): Promise<void> {
    const user = await this.resolveUser(client);
    const code = client.data.code;
    if (!user || !code) return;
    const state = this.parties.get(code);
    if (!state || state.hostId !== user.id) return; // host-only control

    state.playback = {
      playing: !!payload?.playing,
      positionSeconds: Math.max(0, Number(payload?.positionSeconds) || 0),
      updatedAtMs: Date.now(),
    };
    // Broadcast to everyone except the host (who is the source of truth).
    client.to(`party:${code}`).emit("playback", state.playback);
  }

  @SubscribeMessage("chat")
  async handleChat(client: PartySocket, payload: { body: string }): Promise<void> {
    const user = await this.resolveUser(client);
    const code = client.data.code;
    const body = (payload?.body ?? "").trim().slice(0, 500);
    if (!user || !code || !body || !this.parties.has(code)) return;

    const message: PartyChatMessage = {
      userId: user.id,
      userName: user.name,
      body,
      atMs: Date.now(),
    };
    this.server.to(`party:${code}`).emit("chat", message);
  }

  handleDisconnect(client: PartySocket): void {
    const code = client.data.code;
    const userId = client.data.user?.id;
    if (!code || !userId) return;
    const state = this.parties.get(code);
    if (!state) return;
    state.members = state.members.filter((id) => id !== userId);
    if (state.members.length === 0) {
      this.parties.delete(code); // last one out closes the party
    } else {
      this.server.to(`party:${code}`).emit("members", { members: state.members });
    }
  }

  private async resolveUser(client: PartySocket): Promise<{ id: string; name: string } | null> {
    if (client.data.user) return client.data.user;
    const user = await userFromSocket(client);
    if (user) client.data.user = user;
    return user;
  }
}
