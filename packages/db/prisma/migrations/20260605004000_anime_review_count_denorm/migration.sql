-- Denormalized review counter on Anime. Maintained by the review repo
-- on save()/remove() in the same transaction that recomputes averageRating.

ALTER TABLE "Anime" ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- Backfill from existing reviews. Cast COUNT to int — Postgres returns
-- bigint by default.
UPDATE "Anime" a
SET "reviewCount" = COALESCE((
  SELECT count(*)::int FROM "Review" r WHERE r."animeId" = a.id
), 0);
