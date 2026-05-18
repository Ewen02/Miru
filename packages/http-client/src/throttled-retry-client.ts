const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_STATUSES = [429, 500, 502, 503, 504];

export interface ThrottledRetryClientOptions {
  /** Délai minimum (ms) entre deux requêtes sortantes. */
  throttleMs: number;
  maxRetries?: number;
  retryStatuses?: number[];
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Base class pour clients HTTP externes avec throttle + retry.
 * Extend-la et appelle `this.request()` au lieu de `fetch`.
 * L'instance doit être un singleton pour que le throttle sérialise correctement.
 */
export class ThrottledRetryClient {
  private lastRequestAt = 0;
  protected readonly throttleMs: number;
  protected readonly maxRetries: number;
  protected readonly retryStatuses: Set<number>;

  constructor(options: ThrottledRetryClientOptions) {
    this.throttleMs = options.throttleMs;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryStatuses = new Set(options.retryStatuses ?? DEFAULT_RETRY_STATUSES);
  }

  protected async throttle(): Promise<void> {
    const delta = Date.now() - this.lastRequestAt;
    if (delta < this.throttleMs) await sleep(this.throttleMs - delta);
    this.lastRequestAt = Date.now();
  }

  protected async request(input: string | URL, init?: RequestInit): Promise<Response> {
    let attempt = 0;
    while (true) {
      await this.throttle();
      const res = await fetch(input, init);

      if (this.retryStatuses.has(res.status) && attempt < this.maxRetries) {
        const waitMs = parseRetryAfter(res.headers.get("retry-after")) ?? 2000 * 2 ** attempt;
        await sleep(waitMs);
        attempt += 1;
        continue;
      }

      return res;
    }
  }
}

/**
 * Parse the Retry-After header per RFC 7231 §7.1.3: it can be either a delta in
 * seconds (`"120"`) or an HTTP-date (`"Wed, 21 Oct 2015 07:28:00 GMT"`).
 * Returns the wait in milliseconds, or null if the header is missing/invalid.
 */
function parseRetryAfter(raw: string | null): number | null {
  if (!raw) return null;

  const asNumber = Number(raw);
  if (Number.isFinite(asNumber) && asNumber > 0) return asNumber * 1000;

  const asDate = Date.parse(raw);
  if (Number.isFinite(asDate)) {
    const delta = asDate - Date.now();
    return delta > 0 ? delta : null;
  }

  return null;
}
