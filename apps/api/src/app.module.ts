import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { AnimeModule } from "@modules/anime/anime.module";
import { GenreModule } from "@modules/genre/genre.module";
import { PlatformModule } from "@modules/platform/platform.module";
import { SyncModule } from "@modules/sync/sync.module";
import { UserModule } from "@modules/user/user.module";
import { auth } from "./auth/auth";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    AuthModule.forRoot({
      auth,
      // Anime catalog is mostly public — opt-in to auth via @Session() on
      // routes that need a user instead of decorating every public endpoint.
      disableGlobalAuthGuard: true,
    }),
    PrismaModule,
    AnimeModule,
    GenreModule,
    PlatformModule,
    SyncModule,
    UserModule,
  ],
})
export class AppModule {}
