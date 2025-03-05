// src/lib/rate-limit.ts
export interface RateLimitOptions {
  interval: number
  uniqueTokenPerInterval: number
}

interface RateLimitRes {
  check: (limit: number, token: string) => Promise<void>
}

// Memory store για τα requests (σε production θα ήταν καλύτερα 
// να χρησιμοποιήσεις ένα persistent store όπως Redis)
const tokenCache = new Map<string, number[]>()

export function rateLimit(options: RateLimitOptions): RateLimitRes {
  return {
    check: (limit: number, token: string): Promise<void> => {
      const now = Date.now()
      const windowStart = now - options.interval
      
      const tokenCount = tokenCache.get(token) || []
      const validTokens = tokenCount.filter(timestamp => timestamp > windowStart)
      
      tokenCache.set(token, [...validTokens, now])
      
      return new Promise((resolve, reject) => {
        if (validTokens.length < limit) {
          resolve()
        } else {
          reject(new Error('Rate limit exceeded'))
        }
      })
    },
  }
}