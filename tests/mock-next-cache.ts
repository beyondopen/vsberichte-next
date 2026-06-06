/**
 * Vitest has no Next.js server context, so `unstable_cache` throws
 * "Invariant: incrementalCache missing". For integration tests we only care
 * about the wrapped query logic — replace the cache wrapper with a
 * pass-through so the functions run uncached against the test database.
 */
import { vi } from 'vitest'

vi.mock('next/cache', () => ({
  unstable_cache:
    <T extends (...args: never[]) => unknown>(fn: T) =>
    (...args: Parameters<T>) =>
      fn(...args),
  revalidateTag: () => {},
}))
