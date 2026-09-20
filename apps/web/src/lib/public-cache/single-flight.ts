/** Coalesce concurrent origin reads in one server instance, retaining no settled data. */
const pending = new Map<string, Promise<unknown>>();
const generations = { community: 0, content: 0 };
type Scope = keyof typeof generations;
const scopeFor = (key: string): Scope => (key.startsWith("community:") ? "community" : "content");

export class CacheReadInvalidated extends Error {}

export function clearPublicFlights(scope?: Scope) {
  for (const name of scope ? [scope] : (["community", "content"] as const)) generations[name] += 1;
  for (const key of pending.keys()) if (!scope || scopeFor(key) === scope) pending.delete(key);
}

/** An overlapping local write requires a fresh read, not an error shown to the reader. */
export async function retryInvalidatedRead<T>(read: () => Promise<T>): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (!(error instanceof CacheReadInvalidated)) throw error;
    return read();
  }
}

export async function singleFlight<T>(key: string, read: () => Promise<T>): Promise<T> {
  const existing = pending.get(key);
  if (existing) return existing as Promise<T>;
  const scope = scopeFor(key);
  const started = generations[scope];
  const promise = Promise.resolve()
    .then(read)
    .then((value) => {
      if (started !== generations[scope]) throw new CacheReadInvalidated("Content changed during the read");
      return value;
    });
  pending.set(key, promise);
  try {
    return await promise;
  } finally {
    if (pending.get(key) === promise) pending.delete(key);
  }
}
