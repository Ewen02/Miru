import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ConversationSummaryView,
  MessagingRepositoryPort,
} from "../../domain/ports/messaging-repository.port";
import { MESSAGING_REPOSITORY } from "../tokens";

interface Input {
  userId: string;
}

@Injectable()
export class ListConversationsUseCase implements UseCase<Input, ConversationSummaryView[]> {
  constructor(
    @Inject(MESSAGING_REPOSITORY) private readonly messagingRepo: MessagingRepositoryPort,
  ) {}

  async execute({ userId }: Input): Promise<ConversationSummaryView[]> {
    return this.messagingRepo.listConversations(userId);
  }
}
