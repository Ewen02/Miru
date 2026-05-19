import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { GetCharacterDetailUseCase } from "./application/use-cases/get-character-detail.use-case";
import { CHARACTER_REPOSITORY } from "./application/tokens";
import { PrismaCharacterRepository } from "./infrastructure/persistence/prisma-character.repository";
import { CharacterController } from "./infrastructure/http/character.controller";

@Module({
  imports: [PrismaModule],
  controllers: [CharacterController],
  providers: [
    GetCharacterDetailUseCase,
    { provide: CHARACTER_REPOSITORY, useClass: PrismaCharacterRepository },
  ],
  exports: [CHARACTER_REPOSITORY],
})
export class CharacterModule {}
