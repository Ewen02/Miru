import { Inject, Injectable } from "@nestjs/common";
import { NotFoundException, ValidationException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import {
  DirectMessageView,
  MessagingRepositoryPort,
} from "../../domain/ports/messaging-repository.port";
import { MESSAGING_REPOSITORY } from "../tokens";

interface Input {
  conversationId: string;
  senderId: string;
  body: string;
}

@Injectable()
export class SendMessageUseCase implements UseCase<Input, DirectMessageView> {
  constructor(
    @Inject(MESSAGING_REPOSITORY) private readonly messagingRepo: MessagingRepositoryPort,
  ) {}

  async execute({ conversationId, senderId, body }: Input): Promise<DirectMessageView> {
    const trimmedBody = body.trim();
    if (trimmedBody.length < 1 || trimmedBody.length > 5000) {
      throw new ValidationException("Le message doit contenir entre 1 et 5000 caractères.");
    }

    const isParticipant = await this.messagingRepo.isParticipant(conversationId, senderId);
    if (!isParticipant) {
      throw new NotFoundException("Conversation", conversationId);
    }

    return this.messagingRepo.sendMessage(conversationId, senderId, trimmedBody);
  }
}
