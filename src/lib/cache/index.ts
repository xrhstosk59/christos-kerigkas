// src/lib/cache/index.ts
import { Redis } from '@upstash/redis';
import { logger } from '../utils/logger';

/**
 * Παράμετροι για τη ρύθμιση του caching.
 */
export interface CacheOptions {
  /**
   * Χρόνος λήξης σε δευτερόλεπτα.
   */
  expireInSeconds?: number;
  
  /**
   * Προθέματα για ομαδοποίηση των κλειδιών cache.
   */
  prefix?: string;
}

/**
 * Προκαθορισμένες τιμές για το caching.
 */
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  expireInSeconds: 60 * 5, // 5 λεπτά
  prefix: 'api',
};

/**
 * Δημιουργία Redis client.
 */
const createRedisClient = () => {
  // Έλεγχος ότι έχουν οριστεί τα απαραίτητα περιβαλλοντικά variables
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    logger.warn('Λείπουν οι μεταβλητές UPSTASH_REDIS_REST_URL ή UPSTASH_REDIS_REST_TOKEN. Το Redis cache είναι απενεργοποιημένο.');
    return null;
  }

  try {
    // Δημιουργία Redis client με τα credentials από τις μεταβλητές περιβάλλοντος
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (error) {
    logger.error('Σφάλμα δημιουργίας Redis client:', error);
    return null;
  }
};

// Αρχικοποίηση του Redis client (μπορεί να είναι null αν υπάρχει πρόβλημα)
const redis = createRedisClient();

/**
 * Σύστημα caching που χρησιμοποιεί Redis.
 */
export const cache = {
  /**
   * Ανάκτηση τιμής από το cache.
   * 
   * @param key Κλειδί για την τιμή που θέλουμε να ανακτήσουμε
   * @param options Παράμετροι για το caching
   * @returns Η τιμή από το cache ή null αν δεν υπάρχει
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    if (!redis) return null;

    const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
    const fullKey = this.generateKey(key, opts.prefix);
    
    try {
      const value = await redis.get(fullKey);
      
      if (value) {
        logger.debug(`Cache hit για το κλειδί: ${fullKey}`);
        return value as T;
      }
      
      logger.debug(`Cache miss για το κλειδί: ${fullKey}`);
      return null;
    } catch (error) {
      logger.error(`Σφάλμα ανάκτησης από cache για το κλειδί ${fullKey}:`, error);
      return null;
    }
  },
  
  /**
   * Αποθήκευση τιμής στο cache.
   * 
   * @param key Κλειδί για την τιμή
   * @param value Τιμή προς αποθήκευση
   * @param options Παράμετροι για το caching
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    if (!redis) return;

    const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
    const fullKey = this.generateKey(key, opts.prefix);
    
    try {
      if (opts.expireInSeconds) {
        await redis.set(fullKey, value, { ex: opts.expireInSeconds });
        logger.debug(`Αποθηκεύτηκε στο cache με expiry ${opts.expireInSeconds}s: ${fullKey}`);
      } else {
        await redis.set(fullKey, value);
        logger.debug(`Αποθηκεύτηκε στο cache χωρίς expiry: ${fullKey}`);
      }
    } catch (error) {
      logger.error(`Σφάλμα αποθήκευσης στο cache για το κλειδί ${fullKey}:`, error);
    }
  },
  
  /**
   * Διαγραφή τιμής από το cache.
   * 
   * @param key Κλειδί της τιμής που θέλουμε να διαγράψουμε
   * @param prefix Προαιρετικό πρόθεμα
   */
  async delete(key: string, prefix?: string): Promise<void> {
    if (!redis) return;

    const fullKey = this.generateKey(key, prefix || DEFAULT_CACHE_OPTIONS.prefix);
    
    try {
      await redis.del(fullKey);
      logger.debug(`Διαγράφηκε από το cache: ${fullKey}`);
    } catch (error) {
      logger.error(`Σφάλμα διαγραφής από cache για το κλειδί ${fullKey}:`, error);
    }
  },
  
  /**
   * Διαγραφή πολλαπλών τιμών που ταιριάζουν σε ένα pattern.
   * 
   * @param pattern Pattern αναζήτησης κλειδιών προς διαγραφή
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (!redis) return;
    
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        // Διαγραφή όλων των κλειδιών που ταιριάζουν στο pattern
        await Promise.all(keys.map(key => redis.del(key)));
        logger.debug(`Διαγράφηκαν ${keys.length} κλειδιά με pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error(`Σφάλμα διαγραφής pattern από cache: ${pattern}`, error);
    }
  },
  
  /**
   * Ανάκτηση από το cache ή εκτέλεση της λειτουργίας και αποθήκευση του αποτελέσματος.
   * 
   * @param key Κλειδί για την τιμή
   * @param fn Συνάρτηση που επιστρέφει την τιμή αν δεν υπάρχει στο cache
   * @param options Παράμετροι για το caching
   * @returns Το αποτέλεσμα από το cache ή από την εκτέλεση της συνάρτησης
   */
  async getOrSet<T>(key: string, fn: () => Promise<T>, options?: CacheOptions): Promise<T> {
    if (!redis) return fn();

    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }
    
    const result = await fn();
    await this.set(key, result, options);
    return result;
  },
  
  /**
   * Δημιουργία πλήρους κλειδιού με πρόθεμα.
   * 
   * @param key Βασικό κλειδί
   * @param prefix Προαιρετικό πρόθεμα
   * @returns Πλήρες κλειδί
   */
  generateKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  },
  
  /**
   * Έλεγχος αν το Redis είναι διαθέσιμο.
   * 
   * @returns Αν το Redis είναι διαθέσιμο
   */
  isAvailable(): boolean {
    return redis !== null;
  }
};