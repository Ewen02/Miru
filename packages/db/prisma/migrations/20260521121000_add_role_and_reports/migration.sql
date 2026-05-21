-- User role (defaults to "USER"; "ADMIN" unlocks /admin).
ALTER TABLE "User" ADD COLUMN "role" VARCHAR(16) NOT NULL DEFAULT 'USER';

-- Reports — moderation queue.
CREATE TABLE "Report" (
  "id"           TEXT NOT NULL,
  "reporterId"   TEXT NOT NULL,
  "resolvedById" TEXT,
  "targetKind"   VARCHAR(16) NOT NULL,
  "targetId"     VARCHAR(60) NOT NULL,
  "reason"       VARCHAR(40) NOT NULL,
  "details"      TEXT,
  "resolved"     BOOLEAN NOT NULL DEFAULT false,
  "resolvedAt"   TIMESTAMP(3),
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Report_resolved_createdAt_idx" ON "Report"("resolved", "createdAt");
CREATE INDEX "Report_targetKind_targetId_idx" ON "Report"("targetKind", "targetId");

ALTER TABLE "Report"
  ADD CONSTRAINT "Report_reporterId_fkey"
    FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Report_resolvedById_fkey"
    FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
