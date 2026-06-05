import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Tag-based cache invalidation endpoint, called by the API layer after a
 * write that should immediately invalidate Next.js's persistent fetch cache
 * (sync imports, manual catalog edits, review writes, …).
 *
 * Auth: shared secret in `Authorization: Bearer <REVALIDATE_TOKEN>`. The
 * token is configured server-side only; never expose it to the client.
 *
 * Request body: `{ "tags": ["catalog", "anime:demon-slayer"] }`.
 *
 * Returns 200 with the list of invalidated tags. 401 if the token is wrong
 * or missing. 400 if the body is malformed.
 *
 * Wire from the API:
 *   await fetch(`${WEB_ORIGIN}/api/revalidate`, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
 *     body: JSON.stringify({ tags: ["catalog"] }),
 *   });
 */
export async function POST(req: Request) {
  const expected = process.env.REVALIDATE_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "revalidate disabled" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const tags = parseTags(payload);
  if (tags.length === 0) {
    return NextResponse.json({ error: "no tags provided" }, { status: 400 });
  }

  // Next 16: profile "max" → stale-while-revalidate, the recommended default.
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: tags });
}

function parseTags(payload: unknown): string[] {
  if (typeof payload !== "object" || payload === null) return [];
  const raw = (payload as { tags?: unknown }).tags;
  if (!Array.isArray(raw)) return [];
  return raw.filter((t): t is string => typeof t === "string" && t.length > 0).slice(0, 50);
}
