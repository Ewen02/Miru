import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException, ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ConversationDetailView,
  MessagingRepositoryPort,
} from "../../domain/ports/messaging-repository.port";
import { MESSAGING_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
  peerId: string;
}

@Injectable()
export class OpenConversationUseCase implements UseCase<Input, ConversationDetailView> {
  constructor(
    @Inject(MESSAGING_REPOSITORY) private readonly messagingRepo: MessagingRepositoryPort,
  ) {}

  async execute({ userId, peerId }: Input): Promise<ConversationDetailView> {
    if (userId === peerId) {
      throw new ValidationException("Impossible de discuter avec soi-même.");
    }

    const conversationId = await this.messagingRepo.getOrCreateConversation(userId, peerId);

    const conversation = await this.messagingRepo.getConversation(conversationId, userId);
    if (!conversation) {
      throw new NotFoundException("Conversation", conversationId);
    }

    await this.messagingRepo.markRead(conversationId, userId);
    return conversation;
  }
}
