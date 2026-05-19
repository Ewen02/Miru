import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { GetVoiceActorDetailUseCase } from "./application/use-cases/get-voice-actor-detail.use-case";
import { VOICE_ACTOR_REPOSITORY } from "./application/tokens";
import { PrismaVoiceActorRepository } from "./infrastructure/persistence/prisma-voice-actor.repository";
import { VoiceActorController } from "./infrastructure/http/voice-actor.controller";

@Module({
  imports: [PrismaModule],
  controllers: [VoiceActorController],
  providers: [
    GetVoiceActorDetailUseCase,
    { provide: VOICE_ACTOR_REPOSITORY, useClass: PrismaVoiceActorRepository },
  ],
  exports: [VOICE_ACTOR_REPOSITORY],
})
export class VoiceActorModule {}
