ALTER TABLE "Anime"
  ADD COLUMN "syncedAt"     TIMESTAMP(3),
  ADD COLUMN "syncFailedAt" TIMESTAMP(3);

CREATE INDEX "Anime_syncedAt_idx" ON "Anime"("syncedAt");
