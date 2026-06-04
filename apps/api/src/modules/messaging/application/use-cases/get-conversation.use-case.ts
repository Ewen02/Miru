import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ConversationDetailView,
  MessagingRepositoryPort,
} from "../../domain/ports/messaging-repository.port";
import { MESSAGING_REPOSITORY } from "../tokens";

interface Input {
  conversationId: string;
  userId: string;
}

@Injectable()
export class GetConversationUseCase implements UseCase<Input, ConversationDetailView> {
  constructor(
    @Inject(MESSAGING_REPOSITORY) private readonly messagingRepo: MessagingRepositoryPort,
  ) {}

  async execute({ conversationId, userId }: Input): Promise<ConversationDetailView> {
    const conversation = await this.messagingRepo.getConversation(conversationId, userId);
    if (!conversation) {
      throw new NotFoundException("Conversation", conversationId);
    }

    await this.messagingRepo.markRead(conversationId, userId);
    return conversation;
  }
}
