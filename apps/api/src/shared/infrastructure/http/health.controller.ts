import {
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  Inject,
  ServiceUnavailableException,
} from "@nestjs/common";
import { AniListClient } from "@miru/anilist";
import { JikanClient } from "@miru/jikan";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { ANILIST_CLIENT, JIKAN_CLIENT } from "@modules/anime/application/tokens";

/**
 * Three endpoints designed for orchestrators (Railway, Kubernetes) and
 * for ad-hoc diagnostics:
 *
 * - GET /health         → liveness: cheap, no I/O. Restart on failure.
 * - GET /health/ready   → readiness: pings the DB. 503 → out of rotation.
 * - GET /health/db      → diagnostics: size, connections, locks, top tables.
 *                         Admin-only (X-Health-Token header).
 */
@Controller("health")
export class HealthController {
  /** Cached snapshot — `pg_stat_*` queries can take 100ms+ on a busy DB. */
  private cachedDb: { at: number; payload: DbHealthPayload } | null = null;
  /** ~60s cache window — the diagnostics endpoint isn't a real-time view. */
  private readonly cacheTtlMs = 60_000;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(ANILIST_CLIENT) private readonly anilist: AniListClient,
    @Inject(JIKAN_CLIENT) private readonly jikan: JikanClient,
  ) {}

  @Get()
  @HttpCode(200)
  liveness(): { status: "ok" } {
    return { status: "ok" };
  }

  @Get("ready")
  async readiness(): Promise<{ status: "ok"; db: "ok" }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ok", db: "ok" };
    } catch (err) {
      throw new ServiceUnavailableException({
        status: "degraded",
        db: "down",
        message: (err as Error).message,
      });
    }
  }

  /**
   * DB diagnostics — gated by `X-Health-Token` header matching
   * HEALTH_DB_TOKEN env. Returns a cached snapshot to keep cost low even
   * when polled from a monitoring agent.
   */
  @Get("db")
  async dbDiagnostics(@Headers("x-health-token") token?: string): Promise<DbHealthPayload> {
    const expected = process.env.HEALTH_DB_TOKEN;
    if (!expected || token !== expected) {
      throw new ForbiddenException("missing or invalid X-Health-Token");
    }

    const now = Date.now();
    if (this.cachedDb && now - this.cachedDb.at < this.cacheTtlMs) {
      return this.cachedDb.payload;
    }

    const [[sizeRow], [activityRow], [locksRow], topTables] = await Promise.all([
      this.prisma.$queryRaw<Array<{ size_bytes: bigint }>>`
        SELECT pg_database_size(current_database())::bigint AS size_bytes
      `,
      this.prisma.$queryRaw<Array<{ active: bigint; idle: bigint; total: bigint }>>`
        SELECT
          count(*) FILTER (WHERE state = 'active')::bigint AS active,
          count(*) FILTER (WHERE state = 'idle')::bigint AS idle,
          count(*)::bigint AS total
        FROM pg_stat_activity
        WHERE datname = current_database()
      `,
      this.prisma.$queryRaw<Array<{ blocked: bigint }>>`
        SELECT count(*)::bigint AS blocked FROM pg_locks WHERE NOT granted
      `,
      this.prisma.$queryRaw<Array<{ relname: string; n_live_tup: bigint }>>`
        SELECT relname, n_live_tup::bigint
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC NULLS LAST
        LIMIT 10
      `,
    ]);

    const payload: DbHealthPayload = {
      status: "ok",
      sizeBytes: Number(sizeRow?.size_bytes ?? 0n),
      connections: {
        active: Number(activityRow?.active ?? 0n),
        idle: Number(activityRow?.idle ?? 0n),
        total: Number(activityRow?.total ?? 0n),
      },
      blockedLocks: Number(locksRow?.blocked ?? 0n),
      topTables: topTables.map((t) => ({ name: t.relname, liveRows: Number(t.n_live_tup) })),
      cachedFor: this.cacheTtlMs,
    };
    this.cachedDb = { at: now, payload };
    return payload;
  }

  /**
   * External-clients metrics (AniList + Jikan): request counts, retries,
   * 429 hits, cache hit/miss ratios. Same admin gate as /health/db.
   *
   * Counters are process-lifetime — they reset on each pod restart.
   * Good enough for trend-spotting and alerts; for proper time series
   * scrape periodically and diff externally.
   */
  @Get("metrics")
  metrics(@Headers("x-health-token") token?: string) {
    const expected = process.env.HEALTH_DB_TOKEN;
    if (!expected || token !== expected) {
      throw new ForbiddenException("missing or invalid X-Health-Token");
    }
    return {
      anilist: this.anilist.metricsSnapshot(),
      jikan: this.jikan.metricsSnapshot(),
    };
  }
}

interface DbHealthPayload {
  status: "ok";
  sizeBytes: number;
  connections: { active: number; idle: number; total: number };
  blockedLocks: number;
  topTables: Array<{ name: string; liveRows: number }>;
  cachedFor: number;
}
