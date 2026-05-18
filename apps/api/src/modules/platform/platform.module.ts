import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { ListPlatformsUseCase } from "./application/use-cases/list-platforms.use-case";
import { PLATFORM_REPOSITORY } from "./application/tokens";
import { PrismaPlatformRepository } from "./infrastructure/persistence/prisma-platform.repository";
import { PlatformController } from "./infrastructure/http/platform.controller";

@Module({
  imports: [PrismaModule],
  controllers: [PlatformController],
  providers: [
    ListPlatformsUseCase,
    { provide: PLATFORM_REPOSITORY, useClass: PrismaPlatformRepository },
  ],
  exports: [PLATFORM_REPOSITORY],
})
export class PlatformModule {}
