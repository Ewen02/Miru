import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { LoggerModule } from "nestjs-pino";
import { SentryModule, SentryGlobalFilter } from "@sentry/nestjs/setup";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { MailModule } from "@shared/mail/mail.module";
import { HealthController } from "@shared/infrastructure/http/health.controller";
import { AnimeModule } from "@modules/anime/anime.module";
import { CharacterModule } from "@modules/character/character.module";
import { GenreModule } from "@modules/genre/genre.module";
import { ListModule } from "@modules/list/list.module";
import { NotificationModule } from "@modules/notification/notification.module";
import { PlatformModule } from "@modules/platform/platform.module";
import { PushModule } from "@modules/push/push.module";
import { ReviewModule } from "@modules/review/review.module";
import { StudioModule } from "@modules/studio/studio.module";
import { SyncModule } from "@modules/sync/sync.module";
import { UserModule } from "@modules/user/user.module";
import { VoiceActorModule } from "@modules/voice-actor/voice-actor.module";
import { WatchlistModule } from "@modules/watchlist/watchlist.module";
import { auth } from "./auth/auth";

const isDev = process.env.NODE_ENV !== "production";

@Module({
  imports: [
    SentryModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
        transport: isDev
          ? { target: "pino-pretty", options: { singleLine: true, translateTime: "HH:MM:ss" } }
          : undefined,
        // Drop noisy fields and redact cookies/authorization.
        redact: {
          paths: ["req.headers.cookie", "req.headers.authorization"],
          censor: "[redacted]",
        },
        autoLogging: {
          // Health and Better Auth chatter is not actionable.
          ignore: (req) => {
            const url = (req as { url?: string }).url ?? "";
            return url.startsWith("/health") || url.startsWith("/api/auth");
          },
        },
        customLogLevel: (_req, res, err) => {
          const status = res.statusCode ?? 200;
          if (err || status >= 500) return "error";
          if (status >= 400) return "warn";
          return "info";
        },
      },
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    // Global rate limit: 120 req/min per IP across the whole API.
    // Better Auth's `/api/auth/*` routes have their own internal rate limit on
    // top of this — so signup/login are double-gated.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    AuthModule.forRoot({
      auth,
      // Anime catalog is mostly public — opt-in to auth via @Session() on
      // routes that need a user instead of decorating every public endpoint.
      disableGlobalAuthGuard: true,
    }),
    PrismaModule,
    MailModule,
    AnimeModule,
    CharacterModule,
    GenreModule,
    ListModule,
    NotificationModule,
    PlatformModule,
    PushModule,
    StudioModule,
    SyncModule,
    UserModule,
    VoiceActorModule,
    WatchlistModule,
    ReviewModule,
  ],
  controllers: [HealthController],
  providers: [
    // SentryGlobalFilter must be registered before any other filter so that
    // it captures every unhandled exception. Our DomainExceptionFilter still
    // runs (registered globally in main.ts) and converts known domain errors
    // to HTTP responses — Sentry records them either way.
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
