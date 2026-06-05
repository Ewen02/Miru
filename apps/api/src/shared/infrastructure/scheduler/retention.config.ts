/**
 * Per-table retention windows. Tuned conservatively — bumping a window
 * down later is a one-line change, bumping up after data is gone isn't.
 *
 * Rules are interpreted by RetentionScheduler:
 *  - `keepDays`: rows older than this are deletion candidates.
 *  - `extraWhere`: additional predicate (e.g. only purge read notifs).
 *  - `description`: shown in logs.
 *
 * Activation: RETENTION_DRY_RUN=true (default) only logs counts. Flip
 * to "false" once a week of dry-run output looks sane.
 */
export interface RetentionRule {
  table: string;
  keepDays: number;
  description: string;
  /** Raw SQL appended to the WHERE clause (Prisma raw query). Optional. */
  extraWhere?: string;
}

export const RETENTION_RULES: RetentionRule[] = [
  {
    table: "Notification",
    keepDays: 90,
    description: "Read notifications older than 90 days",
    extraWhere: '"readAt" IS NOT NULL',
  },
  {
    table: "ActivityEvent",
    keepDays: 180,
    description: "Activity feed events older than 180 days",
  },
  {
    table: "EpisodeReaction",
    keepDays: 365,
    description: "Episode reactions older than 1 year",
  },
];

/** Batch size for DELETE … WHERE id IN (LIMIT N). Avoids long table locks. */
export const RETENTION_BATCH_SIZE = 1000;
