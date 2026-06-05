import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Prisma } from "@miru/db";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { RunContextService } from "@shared/infrastructure/context/run-context.service";
import { RETENTION_BATCH_SIZE, RETENTION_RULES, RetentionRule } from "./retention.config";

/**
 * Nightly cron that enforces retention policies on transactional tables
 * that would otherwise grow unbounded (notifications, activity feed,
 * episode reactions).
 *
 * Two safety rails:
 *  - `RETENTION_DRY_RUN=true` (default in prod for the first weeks) logs
 *    what would be deleted without actually deleting. Use the logs to
 *    sanity-check the rules before flipping the flag.
 *  - Deletes are batched (LIMIT 1000 per round) to avoid holding long
 *    locks on hot tables.
 *
 * Disabled when `ENABLE_SCHEDULER` is not "true" so dev/CI don't trip it.
 */
@Injectable()
export class RetentionScheduler {
  private readonly logger = new Logger(RetentionScheduler.name);
  private readonly enabled = process.env.ENABLE_SCHEDULER === "true";
  private readonly dryRun = process.env.RETENTION_DRY_RUN !== "false";

  constructor(
    private readonly prisma: PrismaService,
    private readonly runContext: RunContextService,
  ) {}

  /** 03:30 UTC — after the nightly backup runs, before traffic spikes. */
  @Cron("30 3 * * *", { name: "retention-nightly" })
  async handleNightly(): Promise<void> {
    if (!this.enabled) return;
    await this.runContext.run("retention-nightly", async () => {
      const runId = this.runContext.runId();
      this.logger.log(`[run=${runId}] Retention pass starting (dryRun=${this.dryRun})`);
      for (const rule of RETENTION_RULES) {
        await this.applyRule(rule, runId);
      }
    });
  }

  private async applyRule(rule: RetentionRule, runId: string): Promise<void> {
    const cutoff = new Date(Date.now() - rule.keepDays * 24 * 60 * 60 * 1000);
    const where = this.buildWhere(rule, cutoff);

    // Count first — cheap and gives a meaningful dry-run log.
    const countRow = await this.prisma.$queryRaw<Array<{ n: bigint }>>(
      this.buildCountQuery(rule.table, where),
    );
    const total = Number(countRow[0]?.n ?? 0n);
    if (total === 0) {
      this.logger.log(`[run=${runId}] ${rule.table}: 0 candidates (${rule.description})`);
      return;
    }

    if (this.dryRun) {
      this.logger.log(
        `[run=${runId}] DRY-RUN ${rule.table}: would delete ${total} rows (${rule.description})`,
      );
      return;
    }

    let deletedTotal = 0;
    // Loop until exhaust — each batch deletes at most RETENTION_BATCH_SIZE.
    while (true) {
      const deleted = await this.prisma.$executeRaw(
        this.buildDeleteQuery(rule.table, where, RETENTION_BATCH_SIZE),
      );
      deletedTotal += deleted;
      if (deleted < RETENTION_BATCH_SIZE) break;
    }
    this.logger.log(
      `[run=${runId}] ${rule.table}: deleted ${deletedTotal} rows (${rule.description})`,
    );
  }

  private buildWhere(rule: RetentionRule, cutoff: Date): string {
    const base = `"createdAt" < '${cutoff.toISOString()}'`;
    return rule.extraWhere ? `${base} AND ${rule.extraWhere}` : base;
  }

  private buildCountQuery(table: string, where: string): Prisma.Sql {
    // SQL is composed from a constant table allow-list (RETENTION_RULES) and
    // a constructed `where` whose only interpolation is an ISO-formatted Date.
    // No user input reaches this string — Prisma.raw is acceptable here.
    return Prisma.raw(`SELECT count(*)::bigint AS n FROM "${table}" WHERE ${where}`);
  }

  private buildDeleteQuery(table: string, where: string, batch: number): Prisma.Sql {
    // DELETE … WHERE ctid IN (SELECT ctid … LIMIT N) is the standard Postgres
    // trick to batch a DELETE without an `id` constraint per table.
    return Prisma.raw(
      `DELETE FROM "${table}" WHERE ctid IN (SELECT ctid FROM "${table}" WHERE ${where} LIMIT ${batch})`,
    );
  }
}
