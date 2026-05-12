// ============================================
// CACHE UTILITY - localStorage Manager
// ============================================
// Modern caching with timestamp tracking and TTL support

const CACHE_PREFIX = 'routes_app_';
const DEFAULT_TTL = 1000 * 60 * 15; // 15 minutes

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

export const cache = {
  /**
   * Set cache item with timestamp
   */
  set<T>(key: string, data: T, version: string = '1.0'): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version,
      };
      localStorage.setItem(
        `${CACHE_PREFIX}${key}`,
        JSON.stringify(entry)
      );
      console.log(`💾 Cache SET: ${key}`, { dataSize: JSON.stringify(data).length, version });
    } catch (error) {
      console.error(`❌ Cache SET failed for ${key}:`, error);
    }
  },

  /**
   * Get cache item (returns null if expired or not found)
   */
  get<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
    try {
      const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!item) {
        console.log(`📭 Cache MISS: ${key}`);
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);
      const age = Date.now() - entry.timestamp;
      const isExpired = age > ttl;

      if (isExpired) {
        console.log(`⏰ Cache EXPIRED: ${key} (age: ${Math.round(age / 1000)}s)`);
        this.remove(key);
        return null;
      }

      console.log(`✅ Cache HIT: ${key} (age: ${Math.round(age / 1000)}s)`);
      return entry.data;
    } catch (error) {
      console.error(`❌ Cache GET failed for ${key}:`, error);
      return null;
    }
  },

  /**
   * Get cache item (ignore TTL)
   */
  getStale<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      console.log(`🔄 Cache STALE: ${key}`);
      return entry.data;
    } catch (error) {
      console.error(`❌ Cache GET STALE failed for ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove cache item
   */
  remove(key: string): void {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    console.log(`🗑️ Cache REMOVE: ${key}`);
  },

  /**
   * Clear all cache
   */
  clear(): void {
    const keys = Object.keys(localStorage);
    let count = 0;
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
        count++;
      }
    });
    console.log(`🧹 Cache CLEARED: ${count} items`);
  },

  /**
   * Get cache metadata
   */
  getMeta(key: string): { age: number; timestamp: number; version: string } | null {
    try {
      const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!item) return null;

      const entry: CacheEntry<any> = JSON.parse(item);
      return {
        age: Date.now() - entry.timestamp,
        timestamp: entry.timestamp,
        version: entry.version,
      };
    } catch {
      return null;
    }
  },
};
