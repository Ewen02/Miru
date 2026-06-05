-- Denormalized like counter on List, sorted index for public ranking.
-- The repo maintains likeCount on every like()/unlike() inside a transaction,
-- so the column stays in sync without a Postgres trigger.

ALTER TABLE "List" ADD COLUMN "likeCount" INTEGER NOT NULL DEFAULT 0;

-- Backfill from existing ListLike rows so the new column is correct from day one.
UPDATE "List" l
SET "likeCount" = COALESCE((
  SELECT count(*)::int FROM "ListLike" ll WHERE ll."listId" = l.id
), 0);

-- Public-ranking index — replaces the LEFT JOIN + GROUP BY plan with a
-- straight index scan.
CREATE INDEX IF NOT EXISTS "List_isPublic_likeCount_updatedAt_idx"
  ON "List" ("isPublic", "likeCount" DESC, "updatedAt" DESC);
