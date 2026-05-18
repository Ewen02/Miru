import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { LoggerModule } from "nestjs-pino";
import { SentryModule, SentryGlobalFilter } from "@sentry/nestjs/setup";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { HealthController } from "@shared/infrastructure/http/health.controller";
import { AnimeModule } from "@modules/anime/anime.module";
import { GenreModule } from "@modules/genre/genre.module";
import { PlatformModule } from "@modules/platform/platform.module";
import { ReviewModule } from "@modules/review/review.module";
import { SyncModule } from "@modules/sync/sync.module";
import { UserModule } from "@modules/user/user.module";
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
  ],
})
export class AppModule {}
