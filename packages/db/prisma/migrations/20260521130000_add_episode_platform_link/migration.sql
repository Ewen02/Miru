-- Phase 4 — per-episode streaming links (scraped). Inert when
-- ENABLE_SCRAPERS=false; the application layer filters at the use case.

CREATE TABLE "EpisodePlatformLink" (
  "id"         TEXT NOT NULL,
  "episodeId"  TEXT NOT NULL,
  "source"     VARCHAR(32) NOT NULL,
  "url"        VARCHAR(700) NOT NULL,
  "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "brokenAt"   TIMESTAMP(3),
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EpisodePlatformLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EpisodePlatformLink_episodeId_source_key"
  ON "EpisodePlatformLink"("episodeId", "source");

CREATE INDEX "EpisodePlatformLink_episodeId_idx"
  ON "EpisodePlatformLink"("episodeId");

CREATE INDEX "EpisodePlatformLink_source_brokenAt_idx"
  ON "EpisodePlatformLink"("source", "brokenAt");

ALTER TABLE "EpisodePlatformLink"
  ADD CONSTRAINT "EpisodePlatformLink_episodeId_fkey"
    FOREIGN KEY ("episodeId") REFERENCES "Episode"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
