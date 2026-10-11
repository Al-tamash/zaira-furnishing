/**
 * In-memory sliding window rate limiter.
 * Designed for Next.js App Router API endpoints to prevent brute-force attacks and abuse.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodic garbage collection every 5 minutes to prevent memory leaks
let lastCleanup = Date.now();
function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Checks and increments rate limit for a given key.
 * @param key Unique identifier (e.g. `admin-auth:${ip}`)
 * @param limit Maximum number of allowed requests in the window
 * @param windowSeconds Window duration in seconds
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowSeconds: number = 60
): RateLimitResult {
  cleanupExpired();

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetInSeconds: windowSeconds,
    };
  }

  if (existing.count >= limit) {
    const resetInSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      success: false,
      limit,
      remaining: 0,
      resetInSeconds,
    };
  }

  existing.count += 1;
  const resetInSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    success: true,
    limit,
    remaining: limit - existing.count,
    resetInSeconds,
  };
}

/**
 * Extracts client IP address from Next.js request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return '127.0.0.1';
}
