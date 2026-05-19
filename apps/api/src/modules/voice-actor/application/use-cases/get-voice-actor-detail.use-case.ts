import { Injectable, Inject } from "@nestjs/common";
import { NotFoundException } from "@shared/domain/domain-exception";
import { UseCase } from "@shared/domain/use-case.base";
import { VoiceActorEntity } from "../../domain/entities/voice-actor.entity";
import {
  VoiceActorRepositoryPort,
  VoiceActorRole,
  VoiceActorStats,
} from "../../domain/ports/voice-actor-repository.port";
import { VOICE_ACTOR_REPOSITORY } from "../tokens";

interface GetVoiceActorDetailInput {
  id: string;
}

interface GetVoiceActorDetailOutput {
  voiceActor: VoiceActorEntity;
  stats: VoiceActorStats;
  roles: VoiceActorRole[];
}

@Injectable()
export class GetVoiceActorDetailUseCase
  implements UseCase<GetVoiceActorDetailInput, GetVoiceActorDetailOutput>
{
  constructor(
    @Inject(VOICE_ACTOR_REPOSITORY) private readonly repo: VoiceActorRepositoryPort,
  ) {}

  async execute({ id }: GetVoiceActorDetailInput): Promise<GetVoiceActorDetailOutput> {
    const voiceActor = await this.repo.findById(id);
    if (!voiceActor) throw new NotFoundException(`Voice actor "${id}" not found`);

    const [stats, roles] = await Promise.all([
      this.repo.statsByVoiceActorId(id),
      this.repo.rolesByVoiceActorId(id),
    ]);

    return { voiceActor, stats, roles };
  }
}
