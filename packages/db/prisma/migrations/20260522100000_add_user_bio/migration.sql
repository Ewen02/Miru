-- Public bio for /u/[handle]. App layer caps at 250 chars; DB allows
-- slack (280) for edge cases. Nullable — empty = no bio shown.
ALTER TABLE "User" ADD COLUMN "bio" VARCHAR(280);
