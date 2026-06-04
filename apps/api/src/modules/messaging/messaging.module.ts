import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { ListConversationsUseCase } from "./application/use-cases/list-conversations.use-case";
import { OpenConversationUseCase } from "./application/use-cases/open-conversation.use-case";
import { GetConversationUseCase } from "./application/use-cases/get-conversation.use-case";
import { SendMessageUseCase } from "./application/use-cases/send-message.use-case";
import { MESSAGING_REPOSITORY } from "./application/tokens";
import { PrismaMessagingRepository } from "./infrastructure/persistence/prisma-messaging.repository";
import { MessagingGateway } from "./infrastructure/gateway/messaging.gateway";
import { MessagingController } from "./infrastructure/http/messaging.controller";

@Module({
  imports: [PrismaModule],
  controllers: [MessagingController],
  providers: [
    ListConversationsUseCase,
    OpenConversationUseCase,
    GetConversationUseCase,
    SendMessageUseCase,
    MessagingGateway,
    { provide: MESSAGING_REPOSITORY, useClass: PrismaMessagingRepository },
  ],
  exports: [],
})
export class MessagingModule {}
