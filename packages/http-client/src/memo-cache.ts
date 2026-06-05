interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const DEFAULT_MAX_ENTRIES = 1000;

export interface MemoCacheOptions {
  /** Cap on entries. When exceeded, oldest insertion is evicted. Default 1000. */
  maxEntries?: number;
}

/**
 * In-memory TTL cache with bounded size and concurrent-miss deduplication.
 *
 * Designed for memoising external API responses (AniList, Jikan) across
 * cron ticks, scripts and HTTP handlers in the same process. Three pieces
 * of behaviour worth knowing:
 *
 *  1. **TTL-only get/set**: `get()`/`set()` are the bare cache primitives.
 *  2. **Promise dedup** (`getOrSet`): two concurrent callers with the same
 *     key share a single in-flight factory call — no double fetch, no
 *     double rate-limit hit on the underlying API.
 *  3. **Bounded LRU eviction**: insertion order is the eviction order
 *     (Map preserves it). Once `maxEntries` is reached, the oldest entry
 *     is dropped on the next `set()`. Prevents the memory leak that pure
 *     TTL caches develop on long-running processes.
 *
 * No external dependency — Map + Promise is enough for our scale.
 */
export class MemoCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();
  private readonly inflight = new Map<string, Promise<T>>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  constructor(ttlMs: number, options: MemoCacheOptions = {}) {
    this.ttlMs = ttlMs;
    this.maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    // Refresh insertion order so this entry survives the next eviction.
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    if (this.store.size > this.maxEntries) this.evictOldest();
  }

  /**
   * Lit le cache si présent et frais, sinon exécute la factory et mémorise
   * le résultat. Si deux appels concurrents pour la même clé tombent sur un
   * miss, ils partagent la même promesse — la factory n'est exécutée qu'une
   * fois (économise un round-trip API et évite un rate-limit hit redondant).
   */
  async getOrSet(key: string, factory: () => Promise<T>): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    const inflight = this.inflight.get(key);
    if (inflight) return inflight;

    const promise = factory()
      .then((value) => {
        this.set(key, value);
        return value;
      })
      .finally(() => {
        this.inflight.delete(key);
      });

    this.inflight.set(key, promise);
    return promise;
  }

  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
    this.inflight.clear();
  }

  get size(): number {
    return this.store.size;
  }

  private evictOldest(): void {
    const oldestKey = this.store.keys().next().value;
    if (oldestKey !== undefined) this.store.delete(oldestKey);
  }
}
