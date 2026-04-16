-- Drop unique constraint on name (homonymes possibles entre VA)
DROP INDEX IF EXISTS "VoiceActor_name_key";

-- Add externalAnilistId column (nullable, unique)
ALTER TABLE "VoiceActor" ADD COLUMN "externalAnilistId" INTEGER;
CREATE UNIQUE INDEX "VoiceActor_externalAnilistId_key" ON "VoiceActor"("externalAnilistId");

-- Replace name unique with a simple index
CREATE INDEX "VoiceActor_name_idx" ON "VoiceActor"("name");
