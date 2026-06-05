#!/usr/bin/env bash
#
# Nightly Postgres backup: pg_dump → age encrypt → upload to Cloudflare R2.
# Runs from GitHub Actions (see .github/workflows/backup-nightly.yml).
#
# Required env:
#   DATABASE_URL              postgres://… (prod URL)
#   BACKUP_AGE_PUBLIC_KEY     age1… recipient public key (private key stays offline)
#   BACKUP_R2_BUCKET          bucket name
#   BACKUP_R2_ENDPOINT        https://<accountid>.r2.cloudflarestorage.com
#   AWS_ACCESS_KEY_ID         R2 access key
#   AWS_SECRET_ACCESS_KEY     R2 secret key
#
# Best practices:
#   - pg_dump --format=custom → restorable via pg_restore, parallel-restore friendly
#   - Client-side encryption with `age` BEFORE upload (R2 never sees plaintext)
#   - Date-prefixed filename → simple lifecycle rules + restore-by-date

set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL required}"
: "${BACKUP_AGE_PUBLIC_KEY:?BACKUP_AGE_PUBLIC_KEY required}"
: "${BACKUP_R2_BUCKET:?BACKUP_R2_BUCKET required}"
: "${BACKUP_R2_ENDPOINT:?BACKUP_R2_ENDPOINT required}"
: "${AWS_ACCESS_KEY_ID:?AWS_ACCESS_KEY_ID required}"
: "${AWS_SECRET_ACCESS_KEY:?AWS_SECRET_ACCESS_KEY required}"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
WORKDIR="$(mktemp -d)"
DUMP_FILE="${WORKDIR}/miru-${STAMP}.dump"
ENC_FILE="${DUMP_FILE}.age"
S3_KEY="postgres/miru-${STAMP}.dump.age"

cleanup() { rm -rf "${WORKDIR}"; }
trap cleanup EXIT

echo "[backup] pg_dump (custom format)"
pg_dump --format=custom --no-owner --no-acl --file="${DUMP_FILE}" "${DATABASE_URL}"
DUMP_BYTES="$(wc -c <"${DUMP_FILE}")"
echo "[backup] dump size: ${DUMP_BYTES} bytes"

echo "[backup] encrypting with age"
age --recipient "${BACKUP_AGE_PUBLIC_KEY}" --output "${ENC_FILE}" "${DUMP_FILE}"

echo "[backup] uploading to R2 → s3://${BACKUP_R2_BUCKET}/${S3_KEY}"
aws --endpoint-url "${BACKUP_R2_ENDPOINT}" s3 cp \
  "${ENC_FILE}" \
  "s3://${BACKUP_R2_BUCKET}/${S3_KEY}" \
  --no-progress

echo "[backup] also writing pointer file"
echo "${S3_KEY}" >"${WORKDIR}/LATEST"
aws --endpoint-url "${BACKUP_R2_ENDPOINT}" s3 cp \
  "${WORKDIR}/LATEST" \
  "s3://${BACKUP_R2_BUCKET}/postgres/LATEST" \
  --no-progress

echo "[backup] done: ${S3_KEY}"
