import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import * as Sentry from "@sentry/nestjs";
import { PrismaClient, type Prisma } from "@miru/db";

/**
 * Anything slower than this gets a warn log AND a Sentry breadcrumb.
 * 500ms is the threshold where humans start noticing latency in the UI;
 * if a query crosses it, we want to know without grepping pg logs.
 */
const SLOW_QUERY_THRESHOLD_MS = 500;
/**
 * Hard ceiling — past this the query is reported as a Sentry message,
 * not just a breadcrumb. Crossing 2s is almost always a missing index
 * or an N+1 disguised as a single SQL string.
 */
const VERY_SLOW_QUERY_THRESHOLD_MS = 2000;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        // `query` is the event channel — captured via $on below, not printed.
        { level: "query", emit: "event" },
        { level: "warn", emit: "stdout" },
        { level: "error", emit: "stdout" },
      ],
    });
  }

  async onModuleInit() {
    // Hook before connecting so we don't miss queries fired during init.
    this.installSlowQueryListener();
    await this.$connect();
    this.logger.log("Prisma connected");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private installSlowQueryListener(): void {
    // Prisma's `query` event type is loose — cast through Prisma namespace to
    // get the right signature without pulling the whole runtime types.
    (
      this as unknown as {
        $on(event: "query", cb: (e: Prisma.QueryEvent) => void): void;
      }
    ).$on("query", (event) => {
      const duration = event.duration;
      if (duration < SLOW_QUERY_THRESHOLD_MS) return;

      const summary = event.query.slice(0, 120);
      const level = duration >= VERY_SLOW_QUERY_THRESHOLD_MS ? "error" : "warn";
      this.logger[level === "error" ? "error" : "warn"](`slow query ${duration}ms — ${summary}`);

      // Sentry: breadcrumb for warn-level, real event for error-level.
      // Don't add params to the message — they may contain user data.
      if (level === "error") {
        Sentry.captureMessage(`Prisma very slow query (${duration}ms)`, {
          level: "warning",
          tags: { db: "postgres", source: "prisma" },
          extra: { duration, query: summary },
        });
      } else {
        Sentry.addBreadcrumb({
          category: "db.query",
          level: "info",
          message: `slow query ${duration}ms`,
          data: { duration, query: summary },
        });
      }
    });
  }
}
