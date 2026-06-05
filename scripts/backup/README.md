# Postgres backup & disaster recovery

Nightly `pg_dump` → client-side `age` encryption → upload to Cloudflare R2.
Cost: **$0/month** under R2's 10 GB free tier (dump ≈ 50 MB → 1.5 GB over 30
days of daily retention).

## One-time setup

### 1. Generate the age keypair

```bash
mkdir -p ~/.age
age-keygen -o ~/.age/miru.key
# → outputs an `age1…` public key; copy it.
```

Store `~/.age/miru.key` **outside the repo and outside CI** (1Password, paper
in a safe). If you lose this key, encrypted backups are unrecoverable.

### 2. Create the Cloudflare R2 bucket

In the Cloudflare dashboard:

1. R2 → Create bucket → `miru-backups` (or any name).
2. R2 → Manage API tokens → "Create API token" with **Object Read & Write**
   scoped to the bucket. Note the access key ID + secret.
3. Optional: lifecycle rule "delete objects under `postgres/` older than 30
   days" — saves space.

### 3. GitHub secrets

Add to **repo settings → Secrets and variables → Actions**:

| Secret                  | Value                                          |
| ----------------------- | ---------------------------------------------- |
| `BACKUP_DATABASE_URL`   | Railway prod Postgres URL (with sslmode=require) |
| `BACKUP_AGE_PUBLIC_KEY` | `age1…` from step 1                            |
| `BACKUP_R2_BUCKET`      | bucket name                                    |
| `BACKUP_R2_ENDPOINT`    | `https://<accountid>.r2.cloudflarestorage.com` |
| `BACKUP_R2_ACCESS_KEY`  | from step 2                                    |
| `BACKUP_R2_SECRET_KEY`  | from step 2                                    |

The workflow [.github/workflows/backup-nightly.yml](../../.github/workflows/backup-nightly.yml)
runs every day at 03:00 UTC.

## Restoring

```bash
# Sanity check: restore latest dump into a throwaway local DB.
docker run -d --rm --name restore-test \
  -e POSTGRES_PASSWORD=test -e POSTGRES_USER=test -e POSTGRES_DB=test \
  -p 55432:5432 postgres:16-alpine

# Wait a few seconds, then:
BACKUP_R2_BUCKET=miru-backups \
BACKUP_R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com \
AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... \
AGE_IDENTITY_FILE=~/.age/miru.key \
TARGET_DATABASE_URL="postgres://test:test@localhost:55432/test" \
./scripts/backup/restore.sh latest

# Verify:
psql "postgres://test:test@localhost:55432/test" -c '\dt'

# Cleanup:
docker stop restore-test
```

For a real production restore, point `TARGET_DATABASE_URL` to a fresh
Railway DB and set `I_KNOW_WHAT_IM_DOING=1` (refuses by default if the URL
contains `prod`).

## RTO / RPO

- **RPO (data loss tolerance)**: ≤ 24 h (nightly cadence).
  Combine with Railway's own snapshots for tighter RPO if needed.
- **RTO (recovery time)**: ~10 min for 100 MB dump on a Railway Pro DB —
  `pg_restore --jobs=4` is parallelised.

## Key rotation

Rotate the age key once a year:

1. Generate `~/.age/miru-2027.key`.
2. Update `BACKUP_AGE_PUBLIC_KEY` GitHub secret to the new public key.
3. Wait until the next nightly backup runs (≤ 24 h).
4. Keep the old private key in cold storage for at least 30 days (overlap
   with the retention window).
