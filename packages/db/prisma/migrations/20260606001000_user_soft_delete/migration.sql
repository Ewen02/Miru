-- S4-03 — soft delete with a 30-day grace window.
-- A non-null `deletedAt` means the user has scheduled their account for
-- deletion. The retention scheduler hard-deletes once 30 days have passed.
-- Login + profile flows treat a soft-deleted user as non-existent in the
-- intervening window; cancelling restores the account by clearing the field.

ALTER TABLE "User"
  ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Partial index — only rows currently in the grace window need to be found
-- by the cleanup cron, so we keep the index tiny.
CREATE INDEX "User_deletedAt_idx" ON "User" ("deletedAt")
  WHERE "deletedAt" IS NOT NULL;
