import { Inject } from "@nestjs/common";
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import type { DirectMessageDto } from "@miru/types";
import { userIdFromSocket } from "@shared/realtime/socket-auth";
import { MessagingRepositoryPort } from "../../domain/ports/messaging-repository.port";
import { MESSAGING_REPOSITORY } from "../../application/tokens";

/** The authenticated user id, memoized on the socket once resolved. */
interface MessagingSocketData {
  userId?: string;
}

type MessagingSocket = Socket<
  Record<string, unknown>,
  Record<string, unknown>,
  never,
  MessagingSocketData
>;

@WebSocketGateway({
  namespace: "/ws/messages",
  cors: {
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    @Inject(MESSAGING_REPOSITORY) private readonly messagingRepo: MessagingRepositoryPort,
  ) {}

  /** Reject anonymous sockets up front; resolve the user id lazily per message. */
  async handleConnection(client: MessagingSocket): Promise<void> {
    const userId = await userIdFromSocket(client);
    if (!userId) {
      client.disconnect();
      return;
    }
    client.data.userId = userId;
  }

  @SubscribeMessage("join")
  async handleJoin(
    client: MessagingSocket,
    payload: { conversationId: string },
  ): Promise<{ joined: boolean }> {
    // A message can arrive before handleConnection's async session lookup has
    // resolved, so re-resolve here if needed rather than trusting client.data.
    const userId = await this.resolveUserId(client);
    if (!userId || !payload?.conversationId) return { joined: false };

    const isParticipant = await this.messagingRepo.isParticipant(payload.conversationId, userId);
    if (isParticipant) {
      await client.join(`conv:${payload.conversationId}`);
    }
    return { joined: isParticipant };
  }

  emitMessage(conversationId: string, message: DirectMessageDto): void {
    // `@WebSocketServer()` injects this gateway's namespace (/ws/messages), so
    // `.to(room)` broadcasts to members of that room within this namespace.
    this.server.to(`conv:${conversationId}`).emit("message", message);
  }

  private async resolveUserId(client: MessagingSocket): Promise<string | null> {
    if (client.data.userId) return client.data.userId;
    const userId = await userIdFromSocket(client);
    if (userId) client.data.userId = userId;
    return userId;
  }
}
