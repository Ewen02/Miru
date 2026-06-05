import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { RetentionScheduler } from "./retention.scheduler";

/**
 * Cross-module cron jobs that don't belong to a specific domain.
 * Currently just the retention scheduler; future hosts: a queue health
 * monitor, a stripe webhook reconciliation, etc.
 */
@Module({
  imports: [PrismaModule],
  providers: [RetentionScheduler],
})
export class SchedulerModule {}
