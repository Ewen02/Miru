/**
 * Per-table retention windows. Tuned conservatively — bumping a window
 * down later is a one-line change, bumping up after data is gone isn't.
 *
 * Rules are interpreted by RetentionScheduler:
 *  - `keepDays`: rows older than this are deletion candidates.
 *  - `dateColumn`: the date column compared to (cutoff = now - keepDays).
 *    Default `"createdAt"`. Use `"expiresAt"` for tables that have an
 *    explicit lifetime (sessions, tokens), so we never delete a still-
 *    valid row just because it was minted long ago.
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
  dateColumn?: string;
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
  {
    // CONFIG-D3: Better Auth refreshes session.updatedAt rather than minting
    // new rows, but expired sessions never get cleaned up. Delete only rows
    // whose `expiresAt` is at least 60 days in the past — generous grace
    // window so a long-paused user keeps their session.
    table: "Session",
    keepDays: 60,
    description: "Expired sessions older than 60 days",
    dateColumn: "expiresAt",
  },
  {
    // S2-05: NotificationDedup keys live as long as the dedup window we care
    // about — an episode notification can't be "duplicated" 60 days later
    // since the cron's airedAt window is hourly. 60 days is generous and
    // keeps the table bounded.
    table: "NotificationDedup",
    keepDays: 60,
    description: "Notification dedup keys older than 60 days",
  },
  {
    // S4-03: hard-delete users whose 30-day grace window has elapsed.
    // Cascades wipe every row owned by the user (watchlist, reviews,
    // lists, notifications, sessions, etc.). Marked separately from the
    // app-data tables above because the deletion semantics are different:
    // here keepDays measures the grace period, not the retention window.
    table: "User",
    keepDays: 30,
    description: "Users soft-deleted more than 30 days ago",
    dateColumn: "deletedAt",
  },
];

/** Batch size for DELETE … WHERE id IN (LIMIT N). Avoids long table locks. */
export const RETENTION_BATCH_SIZE = 1000;
