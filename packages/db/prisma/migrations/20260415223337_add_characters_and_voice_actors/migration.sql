-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "externalAnilistId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameJp" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceActor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceActor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimeCharacter" (
    "animeId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "voiceActorId" TEXT,
    "role" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "AnimeCharacter_pkey" PRIMARY KEY ("animeId","characterId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Character_externalAnilistId_key" ON "Character"("externalAnilistId");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceActor_name_key" ON "VoiceActor"("name");

-- CreateIndex
CREATE INDEX "AnimeCharacter_animeId_idx" ON "AnimeCharacter"("animeId");

-- CreateIndex
CREATE INDEX "AnimeCharacter_characterId_idx" ON "AnimeCharacter"("characterId");

-- AddForeignKey
ALTER TABLE "AnimeCharacter" ADD CONSTRAINT "AnimeCharacter_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeCharacter" ADD CONSTRAINT "AnimeCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeCharacter" ADD CONSTRAINT "AnimeCharacter_voiceActorId_fkey" FOREIGN KEY ("voiceActorId") REFERENCES "VoiceActor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
