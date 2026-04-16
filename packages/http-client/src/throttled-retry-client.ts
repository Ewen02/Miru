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
        const retryAfter = Number(res.headers.get("retry-after"));
        const waitMs =
          Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2000 * 2 ** attempt;
        await sleep(waitMs);
        attempt += 1;
        continue;
      }

      return res;
    }
  }
}
