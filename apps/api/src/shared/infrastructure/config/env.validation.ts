/**
 * Fail-fast environment validation, called from main.ts before NestFactory.
 *
 * Goal: refuse to boot if a misconfiguration would expose data or break the
 * app in production. Permissive in dev — only the variables that are
 * required-by-presence (DATABASE_URL, BETTER_AUTH_SECRET) are checked there.
 *
 * Zero new dependency: NestJS already ships nothing for env validation
 * and pulling Zod just for this would be overkill.
 */

const MIN_AUTH_SECRET_LEN = 32;
const FORBIDDEN_PROD_CREDENTIALS = [
  "miru:miru@",
  "postgres:postgres@",
  "user:password@",
];

export interface EnvValidationResult {
  errors: string[];
  warnings: string[];
}

export function validateEnv(env: NodeJS.ProcessEnv = process.env): EnvValidationResult {
  const isProd = env.NODE_ENV === "production";
  const errors: string[] = [];
  const warnings: string[] = [];

  // --- DATABASE_URL ---
  const dbUrl = env.DATABASE_URL;
  if (!dbUrl) {
    errors.push("DATABASE_URL is required");
  } else if (isProd) {
    if (!dbUrl.includes("sslmode=require")) {
      errors.push(
        "DATABASE_URL must include `?sslmode=require` in production (got: no sslmode)",
      );
    }
    for (const forbidden of FORBIDDEN_PROD_CREDENTIALS) {
      if (dbUrl.includes(forbidden)) {
        errors.push(`DATABASE_URL uses default credentials (${forbidden}) — refuse to boot`);
      }
    }
    if (!dbUrl.includes("connection_limit=")) {
      warnings.push(
        "DATABASE_URL has no `connection_limit` — Prisma defaults to 2×CPU+1 which is low for Railway micro",
      );
    }
  }

  // --- BETTER_AUTH_SECRET ---
  const secret = env.BETTER_AUTH_SECRET;
  if (!secret) {
    errors.push("BETTER_AUTH_SECRET is required");
  } else if (secret.length < MIN_AUTH_SECRET_LEN) {
    errors.push(
      `BETTER_AUTH_SECRET must be at least ${MIN_AUTH_SECRET_LEN} chars (got ${secret.length})`,
    );
  } else if (isProd && /^(generate-a-secret|change-me|test|dev)/i.test(secret)) {
    errors.push("BETTER_AUTH_SECRET looks like a placeholder — refuse to boot in production");
  }

  // --- URLs ---
  if (isProd) {
    const webOrigin = env.WEB_ORIGIN ?? "";
    const apiBase = env.API_BASE_URL ?? "";
    if (webOrigin.startsWith("http://") && !webOrigin.includes("localhost")) {
      errors.push("WEB_ORIGIN must use https:// in production");
    }
    if (apiBase.startsWith("http://") && !apiBase.includes("localhost")) {
      errors.push("API_BASE_URL must use https:// in production");
    }
  }

  return { errors, warnings };
}

/**
 * Validates and exits the process if any error is found. Logs warnings to
 * stderr (Pino is not booted yet at this point).
 */
export function assertValidEnv(env: NodeJS.ProcessEnv = process.env): void {
  const { errors, warnings } = validateEnv(env);
  for (const w of warnings) {
    process.stderr.write(`[env] WARN  ${w}\n`);
  }
  if (errors.length > 0) {
    for (const e of errors) {
      process.stderr.write(`[env] ERROR ${e}\n`);
    }
    process.stderr.write(`[env] Refusing to boot with ${errors.length} validation error(s).\n`);
    process.exit(1);
  }
}
