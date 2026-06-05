#!/usr/bin/env bash
#
# Catalog-only snapshot (Anime, Episode, Character, VoiceActor, Studio,
# Genre, Platform, AnimeCharacter, AnimeRelation, AnimeOnPlatform).
#
# Why a separate flow from the full nightly pg_dump:
#  - "I want to bootstrap a fresh dev DB with a real catalog but no users"
#  - "I'm restoring after a bad migration that only touched catalog rows"
#  - "I want to ship a sample dataset to a new contributor"
#
# Outputs an unencrypted .dump file under ./snapshots/ — meant for local
# use. For prod backups, the full nightly flow in dump-and-upload.sh is
# the source of truth.
#
# Usage:
#   DATABASE_URL=… ./scripts/backup/snapshot-catalog.sh

set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL required}"

mkdir -p snapshots
STAMP="$(date -u +%Y%m%d)"
OUT="snapshots/catalog-${STAMP}.dump"

CATALOG_TABLES=(
  Anime
  Studio
  Genre
  Platform
  Episode
  Character
  VoiceActor
  AnimeCharacter
  AnimeRelation
  AnimeOnPlatform
  EpisodePlatformLink
)

TABLE_FLAGS=()
for t in "${CATALOG_TABLES[@]}"; do
  TABLE_FLAGS+=(--table "${t}")
done

# We dump the genre join table too — Prisma names it `_AnimeGenres`.
TABLE_FLAGS+=(--table _AnimeGenres)

echo "[snapshot] writing ${OUT}"
pg_dump \
  --format=custom \
  --no-owner --no-acl \
  --data-only \
  "${TABLE_FLAGS[@]}" \
  --file="${OUT}" \
  "${DATABASE_URL}"

SIZE=$(wc -c <"${OUT}")
echo "[snapshot] done — ${SIZE} bytes"
echo ""
echo "Restore into a fresh local DB with:"
echo "  pg_restore --dbname=\"\$LOCAL_DATABASE_URL\" --data-only ${OUT}"
