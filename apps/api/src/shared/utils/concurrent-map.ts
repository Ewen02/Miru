/**
 * Run `task(item)` over an array with bounded concurrency.
 *
 * Equivalent to `Promise.all(items.map(task))` capped at `concurrency`
 * in-flight at a time. Order of results matches order of items.
 *
 * Useful for cron-driven import loops where:
 *  - serial iteration is too slow (60 animes × 750ms throttle = 45s)
 *  - unbounded Promise.all would dogpile the rate limiter and the DB
 *  - the underlying HTTP client already serialises via throttle, but
 *    the DB writes can run in parallel while the next fetch waits
 *
 * Zero new dependency — keeps the api package lean.
 */
export async function concurrentMap<T, R>(
  items: readonly T[],
  concurrency: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (concurrency < 1) throw new Error("concurrentMap: concurrency must be >= 1");

  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await task(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
