/*
  Warnings:

  - A unique constraint covering the columns `[externalMalId]` on the table `Anime` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Anime" ADD COLUMN     "externalMalId" INTEGER;

-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "filler" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "titleJp" TEXT,
ADD COLUMN     "titleRomaji" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Anime_externalMalId_key" ON "Anime"("externalMalId");
