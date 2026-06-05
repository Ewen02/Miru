-- Product sprints 1-4: persist onboarding investment, track privacy, dedup notifs.
-- All additive — zero downtime.

-- S1-01 — Track onboarding completion time (also a no-op probe for retention).
ALTER TABLE "User"
  ADD COLUMN "onboardedAt" TIMESTAMP(3);

-- S1-01 + S1-02 — Persist genres chosen during onboarding for cold-start recos.
ALTER TABLE "UserPreferences"
  ADD COLUMN "favoriteGenres" TEXT[] NOT NULL DEFAULT '{}';

-- S4-02 — Privacy toggle: hide the public profile from anyone but the owner.
ALTER TABLE "UserPreferences"
  ADD COLUMN "isPrivate" BOOLEAN NOT NULL DEFAULT FALSE;

-- S2-05 — Idempotency for episode-aired notifications.
-- The cron may legitimately retry; we dedup before pushing both in-app and
-- web push, so the user never sees a doubled notification.
CREATE TABLE "NotificationDedup" (
  "userId" TEXT NOT NULL,
  "kind" VARCHAR(16) NOT NULL,
  "dedupKey" VARCHAR(120) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NotificationDedup_pkey" PRIMARY KEY ("userId", "kind", "dedupKey")
);

-- Old entries are retention-purged after 60d via the retention scheduler.
CREATE INDEX "NotificationDedup_createdAt_idx"
  ON "NotificationDedup" ("createdAt");

ALTER TABLE "NotificationDedup"
  ADD CONSTRAINT "NotificationDedup_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
