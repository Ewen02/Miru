#!/usr/bin/env bash
#
# Fails the CI job if any newly-added migration contains a destructive
# statement (DROP TABLE/COLUMN, ALTER COLUMN type change, RENAME) unless
# the PR carries the `db-destructive` label as an explicit ack.
#
# Lives under scripts/ so it's runnable locally too:
#   GITHUB_BASE_REF=main ./scripts/ci/check-migration-safety.sh
#
# Conservative regex — false positives are preferable to false negatives
# here. A label override is the escape hatch.

set -euo pipefail

BASE="${GITHUB_BASE_REF:-main}"
LABEL_ACK="${PR_HAS_DESTRUCTIVE_LABEL:-false}"

# Fetch the base ref so `git diff` has something to compare to in the
# shallow clone GitHub Actions provides.
if ! git rev-parse --verify "origin/${BASE}" >/dev/null 2>&1; then
  git fetch --depth=50 origin "${BASE}" || true
fi

MIGRATION_DIR="packages/db/prisma/migrations"
ADDED_FILES=$(git diff --name-only --diff-filter=A "origin/${BASE}...HEAD" -- "${MIGRATION_DIR}" \
  | grep -E '\.sql$' || true)

if [[ -z "${ADDED_FILES}" ]]; then
  echo "[migration-check] no new migration files."
  exit 0
fi

echo "[migration-check] inspecting:"
echo "${ADDED_FILES}"

DESTRUCTIVE_RE='(^|[[:space:]])(DROP[[:space:]]+(TABLE|COLUMN|INDEX|CONSTRAINT)|ALTER[[:space:]]+TABLE[[:space:]]+[^;]+ALTER[[:space:]]+COLUMN[[:space:]]+[^;]+TYPE|ALTER[[:space:]]+TABLE[[:space:]]+[^;]+RENAME)'

HITS=$(echo "${ADDED_FILES}" | xargs grep -EHin "${DESTRUCTIVE_RE}" || true)

if [[ -z "${HITS}" ]]; then
  echo "[migration-check] no destructive statements found."
  exit 0
fi

echo "[migration-check] destructive statements detected:"
echo "${HITS}"

if [[ "${LABEL_ACK}" == "true" ]]; then
  echo "[migration-check] PR carries 'db-destructive' label — acknowledged."
  exit 0
fi

cat >&2 <<'MSG'

[migration-check] FAILED

A migration contains a destructive statement (DROP, ALTER COLUMN TYPE, RENAME).
These break running deploys and cannot roll back without a restore.

If this is intentional, add the `db-destructive` label to the PR. This
is a deliberate, audited acknowledgement — not a routine bypass.

MSG
exit 1
