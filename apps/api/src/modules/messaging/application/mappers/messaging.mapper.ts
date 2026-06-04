import type { ConversationDetailDto, ConversationSummaryDto, DirectMessageDto } from "@miru/types";
import {
  ConversationDetailView,
  ConversationSummaryView,
  DirectMessageView,
} from "../../domain/ports/messaging-repository.port";

export class MessagingMapper {
  static toSummaryDto(view: ConversationSummaryView): ConversationSummaryDto {
    return {
      id: view.id,
      peer: {
        id: view.peer.id,
        name: view.peer.name,
        image: view.peer.image,
      },
      lastMessageAt: view.lastMessageAt ? view.lastMessageAt.toISOString() : null,
      unreadCount: view.unreadCount,
    };
  }

  static toMessageDto(view: DirectMessageView): DirectMessageDto {
    return {
      id: view.id,
      conversationId: view.conversationId,
      senderId: view.senderId,
      body: view.body,
      createdAt: view.createdAt.toISOString(),
    };
  }

  static toDetailDto(view: ConversationDetailView): ConversationDetailDto {
    return {
      id: view.id,
      peer: {
        id: view.peer.id,
        name: view.peer.name,
        image: view.peer.image,
      },
      messages: view.messages.map((message) => MessagingMapper.toMessageDto(message)),
    };
  }
}
