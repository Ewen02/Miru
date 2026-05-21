-- CreateTable
CREATE TABLE "UserEpisode" (
    "userId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEpisode_pkey" PRIMARY KEY ("userId","episodeId")
);

-- CreateIndex
CREATE INDEX "UserEpisode_userId_idx" ON "UserEpisode"("userId");

-- CreateIndex
CREATE INDEX "UserEpisode_episodeId_idx" ON "UserEpisode"("episodeId");

-- AddForeignKey
ALTER TABLE "UserEpisode" ADD CONSTRAINT "UserEpisode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEpisode" ADD CONSTRAINT "UserEpisode_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
