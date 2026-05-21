-- UserPreferences — one row per user, created on demand by the
-- application. Missing row is interpreted as "user accepts defaults".

CREATE TABLE "UserPreferences" (
  "userId"              TEXT NOT NULL,
  "emailNewEpisodes"    BOOLEAN NOT NULL DEFAULT true,
  "emailWeeklyRecap"    BOOLEAN NOT NULL DEFAULT true,
  "emailReviewReply"    BOOLEAN NOT NULL DEFAULT false,
  "emailNewFollower"    BOOLEAN NOT NULL DEFAULT false,
  "inAppEpisodeAired"   BOOLEAN NOT NULL DEFAULT true,
  "inAppRecommendation" BOOLEAN NOT NULL DEFAULT true,
  "inAppMention"        BOOLEAN NOT NULL DEFAULT true,
  "quietFromHour"       SMALLINT,
  "quietToHour"         SMALLINT,
  "updatedAt"           TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("userId"),
  CONSTRAINT "UserPreferences_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);
