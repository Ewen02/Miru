-- Sympathisant (Pro) support — no feature gating, just a profile badge.
-- All fields nullable so the unique constraints don't block existing rows.

ALTER TABLE "User"
  ADD COLUMN "stripeCustomerId" TEXT,
  ADD COLUMN "stripeSubId"      TEXT,
  ADD COLUMN "proSince"         TIMESTAMP(3);

CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubId_key"      ON "User"("stripeSubId");
