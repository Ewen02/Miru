-- CreateTable
CREATE TABLE "EpisodeReaction" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secondMark" INTEGER NOT NULL,
    "kind" VARCHAR(16) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EpisodeReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EpisodeReaction_episodeId_secondMark_idx" ON "EpisodeReaction"("episodeId", "secondMark");

-- CreateIndex
CREATE INDEX "EpisodeReaction_episodeId_userId_idx" ON "EpisodeReaction"("episodeId", "userId");

-- AddForeignKey
ALTER TABLE "EpisodeReaction" ADD CONSTRAINT "EpisodeReaction_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeReaction" ADD CONSTRAINT "EpisodeReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
