import { Controller, Get, Param } from "@nestjs/common";
import type { VoiceActorDetail } from "@miru/types";
import { GetVoiceActorDetailUseCase } from "../../application/use-cases/get-voice-actor-detail.use-case";

@Controller("voice-actors")
export class VoiceActorController {
  constructor(private readonly getVoiceActorDetail: GetVoiceActorDetailUseCase) {}

  @Get(":id")
  async detail(@Param("id") id: string): Promise<VoiceActorDetail> {
    const { voiceActor, stats, roles } = await this.getVoiceActorDetail.execute({ id });
    return {
      id: voiceActor.id,
      name: voiceActor.name,
      stats,
      roles,
    };
  }
}
