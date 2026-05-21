import "server-only";
import { API_URL } from "./env";

export interface ServiceProbe {
  name: string;
  status: "ok" | "warn" | "down";
  latencyMs: number | null;
  detail: string | null;
}

async function probe(url: string, timeoutMs = 5000): Promise<{ ok: boolean; ms: number; status: number | null }> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    return { ok: res.ok, ms: Date.now() - start, status: res.status };
  } catch {
    return { ok: false, ms: Date.now() - start, status: null };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Live status probe — runs cheap HEAD/GET against each upstream and converts
 * the result to a uniform shape. Slow (>1s) is classified "warn", failed
 * is "down".
 */
export async function fetchServiceStatus(): Promise<ServiceProbe[]> {
  const [apiLive, apiReady, anilist] = await Promise.all([
    probe(new URL("/health", API_URL).toString()),
    probe(new URL("/health/ready", API_URL).toString()),
    probe("https://graphql.anilist.co/", 3000),
  ]);

  function classify(ok: boolean, ms: number): "ok" | "warn" | "down" {
    if (!ok) return "down";
    if (ms > 1500) return "warn";
    return "ok";
  }

  return [
    {
      name: "Miru API",
      status: classify(apiLive.ok, apiLive.ms),
      latencyMs: apiLive.ok ? apiLive.ms : null,
      detail: apiLive.ok ? null : "Service injoignable.",
    },
    {
      name: "Base de données",
      status: classify(apiReady.ok, apiReady.ms),
      latencyMs: apiReady.ok ? apiReady.ms : null,
      detail: apiReady.ok ? null : "Lecture rejetée par l'API.",
    },
    {
      name: "AniList GraphQL",
      // AniList may return 404 on a bare GET — that still proves reachability.
      status: anilist.status ? "ok" : "down",
      latencyMs: anilist.status ? anilist.ms : null,
      detail: anilist.status ? null : "Hôte distant injoignable.",
    },
  ];
}
