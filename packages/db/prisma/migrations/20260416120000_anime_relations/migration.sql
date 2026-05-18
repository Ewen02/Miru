CREATE TABLE "AnimeRelation" (
  "id"                        TEXT        NOT NULL,
  "animeId"                   TEXT        NOT NULL,
  "relatedExternalAnilistId"  INTEGER     NOT NULL,
  "relationType"              TEXT        NOT NULL,
  "title"                     TEXT        NOT NULL,
  "coverUrl"                  TEXT,
  "format"                    TEXT,
  "year"                      INTEGER,

  CONSTRAINT "AnimeRelation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AnimeRelation_animeId_relatedExternalAnilistId_key"
  ON "AnimeRelation"("animeId", "relatedExternalAnilistId");

CREATE INDEX "AnimeRelation_animeId_idx" ON "AnimeRelation"("animeId");
CREATE INDEX "AnimeRelation_relatedExternalAnilistId_idx"
  ON "AnimeRelation"("relatedExternalAnilistId");

ALTER TABLE "AnimeRelation"
  ADD CONSTRAINT "AnimeRelation_animeId_fkey"
  FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
