interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Cache in-memory TTL minimal. Pas de LRU, pas de stats : un Map et c'est tout.
 * Pensé pour mémoriser les réponses d'API externes (AniList, Jikan) entre
 * appels d'un même process (cron + script + handler HTTP).
 *
 * Pas de purge active : les entrées expirées sont collectées paresseusement
 * à la lecture. Si tu stockes des milliers d'entrées sans les relire, appelle
 * `prune()` manuellement.
 */
export class MemoCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs;
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  /**
   * Lit le cache si présent et frais, sinon exécute la factory et mémorise
   * le résultat. La factory n'est pas mémoisée elle-même : deux appels
   * concurrents avec une miss feront deux fetchs (acceptable pour l'usage MVP).
   */
  async getOrSet(key: string, factory: () => Promise<T>): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const fresh = await factory();
    this.set(key, fresh);
    return fresh;
  }

  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}
