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
  messages: {
    orderBy: { createdAt: "asc" },
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

    return Promise.all(
      rows.map(async (row) => {
        const peer = row.userAId === userId ? row.userB : row.userA;
        const unreadCount = await this.prisma.directMessage.count({
          where: { conversationId: row.id, senderId: peer.id, readAt: null },
        });
        return {
          id: row.id,
          peer: { id: peer.id, name: peer.name, image: peer.image },
          lastMessageAt: row.lastMessageAt,
          unreadCount,
        };
      }),
    );
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
      messages: row.messages.map((message) => ({
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        body: message.body,
        createdAt: message.createdAt,
      })),
    };
  }
}
