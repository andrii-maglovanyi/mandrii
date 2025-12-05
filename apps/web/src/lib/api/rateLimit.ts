/**
 * Rate limiter for API endpoints with Redis (Vercel KV) support.
 *
 * Uses Vercel KV (Upstash Redis) for distributed rate limiting across
 * serverless instances. Falls back to in-memory storage when KV is not
 * configured (local development).
 *
 * @example
 * ```ts
 * const checkoutLimiter = createRateLimiter({
 *   windowMs: 60 * 1000, // 1 minute
 *   maxRequests: 10,     // 10 requests per minute
 *   prefix: 'checkout',  // Redis key prefix
 * });
 *
 * // In route handler:
 * checkoutLimiter.check(req); // throws RateLimitError if exceeded
 * ```
 */

import { kv } from "@vercel/kv";
import { headers } from "next/headers";

import { RateLimitError } from "./errors";

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Redis key prefix for this limiter */
  prefix: string;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RequestRecord {
  count: number;
  resetAt: number;
}

/**
 * Creates a rate limiter instance with the specified configuration.
 * Uses Redis (Vercel KV) when available, falls back to in-memory.
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { maxRequests, prefix, windowMs } = config;
  const windowSeconds = Math.ceil(windowMs / 1000);

  // In-memory fallback for local development
  const memoryStore = new Map<string, RequestRecord>();

  // Periodic cleanup of in-memory expired entries (every 5 minutes)
  const cleanupInterval = setInterval(
    () => {
      const now = Date.now();
      for (const [key, record] of memoryStore.entries()) {
        if (record.resetAt <= now) {
          memoryStore.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  );

  // Prevent the interval from keeping the process alive
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  /**
   * Check rate limit using Redis (Vercel KV).
   */
  async function checkRedis(key: string): Promise<void> {
    const redisKey = `ratelimit:${prefix}:${key}`;

    try {
      // Use Redis INCR with TTL for atomic rate limiting
      // Get current count
      const currentCount = await kv.get<number>(redisKey);

      if (currentCount === null) {
        // First request - set count to 1 with TTL
        await kv.set(redisKey, 1, { ex: windowSeconds });
        return;
      }

      if (currentCount >= maxRequests) {
        // Get TTL to calculate retry-after
        const ttl = await kv.ttl(redisKey);
        throw new RateLimitError(`Too many requests. Please try again in ${ttl > 0 ? ttl : windowSeconds} seconds.`);
      }

      // Increment count (keeping existing TTL)
      await kv.incr(redisKey);
    } catch (error) {
      // If it's already a RateLimitError, rethrow
      if (error instanceof RateLimitError) {
        throw error;
      }

      // Log Redis errors but don't block requests
      console.warn(`[RateLimit] Redis error for ${prefix}, falling back to allow:`, error);
    }
  }

  /**
   * Check rate limit using in-memory store.
   */
  async function checkMemory(key: string): Promise<void> {
    const now = Date.now();
    const record = memoryStore.get(key);

    if (!record || record.resetAt <= now) {
      // First request or window expired - start new window
      memoryStore.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return;
    }

    // Within existing window
    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      throw new RateLimitError(`Too many requests. Please try again in ${retryAfterSeconds} seconds.`);
    }

    // Increment count
    record.count++;
  }

  return {
    /**
     * Check if the request should be rate limited.
     * Throws RateLimitError if limit is exceeded.
     *
     * @param identifier - Optional custom identifier (defaults to client IP)
     */
    async check(identifier?: string): Promise<void> {
      const key = identifier ?? (await getClientIp());

      if (isKvAvailable()) {
        await checkRedis(key);
      } else {
        await checkMemory(key);
      }
    },

    /**
     * Get current rate limit status for an identifier.
     */
    async getStatus(identifier?: string): Promise<{
      remaining: number;
      resetAt: number;
      total: number;
    }> {
      const key = identifier ?? (await getClientIp());
      const now = Date.now();

      if (isKvAvailable()) {
        const redisKey = `ratelimit:${prefix}:${key}`;
        try {
          const currentCount = await kv.get<number>(redisKey);
          const ttl = await kv.ttl(redisKey);

          if (currentCount === null || ttl <= 0) {
            return {
              remaining: maxRequests,
              resetAt: now + windowMs,
              total: maxRequests,
            };
          }

          return {
            remaining: Math.max(0, maxRequests - currentCount),
            resetAt: now + ttl * 1000,
            total: maxRequests,
          };
        } catch {
          // Fallback on error
          return {
            remaining: maxRequests,
            resetAt: now + windowMs,
            total: maxRequests,
          };
        }
      }

      // In-memory fallback
      const record = memoryStore.get(key);

      if (!record || record.resetAt <= now) {
        return {
          remaining: maxRequests,
          resetAt: now + windowMs,
          total: maxRequests,
        };
      }

      return {
        remaining: Math.max(0, maxRequests - record.count),
        resetAt: record.resetAt,
        total: maxRequests,
      };
    },
  };
}

/**
 * Get client IP from request headers.
 * Handles common proxy headers (X-Forwarded-For, X-Real-IP).
 */
async function getClientIp(): Promise<string> {
  const headersList = await headers();

  // Check common proxy headers
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs; first is the client
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headersList.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Vercel-specific header
  const vercelForwardedFor = headersList.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0].trim();
  }

  // Fallback - in production this shouldn't happen behind a proxy
  return "unknown";
}

/**
 * Check if Vercel KV is configured and available.
 */
function isKvAvailable(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * Pre-configured rate limiters for different endpoints.
 */
export const rateLimiters = {
  /**
   * Checkout rate limiter: 10 requests per minute per IP.
   * Prevents abuse of Stripe API and order creation.
   */
  checkout: createRateLimiter({
    maxRequests: 10,
    prefix: "checkout",
    windowMs: 60 * 1000, // 1 minute
  }),

  /**
   * General API rate limiter: 60 requests per minute per IP.
   * For less sensitive read endpoints.
   */
  general: createRateLimiter({
    maxRequests: 60,
    prefix: "general",
    windowMs: 60 * 1000,
  }),

  /**
   * Webhook rate limiter: 100 requests per minute per IP.
   * Higher limit as webhooks come from Stripe's servers.
   */
  webhook: createRateLimiter({
    maxRequests: 100,
    prefix: "webhook",
    windowMs: 60 * 1000,
  }),
};
