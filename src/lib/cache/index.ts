// src/lib/cache/index.ts
// Simple in-memory cache implementation (no Redis)

import { logger } from '../utils/logger';

/**
 * Cache options for storing data
 */
export interface CacheOptions {
  /**
   * Expiration time in seconds
   */
  expireInSeconds?: number;

  /**
   * Prefix for grouping cache keys
   */
  prefix?: string;
}

/**
 * Default cache options
 */
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  expireInSeconds: 60 * 5, // 5 minutes
  prefix: 'api',
};

/**
 * In-memory cache store
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Simple in-memory caching system
 */
export const cache = {
  /**
   * Get value from cache
   *
   * @param key Cache key
   * @param options Cache options
   * @returns The cached value or null if not found
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
    const fullKey = this.generateKey(key, opts.prefix);

    const entry = memoryCache.get(fullKey);

    if (!entry) {
      logger.debug(`Cache miss: ${fullKey}`);
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(fullKey);
      logger.debug(`Cache expired: ${fullKey}`);
      return null;
    }

    logger.debug(`Cache hit: ${fullKey}`);
    return entry.value as T;
  },

  /**
   * Store value in cache
   *
   * @param key Cache key
   * @param value Value to store
   * @param options Cache options
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
    const fullKey = this.generateKey(key, opts.prefix);

    const expiresAt = Date.now() + (opts.expireInSeconds! * 1000);

    memoryCache.set(fullKey, {
      value,
      expiresAt,
    });

    logger.debug(`Cached with expiry ${opts.expireInSeconds}s: ${fullKey}`);
  },

  /**
   * Delete value from cache
   *
   * @param key Cache key
   * @param prefix Optional prefix
   */
  async delete(key: string, prefix?: string): Promise<void> {
    const fullKey = this.generateKey(key, prefix || DEFAULT_CACHE_OPTIONS.prefix);
    memoryCache.delete(fullKey);
    logger.debug(`Deleted from cache: ${fullKey}`);
  },

  /**
   * Delete multiple values matching a pattern
   *
   * @param pattern Search pattern for keys to delete
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let deletedCount = 0;

    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.debug(`Deleted ${deletedCount} keys matching pattern: ${pattern}`);
    }
  },

  /**
   * Get from cache or execute function and store result
   *
   * @param key Cache key
   * @param fn Function that returns the value if not in cache
   * @param options Cache options
   * @returns The result from cache or from executing the function
   */
  async getOrSet<T>(key: string, fn: () => Promise<T>, options?: CacheOptions): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, options);
    return result;
  },

  /**
   * Generate full key with prefix
   *
   * @param key Base key
   * @param prefix Optional prefix
   * @returns Full key
   */
  generateKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  },

  /**
   * Check if cache is available (always true for memory cache)
   *
   * @returns Whether cache is available
   */
  isAvailable(): boolean {
    return true;
  },

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: memoryCache.size,
      keys: Array.from(memoryCache.keys()),
    };
  },

  /**
   * Clear all cache entries
   */
  clear(): void {
    memoryCache.clear();
    logger.debug('Cleared all cache entries');
  },
};

/**
 * Cleanup expired entries periodically
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of memoryCache.entries()) {
      if (now > entry.expiresAt) {
        memoryCache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.debug(`Cleaned up ${deletedCount} expired cache entries`);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}
