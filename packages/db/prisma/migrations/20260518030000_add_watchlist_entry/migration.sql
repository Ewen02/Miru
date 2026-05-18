CREATE TABLE "WatchlistEntry" (
  "userId"         TEXT          NOT NULL,
  "animeId"        TEXT          NOT NULL,
  "status"         VARCHAR(16)   NOT NULL,
  "currentEpisode" INTEGER       NOT NULL DEFAULT 0,
  "rating"         INTEGER,
  "isFavorite"     BOOLEAN       NOT NULL DEFAULT false,
  "startedAt"      TIMESTAMP(3),
  "completedAt"    TIMESTAMP(3),
  "createdAt"      TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3)  NOT NULL,

  CONSTRAINT "WatchlistEntry_pkey" PRIMARY KEY ("userId", "animeId")
);

CREATE INDEX "WatchlistEntry_userId_idx"         ON "WatchlistEntry"("userId");
CREATE INDEX "WatchlistEntry_userId_status_idx"  ON "WatchlistEntry"("userId", "status");
CREATE INDEX "WatchlistEntry_animeId_idx"        ON "WatchlistEntry"("animeId");

ALTER TABLE "WatchlistEntry"
  ADD CONSTRAINT "WatchlistEntry_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WatchlistEntry"
  ADD CONSTRAINT "WatchlistEntry_animeId_fkey"
  FOREIGN KEY ("animeId") REFERENCES "Anime"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
