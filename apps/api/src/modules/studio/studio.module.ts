import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { AnimeModule } from "@modules/anime/anime.module";
import { GetStudioDetailUseCase } from "./application/use-cases/get-studio-detail.use-case";
import { STUDIO_REPOSITORY } from "./application/tokens";
import { PrismaStudioRepository } from "./infrastructure/persistence/prisma-studio.repository";
import { StudioController } from "./infrastructure/http/studio.controller";

@Module({
  imports: [PrismaModule, forwardRef(() => AnimeModule)],
  controllers: [StudioController],
  providers: [
    GetStudioDetailUseCase,
    { provide: STUDIO_REPOSITORY, useClass: PrismaStudioRepository },
  ],
  exports: [STUDIO_REPOSITORY],
})
export class StudioModule {}
