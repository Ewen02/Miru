-- Perf Sprint 7 — additional indexes for raw-SQL stats queries,
-- forum listings, catalog filters and the global trending feed.
-- All additive (CREATE INDEX IF NOT EXISTS).

-- PERF-S5-04 — lifetimeStatsByUserId.watchDayRows
--   date_trunc('day', "watchedAt") aggregation filtered by userId.
--   Composite covers both the GROUP BY day path and listWatchedEpisodes' ORDER BY watchedAt.
CREATE INDEX IF NOT EXISTS "UserEpisode_userId_watchedAt_idx"
  ON "UserEpisode" ("userId", "watchedAt" DESC);

-- PERF-S5-07 — yearInReviewByUserId
--   Three raw queries filter on COALESCE("completedAt", "updatedAt") date range
--   per userId. Two complementary indexes — completedAt for the common case,
--   updatedAt for the fallback path. Partial on NOT NULL keeps them tight.
CREATE INDEX IF NOT EXISTS "WatchlistEntry_userId_completedAt_idx"
  ON "WatchlistEntry" ("userId", "completedAt" DESC)
  WHERE "completedAt" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "WatchlistEntry_userId_updatedAt_idx"
  ON "WatchlistEntry" ("userId", "updatedAt" DESC);

-- PERF-S5-06 — listThreads orders by updatedAt, not createdAt.
--   Drop the ascending index that no query reads and add the sort-aware one.
--   Keep ForumThread_createdAt_desc_idx — it serves the homepage "latest threads" feed.
DROP INDEX IF EXISTS "ForumThread_category_createdAt_idx";
CREATE INDEX IF NOT EXISTS "ForumThread_category_updatedAt_idx"
  ON "ForumThread" ("category", "updatedAt" DESC);

-- DB-C2 — common catalog filter combo: status=X AND year=Y ORDER BY averageRating DESC.
--   Covers the multi-dim filter without falling back to a Sort node.
CREATE INDEX IF NOT EXISTS "Anime_status_year_rating_idx"
  ON "Anime" ("status", "year", "averageRating" DESC NULLS LAST);

-- API-B4 — global trending feed orders by createdAt DESC, no filter.
--   ActivityEvent has (userId, createdAt DESC) for per-user, nothing for global.
CREATE INDEX IF NOT EXISTS "ActivityEvent_createdAt_desc_idx"
  ON "ActivityEvent" ("createdAt" DESC);
