-- Perf Sprint 5 — composite indexes covering hot paths uncovered by the
-- audit. All additive (CREATE INDEX IF NOT EXISTS), zero-downtime.

-- DBPERF-01 — profile favorites listing (WatchlistEntry where isFavorite=true)
--   query: WHERE userId = $1 AND isFavorite = true ORDER BY rating DESC NULLS LAST, updatedAt DESC
--   partial index keeps it tiny (only the ~5% of rows that are favorites).
CREATE INDEX IF NOT EXISTS "WatchlistEntry_userId_favorites_idx"
  ON "WatchlistEntry" ("userId", "rating" DESC NULLS LAST, "updatedAt" DESC)
  WHERE "isFavorite" = true;

-- DBPERF-02 — markRead on opening a DM conversation
--   query: UPDATE DirectMessage SET readAt=now() WHERE conversationId=$1 AND senderId != $2 AND readAt IS NULL
--   partial on unread keeps the index small even on huge conversations.
CREATE INDEX IF NOT EXISTS "DirectMessage_conversation_sender_unread_idx"
  ON "DirectMessage" ("conversationId", "senderId")
  WHERE "readAt" IS NULL;

-- PERF-06 — listWatchedEpisodes(userId, animeId): need (episodeId, animeId)
--   so the join via episode.animeId is index-only.
CREATE INDEX IF NOT EXISTS "Episode_id_animeId_idx"
  ON "Episode" ("id", "animeId");

-- DBPERF-05 — Notification pagination
--   Existing (userId, createdAt) does a backward scan for the typical
--   ORDER BY createdAt DESC. Replace with a sort-aware one.
DROP INDEX IF EXISTS "Notification_userId_createdAt_idx";
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_desc_idx"
  ON "Notification" ("userId", "createdAt" DESC);

-- DBPERF-03 — unread Notification bell counter
--   partial index ~10x smaller than the full (userId, readAt) index.
DROP INDEX IF EXISTS "Notification_userId_readAt_idx";
CREATE INDEX IF NOT EXISTS "Notification_userId_unread_idx"
  ON "Notification" ("userId")
  WHERE "readAt" IS NULL;

-- DBPERF-14 — Conversation inbox sorted by recency, per user side
--   listConversations: WHERE (userAId=$1 OR userBId=$1) ORDER BY lastMessageAt DESC.
--   Postgres OR with two indexed columns uses BitmapOr over the two indexes.
CREATE INDEX IF NOT EXISTS "Conversation_userAId_lastMessageAt_desc_idx"
  ON "Conversation" ("userAId", "lastMessageAt" DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS "Conversation_userBId_lastMessageAt_desc_idx"
  ON "Conversation" ("userBId", "lastMessageAt" DESC NULLS LAST);

-- DBPERF-10 — reverse-pivot lookups
--   UserEpisode pivot is (userId, episodeId) via @@id, plus single-col indexes
--   on each side. No issue here. PollVote however lacks a userId index.
CREATE INDEX IF NOT EXISTS "PollVote_userId_idx"
  ON "PollVote" ("userId");

-- DBPERF-13 — _AnimeGenres pivot
--   Implicit unique covers (A, B). lifetimeStatsByUserId joins on A alone.
CREATE INDEX IF NOT EXISTS "_AnimeGenres_A_idx" ON "_AnimeGenres" ("A");
