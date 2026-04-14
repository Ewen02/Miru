import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { AnimeModule } from "@modules/anime/anime.module";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    AnimeModule,
  ],
})
export class AppModule {}
