// src/lib/monitoring/performance.ts
import { reportMessage } from './sentry';

/**
 * Performance monitoring utilities
 */

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

export interface APIPerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  size?: number;
}

/**
 * Measures and reports page performance metrics
 */
export function measurePagePerformance(pageName: string): void {
  if (typeof window === 'undefined') return;

  // Wait for the page to be fully loaded
  window.addEventListener('load', () => {
    // Basic timing metrics
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const metrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      };

      // Web Vitals
      try {
        // LCP (Largest Contentful Paint)
        if ('PerformanceObserver' in window) {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            if (lastEntry) {
              metrics.largestContentfulPaint = lastEntry.startTime;
              
              // Report if LCP is slow (> 2.5s)
              if (lastEntry.startTime > 2500) {
                reportMessage(
                  `Slow LCP detected: ${pageName}`,
                  {
                    feature: 'performance',
                    action: 'slow_lcp',
                    metadata: { page: pageName, lcp: lastEntry.startTime },
                  },
                  'warning'
                );
              }
            }
          });
          
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // FID (First Input Delay)
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              metrics.firstInputDelay = entry.processingStart - entry.startTime;
              
              // Report if FID is slow (> 100ms)
              if (entry.processingStart - entry.startTime > 100) {
                reportMessage(
                  `Slow FID detected: ${pageName}`,
                  {
                    feature: 'performance',
                    action: 'slow_fid',
                    metadata: { page: pageName, fid: entry.processingStart - entry.startTime },
                  },
                  'warning'
                );
              }
            });
          });
          
          fidObserver.observe({ entryTypes: ['first-input'] });

          // CLS (Cumulative Layout Shift)
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            
            metrics.cumulativeLayoutShift = clsValue;
            
            // Report if CLS is poor (> 0.1)
            if (clsValue > 0.1) {
              reportMessage(
                `Poor CLS detected: ${pageName}`,
                {
                  feature: 'performance',
                  action: 'poor_cls',
                  metadata: { page: pageName, cls: clsValue },
                },
                'warning'
              );
            }
          });
          
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        }

        // FCP (First Contentful Paint)
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          metrics.firstContentfulPaint = fcpEntry.startTime;
        }

      } catch (error) {
        console.warn('Failed to measure Web Vitals:', error);
      }

      // Report basic metrics
      console.log(`[Performance] ${pageName}:`, metrics);
      
      // Report slow page loads (> 3s)
      if (metrics.loadTime > 3000) {
        reportMessage(
          `Slow page load: ${pageName}`,
          {
            feature: 'performance',
            action: 'slow_page_load',
            metadata: { page: pageName, ...metrics },
          },
          'warning'
        );
      }
    }
  });
}

/**
 * Measures API call performance
 */
export function measureAPIPerformance(
  endpoint: string,
  method: string,
  startTime: number,
  endTime: number,
  status: number,
  size?: number
): void {
  const duration = endTime - startTime;
  
  const metrics: APIPerformanceMetrics = {
    endpoint,
    method,
    duration,
    status,
    size,
  };

  console.log(`[API Performance] ${method} ${endpoint}: ${duration}ms`);
  
  // Report slow API calls (> 2s)
  if (duration > 2000) {
    reportMessage(
      `Slow API call: ${method} ${endpoint}`,
      {
        feature: 'api_performance',
        action: 'slow_api_call',
        metadata: metrics,
      },
      'warning'
    );
  }
  
  // Report failed API calls
  if (status >= 400) {
    reportMessage(
      `API error: ${method} ${endpoint} - ${status}`,
      {
        feature: 'api_performance',
        action: 'api_error',
        metadata: metrics,
      },
      'error'
    );
  }
}

/**
 * Performance timing decorator for functions
 */
export function withPerformanceTiming<T extends any[], R>(
  name: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    
    try {
      const result = await fn(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      
      // Report slow operations (> 1s)
      if (duration > 1000) {
        reportMessage(
          `Slow operation: ${name}`,
          {
            feature: 'performance',
            action: 'slow_operation',
            metadata: { operation: name, duration },
          },
          'warning'
        );
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      reportMessage(
        `Failed operation: ${name}`,
        {
          feature: 'performance',
          action: 'failed_operation',
          metadata: { operation: name, duration, error: error instanceof Error ? error.message : 'Unknown error' },
        },
        'error'
      );
      
      throw error;
    }
  };
}

/**
 * Memory usage monitoring
 */
export function monitorMemoryUsage(): void {
  if (typeof window === 'undefined' || !('memory' in performance)) return;

  const memory = (performance as any).memory;
  const memoryInfo = {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };

  console.log('[Memory Usage]:', memoryInfo);

  // Report high memory usage (> 80%)
  if (memoryInfo.usagePercentage > 80) {
    reportMessage(
      'High memory usage detected',
      {
        feature: 'performance',
        action: 'high_memory_usage',
        metadata: memoryInfo,
      },
      'warning'
    );
  }
}

/**
 * Resource loading monitoring
 */
export function monitorResourceLoading(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    // Find slow resources (> 1s)
    const slowResources = resources.filter(resource => 
      resource.duration > 1000
    );

    // Find large resources (> 1MB)
    const largeResources = resources.filter(resource => 
      resource.transferSize && resource.transferSize > 1024 * 1024
    );

    if (slowResources.length > 0) {
      slowResources.forEach(resource => {
        reportMessage(
          `Slow resource loading: ${resource.name}`,
          {
            feature: 'performance',
            action: 'slow_resource',
            metadata: {
              url: resource.name,
              duration: resource.duration,
              size: resource.transferSize,
              type: resource.initiatorType,
            },
          },
          'warning'
        );
      });
    }

    if (largeResources.length > 0) {
      largeResources.forEach(resource => {
        reportMessage(
          `Large resource detected: ${resource.name}`,
          {
            feature: 'performance',
            action: 'large_resource',
            metadata: {
              url: resource.name,
              size: resource.transferSize,
              duration: resource.duration,
              type: resource.initiatorType,
            },
          },
          'info'
        );
      });
    }
  });
}

/**
 * Initialize all performance monitoring
 */
export function initializePerformanceMonitoring(pageName: string): void {
  measurePagePerformance(pageName);
  monitorResourceLoading();
  
  // Monitor memory usage every 30 seconds
  setInterval(monitorMemoryUsage, 30000);
}