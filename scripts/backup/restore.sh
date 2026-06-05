#!/usr/bin/env bash
#
# Disaster recovery: download a Postgres dump from R2, decrypt it with age,
# and restore into a target database.
#
# Usage:
#   BACKUP_R2_BUCKET=… \
#   BACKUP_R2_ENDPOINT=https://….r2.cloudflarestorage.com \
#   AWS_ACCESS_KEY_ID=… AWS_SECRET_ACCESS_KEY=… \
#   AGE_IDENTITY_FILE=~/.age/miru.key \
#   TARGET_DATABASE_URL="postgres://…" \
#   ./scripts/backup/restore.sh [<s3-key>|latest]
#
# Defaults to the `LATEST` pointer file written by dump-and-upload.sh.
#
# Safety rails:
#   - Refuses to restore on top of a non-empty DB unless `FORCE=1`.
#   - Refuses to target a host containing `prod` unless `I_KNOW_WHAT_IM_DOING=1`.

set -euo pipefail

: "${BACKUP_R2_BUCKET:?BACKUP_R2_BUCKET required}"
: "${BACKUP_R2_ENDPOINT:?BACKUP_R2_ENDPOINT required}"
: "${AWS_ACCESS_KEY_ID:?AWS_ACCESS_KEY_ID required}"
: "${AWS_SECRET_ACCESS_KEY:?AWS_SECRET_ACCESS_KEY required}"
: "${AGE_IDENTITY_FILE:?AGE_IDENTITY_FILE required (path to age private key)}"
: "${TARGET_DATABASE_URL:?TARGET_DATABASE_URL required}"

KEY_ARG="${1:-latest}"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "${WORKDIR}"' EXIT

if [[ "${TARGET_DATABASE_URL}" == *prod* && "${I_KNOW_WHAT_IM_DOING:-0}" != "1" ]]; then
  echo "[restore] TARGET_DATABASE_URL looks like production. Set I_KNOW_WHAT_IM_DOING=1 to proceed." >&2
  exit 2
fi

if [[ "${KEY_ARG}" == "latest" ]]; then
  echo "[restore] fetching pointer file LATEST"
  aws --endpoint-url "${BACKUP_R2_ENDPOINT}" s3 cp \
    "s3://${BACKUP_R2_BUCKET}/postgres/LATEST" \
    "${WORKDIR}/LATEST" --no-progress
  S3_KEY="$(cat "${WORKDIR}/LATEST")"
else
  S3_KEY="${KEY_ARG}"
fi

echo "[restore] downloading s3://${BACKUP_R2_BUCKET}/${S3_KEY}"
ENC_FILE="${WORKDIR}/dump.age"
aws --endpoint-url "${BACKUP_R2_ENDPOINT}" s3 cp \
  "s3://${BACKUP_R2_BUCKET}/${S3_KEY}" \
  "${ENC_FILE}" --no-progress

DUMP_FILE="${WORKDIR}/dump"
echo "[restore] decrypting"
age --decrypt --identity "${AGE_IDENTITY_FILE}" --output "${DUMP_FILE}" "${ENC_FILE}"

# Safety check: refuse non-empty DB unless FORCE=1
EXISTING_TABLES="$(psql "${TARGET_DATABASE_URL}" -At -c \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'")"
if [[ "${EXISTING_TABLES}" -gt 0 && "${FORCE:-0}" != "1" ]]; then
  echo "[restore] target DB has ${EXISTING_TABLES} tables. Set FORCE=1 to overwrite." >&2
  exit 3
fi

echo "[restore] running pg_restore"
pg_restore \
  --dbname="${TARGET_DATABASE_URL}" \
  --no-owner --no-acl \
  --clean --if-exists \
  --jobs=4 \
  "${DUMP_FILE}"

echo "[restore] done"
