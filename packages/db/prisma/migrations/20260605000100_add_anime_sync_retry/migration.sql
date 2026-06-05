-- Persistent retry queue for failed anime sync attempts.
-- Replaces the fire-and-forget markSyncFailed (which left animes stuck
-- "failed" forever) with an exponential-backoff schedule.

ALTER TABLE "Anime"
  ADD COLUMN "syncRetryAt" TIMESTAMP(3),
  ADD COLUMN "syncRetryCount" INTEGER NOT NULL DEFAULT 0;

-- Index supports the retry cron's hot query:
--   WHERE syncRetryAt <= now() AND syncRetryAt IS NOT NULL ORDER BY syncRetryAt
-- Partial index keeps it small (only rows currently scheduled).
CREATE INDEX "Anime_syncRetryAt_idx"
  ON "Anime" ("syncRetryAt")
  WHERE "syncRetryAt" IS NOT NULL;
