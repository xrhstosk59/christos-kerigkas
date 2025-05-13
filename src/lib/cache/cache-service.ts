// src/lib/cache/cache-service.ts

import { cache } from '@/lib/cache';

export type CacheOptions = {
  expireInSeconds?: number;
  namespace?: string;
  tags?: string[];
};

/**
 * Υπηρεσία διαχείρισης cache με προηγμένες λειτουργίες.
 */
export class CacheService {
  private static instance: CacheService;
  private namespace: string;
  
  private constructor(namespace = 'app') {
    this.namespace = namespace;
  }
  
  /**
   * Singleton pattern.
   */
  public static getInstance(namespace?: string): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(namespace);
    }
    return CacheService.instance;
  }
  
  /**
   * Δημιουργεί ένα πλήρες κλειδί cache με το namespace.
   */
  private createCacheKey(key: string, options?: CacheOptions): string {
    const namespace = options?.namespace || this.namespace;
    return `${namespace}:${key}`;
  }
  
  /**
   * Λήψη δεδομένων από το cache ή από την πηγή δεδομένων.
   */
  public async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cacheKey = this.createCacheKey(key, options);
    
    return cache.getOrSet<T>(
      cacheKey,
      fetchFn,
      { expireInSeconds: options?.expireInSeconds || 300 }
    );
  }
  
  /**
   * Αποθήκευση δεδομένων στο cache.
   */
  public async set<T>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<void> {
    const cacheKey = this.createCacheKey(key, options);
    
    await cache.set(
      cacheKey,
      value,
      { expireInSeconds: options?.expireInSeconds || 300 }
    );
    
    // Αποθήκευση συσχετίσεων με tags αν υπάρχουν
    if (options?.tags && options.tags.length > 0) {
      for (const tag of options.tags) {
        const tagKey = `tag:${tag}`;
        let keys: string[] = [];
        
        try {
          keys = await cache.get<string[]>(tagKey) || [];
        } catch (error) {
          console.error('Error fetching tag keys:', error);
        }
        
        if (!keys.includes(cacheKey)) {
          keys.push(cacheKey);
          await cache.set(tagKey, keys, { expireInSeconds: 86400 }); // 24 ώρες
        }
      }
    }
  }
  
  /**
   * Ανάκτηση δεδομένων από το cache.
   */
  public async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const cacheKey = this.createCacheKey(key, options);
    return cache.get<T>(cacheKey);
  }
  
  /**
   * Διαγραφή ενός συγκεκριμένου κλειδιού.
   */
  public async delete(key: string, options?: CacheOptions): Promise<void> {
    const cacheKey = this.createCacheKey(key, options);
    await cache.delete(cacheKey);
  }
  
  /**
   * Ακύρωση του cache με βάση ένα πρότυπο.
   */
  public async invalidatePattern(pattern: string): Promise<void> {
    await cache.invalidatePattern(pattern);
  }
  
  /**
   * Ακύρωση του cache με βάση ένα ή περισσότερα tags.
   */
  public async invalidateByTags(tags: string[]): Promise<void> {
    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      const keys = await cache.get<string[]>(tagKey);
      
      if (keys && keys.length > 0) {
        // Διαγραφή όλων των σχετικών κλειδιών
        for (const key of keys) {
          await cache.delete(key);
        }
        
        // Διαγραφή του tag
        await cache.delete(tagKey);
      }
    }
  }
  
  /**
   * Ακύρωση όλου του cache για ένα συγκεκριμένο namespace.
   */
  public async invalidateNamespace(namespace?: string): Promise<void> {
    const targetNamespace = namespace || this.namespace;
    await this.invalidatePattern(`${targetNamespace}:*`);
  }
  
  /**
   * Ακύρωση όλου του cache.
   * Η μέθοδος invalidateAll δεν υπάρχει στο cache interface, γι'αυτό χρησιμοποιούμε invalidatePattern
   */
  public async invalidateAll(): Promise<void> {
    // Διόρθωση: χρησιμοποιούμε invalidatePattern αντί για invalidateAll
    await this.invalidatePattern('*');
  }
}

// Εξαγωγή μεμονωμένων μεθόδων για ευκολότερη χρήση
export const cacheService = CacheService.getInstance();

export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  return cacheService.getOrSet<T>(key, fetchFn, options);
}

export async function invalidateCache(
  pattern: string
): Promise<void> {
  return cacheService.invalidatePattern(pattern);
}

export async function invalidateCacheByTags(
  tags: string[]
): Promise<void> {
  return cacheService.invalidateByTags(tags);
}