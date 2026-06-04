import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import type { ConversationDetailDto, ConversationSummaryDto, DirectMessageDto } from "@miru/types";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { ListConversationsUseCase } from "../../application/use-cases/list-conversations.use-case";
import { OpenConversationUseCase } from "../../application/use-cases/open-conversation.use-case";
import { GetConversationUseCase } from "../../application/use-cases/get-conversation.use-case";
import { SendMessageUseCase } from "../../application/use-cases/send-message.use-case";
import { MessagingMapper } from "../../application/mappers/messaging.mapper";
import { OpenConversationDto, SendMessageDto } from "../../application/dtos/messaging.dto";
import { MessagingGateway } from "../gateway/messaging.gateway";

@Controller("messages")
@UseGuards(AuthRequiredGuard)
export class MessagingController {
  constructor(
    private readonly listConversations: ListConversationsUseCase,
    private readonly openConversation: OpenConversationUseCase,
    private readonly getConversation: GetConversationUseCase,
    private readonly sendMessage: SendMessageUseCase,
    private readonly gateway: MessagingGateway,
  ) {}

  @Get()
  async list(@CurrentUserId() userId: string): Promise<ConversationSummaryDto[]> {
    const conversations = await this.listConversations.execute({ userId });
    return conversations.map((conversation) => MessagingMapper.toSummaryDto(conversation));
  }

  @Post("open")
  @HttpCode(200)
  async open(
    @CurrentUserId() userId: string,
    @Body() body: OpenConversationDto,
  ): Promise<ConversationDetailDto> {
    const conversation = await this.openConversation.execute({ userId, peerId: body.peerId });
    return MessagingMapper.toDetailDto(conversation);
  }

  @Get(":conversationId")
  async detail(
    @Param("conversationId") conversationId: string,
    @CurrentUserId() userId: string,
  ): Promise<ConversationDetailDto> {
    const conversation = await this.getConversation.execute({ conversationId, userId });
    return MessagingMapper.toDetailDto(conversation);
  }

  @Post(":conversationId")
  @HttpCode(201)
  async send(
    @Param("conversationId") conversationId: string,
    @CurrentUserId() userId: string,
    @Body() body: SendMessageDto,
  ): Promise<DirectMessageDto> {
    const message = await this.sendMessage.execute({
      conversationId,
      senderId: userId,
      body: body.body,
    });
    const dto = MessagingMapper.toMessageDto(message);
    this.gateway.emitMessage(conversationId, dto);
    return dto;
  }
}
