-- CreateTable
CREATE TABLE "Platform" (
  "id"        TEXT          NOT NULL,
  "name"      TEXT          NOT NULL,
  "slug"      TEXT          NOT NULL,
  "iconUrl"   TEXT,
  "color"     VARCHAR(7),
  "baseUrl"   TEXT          NOT NULL,
  "createdAt" TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3)  NOT NULL,

  CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Platform_name_key"    ON "Platform"("name");
CREATE UNIQUE INDEX "Platform_slug_key"    ON "Platform"("slug");
CREATE UNIQUE INDEX "Platform_baseUrl_key" ON "Platform"("baseUrl");

-- CreateTable
CREATE TABLE "AnimeOnPlatform" (
  "animeId"    TEXT          NOT NULL,
  "platformId" TEXT          NOT NULL,
  "url"        TEXT          NOT NULL,
  "source"     VARCHAR(16)   NOT NULL DEFAULT 'ANILIST',
  "verifiedAt" TIMESTAMP(3),

  CONSTRAINT "AnimeOnPlatform_pkey" PRIMARY KEY ("animeId", "platformId")
);

CREATE INDEX "AnimeOnPlatform_animeId_idx"    ON "AnimeOnPlatform"("animeId");
CREATE INDEX "AnimeOnPlatform_platformId_idx" ON "AnimeOnPlatform"("platformId");

-- AddForeignKey
ALTER TABLE "AnimeOnPlatform"
  ADD CONSTRAINT "AnimeOnPlatform_animeId_fkey"
  FOREIGN KEY ("animeId") REFERENCES "Anime"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AnimeOnPlatform"
  ADD CONSTRAINT "AnimeOnPlatform_platformId_fkey"
  FOREIGN KEY ("platformId") REFERENCES "Platform"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
