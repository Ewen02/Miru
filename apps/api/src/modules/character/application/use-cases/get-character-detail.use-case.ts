import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { CharacterEntity } from "../../domain/entities/character.entity";
import {
  CharacterAppearance,
  CharacterRepositoryPort,
  CharacterVoiceCredit,
} from "../../domain/ports/character-repository.port";
import { CHARACTER_REPOSITORY } from "../tokens";

interface GetCharacterDetailInput {
  id: string;
}

interface GetCharacterDetailOutput {
  character: CharacterEntity;
  appearances: CharacterAppearance[];
  voiceCredits: CharacterVoiceCredit[];
}

@Injectable()
export class GetCharacterDetailUseCase
  implements UseCase<GetCharacterDetailInput, GetCharacterDetailOutput>
{
  constructor(
    @Inject(CHARACTER_REPOSITORY) private readonly repo: CharacterRepositoryPort,
  ) {}

  async execute({ id }: GetCharacterDetailInput): Promise<GetCharacterDetailOutput> {
    const character = await this.repo.findById(id);
    if (!character) throw new NotFoundException(`Character "${id}" not found`);

    const [appearances, voiceCredits] = await Promise.all([
      this.repo.appearancesByCharacterId(id),
      this.repo.voiceCreditsByCharacterId(id),
    ]);

    return { character, appearances, voiceCredits };
  }
}
