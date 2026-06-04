import { IsString, MaxLength, MinLength } from "class-validator";

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body!: string;
}

export class OpenConversationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  peerId!: string;
}
