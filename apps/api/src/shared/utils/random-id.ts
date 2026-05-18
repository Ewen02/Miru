import { randomUUID } from "node:crypto";

/**
 * Generates an opaque, URL-safe identifier for entities that are created in
 * the application layer (i.e. not derived from an external upstream id).
 * Format-compatible with Prisma `String @id @default(cuid())` columns.
 */
export function randomId(): string {
  return randomUUID();
}
