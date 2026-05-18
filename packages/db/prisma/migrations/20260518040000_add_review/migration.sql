CREATE TABLE "Review" (
  "id"        TEXT          NOT NULL,
  "userId"    TEXT          NOT NULL,
  "animeId"   TEXT          NOT NULL,
  "rating"    INTEGER       NOT NULL,
  "body"      TEXT,
  "createdAt" TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3)  NOT NULL,

  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Review_userId_animeId_key" ON "Review"("userId", "animeId");
CREATE INDEX "Review_animeId_idx"               ON "Review"("animeId");
CREATE INDEX "Review_userId_idx"                ON "Review"("userId");

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_animeId_fkey"
  FOREIGN KEY ("animeId") REFERENCES "Anime"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
