import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { AnimeModule } from "@modules/anime/anime.module";
import { GenreModule } from "@modules/genre/genre.module";
import { PlatformModule } from "@modules/platform/platform.module";
import { SyncModule } from "@modules/sync/sync.module";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    AnimeModule,
    GenreModule,
    PlatformModule,
    SyncModule,
  ],
})
export class AppModule {}
