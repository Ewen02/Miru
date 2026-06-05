import { Injectable } from "@nestjs/common";
import { Prisma } from "@miru/db";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import {
  ConversationDetailView,
  ConversationSummaryView,
  DirectMessageView,
  MessagingRepositoryPort,
} from "../../domain/ports/messaging-repository.port";

const CONVERSATION_DETAIL_INCLUDE = {
  userA: { select: { id: true, name: true, image: true } },
  userB: { select: { id: true, name: true, image: true } },
  // PERF-15: fetch the 100 *most recent* messages (desc), then reverse
  // in JS so the view stays chronological. With the older `asc + take:100`
  // a conversation of 10k messages had to scan from the oldest and
  // discard most of them — the desc index walk skips that work.
  messages: {
    orderBy: { createdAt: "desc" },
    take: 100,
  },
} satisfies Prisma.ConversationInclude;

type ConversationDetailRow = Prisma.ConversationGetPayload<{
  include: typeof CONVERSATION_DETAIL_INCLUDE;
}>;

@Injectable()
export class PrismaMessagingRepository implements MessagingRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listConversations(userId: string): Promise<ConversationSummaryView[]> {
    const rows = await this.prisma.conversation.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
      include: {
        userA: { select: { id: true, name: true, image: true } },
        userB: { select: { id: true, name: true, image: true } },
      },
    });

    if (rows.length === 0) return [];

    // PERF-01: collapse N+1 (one count per conversation) into a single
    // GROUP BY against the partial unread index.
    const unreadGroups = await this.prisma.directMessage.groupBy({
      by: ["conversationId"],
      where: {
        conversationId: { in: rows.map((r) => r.id) },
        senderId: { not: userId },
        readAt: null,
      },
      _count: { _all: true },
    });
    const unreadByConv = new Map<string, number>(
      unreadGroups.map((g) => [g.conversationId, g._count._all]),
    );

    return rows.map((row) => {
      const peer = row.userAId === userId ? row.userB : row.userA;
      return {
        id: row.id,
        peer: { id: peer.id, name: peer.name, image: peer.image },
        lastMessageAt: row.lastMessageAt,
        unreadCount: unreadByConv.get(row.id) ?? 0,
      };
    });
  }

  async getOrCreateConversation(userId: string, peerId: string): Promise<string> {
    const [userAId, userBId] = [userId, peerId].sort();
    const conversation = await this.prisma.conversation.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      create: { userAId, userBId },
      update: {},
      select: { id: true },
    });
    return conversation.id;
  }

  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<ConversationDetailView | null> {
    const row = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: CONVERSATION_DETAIL_INCLUDE,
    });
    if (!row) return null;
    if (row.userAId !== userId && row.userBId !== userId) return null;

    return this.toDetailView(row, userId);
  }

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const row = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      select: { id: true },
    });
    return row !== null;
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    body: string,
  ): Promise<DirectMessageView> {
    const [message] = await this.prisma.$transaction([
      this.prisma.directMessage.create({
        data: { conversationId, senderId, body },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      body: message.body,
      createdAt: message.createdAt,
    };
  }

  async markRead(conversationId: string, userId: string): Promise<void> {
    await this.prisma.directMessage.updateMany({
      where: { conversationId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });
  }

  private toDetailView(row: ConversationDetailRow, userId: string): ConversationDetailView {
    const peer = row.userAId === userId ? row.userB : row.userA;
    return {
      id: row.id,
      peer: { id: peer.id, name: peer.name, image: peer.image },
      // Messages came back desc (latest first) for the index walk; the
      // view contract is chronological so we reverse here.
      messages: row.messages
        .slice()
        .reverse()
        .map((message) => ({
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          body: message.body,
          createdAt: message.createdAt,
        })),
    };
  }
}
