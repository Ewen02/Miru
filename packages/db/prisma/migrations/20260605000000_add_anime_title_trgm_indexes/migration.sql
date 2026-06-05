-- Trigram indexes on Anime titles to accelerate ILIKE '%foo%' searches.
-- Without these, search.use-case does a full table scan (~1s @5k animes).
-- pg_trgm is bundled with PostgreSQL — Railway enables it on demand.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Anime_title_trgm_idx"
  ON "Anime" USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Anime_titleEn_trgm_idx"
  ON "Anime" USING GIN ("titleEn" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Anime_titleJp_trgm_idx"
  ON "Anime" USING GIN ("titleJp" gin_trgm_ops);
