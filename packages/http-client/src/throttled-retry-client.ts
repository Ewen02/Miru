const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_STATUSES = [429, 500, 502, 503, 504];
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;

export interface ThrottledRetryClientOptions {
  /** Délai minimum (ms) entre deux requêtes sortantes. */
  throttleMs: number;
  maxRetries?: number;
  retryStatuses?: number[];
  /** Timeout par requête HTTP (ms). Default 15s. Empêche les hang infinis. */
  requestTimeoutMs?: number;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Base class pour clients HTTP externes avec throttle + retry + timeout.
 * Extend-la et appelle `this.request()` au lieu de `fetch`.
 * L'instance doit être un singleton pour que le throttle sérialise correctement.
 */
export interface ThrottledRetryClientStats {
  requests: number;
  retries: number;
  timeouts: number;
  rateLimited: number;
}

export class ThrottledRetryClient {
  private lastRequestAt = 0;
  protected readonly throttleMs: number;
  protected readonly maxRetries: number;
  protected readonly retryStatuses: Set<number>;
  protected readonly requestTimeoutMs: number;
  private _requests = 0;
  private _retries = 0;
  private _timeouts = 0;
  private _rateLimited = 0;

  constructor(options: ThrottledRetryClientOptions) {
    this.throttleMs = options.throttleMs;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryStatuses = new Set(options.retryStatuses ?? DEFAULT_RETRY_STATUSES);
    this.requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
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
      this._requests += 1;

      const timeoutSignal = AbortSignal.timeout(this.requestTimeoutMs);
      const signal = init?.signal
        ? AbortSignal.any([init.signal, timeoutSignal])
        : timeoutSignal;

      let res: Response;
      try {
        res = await fetch(input, { ...init, signal });
      } catch (err) {
        if (isTimeoutAbort(err) && attempt < this.maxRetries) {
          this._timeouts += 1;
          this._retries += 1;
          await sleep(2000 * 2 ** attempt);
          attempt += 1;
          continue;
        }
        throw err;
      }

      if (this.retryStatuses.has(res.status) && attempt < this.maxRetries) {
        if (res.status === 429) this._rateLimited += 1;
        this._retries += 1;
        const waitMs = parseRetryAfter(res.headers.get("retry-after")) ?? 2000 * 2 ** attempt;
        await sleep(waitMs);
        attempt += 1;
        continue;
      }

      return res;
    }
  }

  stats(): ThrottledRetryClientStats {
    return {
      requests: this._requests,
      retries: this._retries,
      timeouts: this._timeouts,
      rateLimited: this._rateLimited,
    };
  }
}

function isTimeoutAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "TimeoutError";
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
