import { Controller, Get, Param } from "@nestjs/common";
import type { CharacterDetail } from "@miru/types";
import { GetCharacterDetailUseCase } from "../../application/use-cases/get-character-detail.use-case";

@Controller("characters")
export class CharacterController {
  constructor(private readonly getCharacterDetail: GetCharacterDetailUseCase) {}

  @Get(":id")
  async detail(@Param("id") id: string): Promise<CharacterDetail> {
    const { character, appearances, voiceCredits } = await this.getCharacterDetail.execute({
      id,
    });
    return {
      id: character.id,
      name: character.name,
      nameJp: character.nameJp,
      imageUrl: character.imageUrl,
      appearances,
      voiceCredits,
    };
  }
}
