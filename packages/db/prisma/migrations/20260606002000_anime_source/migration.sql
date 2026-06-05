-- S4-06 — source material for catalog filtering ("Based on Manga" badge,
-- ?source=MANGA filter). Stored as a short opaque string instead of a
-- Postgres enum so AniList can introduce new values without a migration.
-- Application-layer code validates against a known set; everything else
-- is shown raw to admins (and ignored by the filter UI).

ALTER TABLE "Anime"
  ADD COLUMN "source" VARCHAR(20);

-- Filtering by source is a typical "narrow then sort by averageRating"
-- shape — composite index serves the common /?source=MANGA + sort=RATING.
CREATE INDEX "Anime_source_averageRating_idx"
  ON "Anime" ("source", "averageRating" DESC NULLS LAST)
  WHERE "source" IS NOT NULL;
