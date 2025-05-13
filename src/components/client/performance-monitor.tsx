'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'

// Τύπος για τις μετρικές Web Vitals με βελτιωμένο type safety
interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  delta: number;
  entries: PerformanceEntry[];
}

interface PerformanceData {
  fcp: number | null
  lcp: number | null
  cls: number | null
  fid: number | null
  ttfb: number | null
  inp: number | null
}

// Διάστημα ανανέωσης μετρικών
const REFRESH_INTERVAL = 10000 // 10 seconds

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceData>({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    ttfb: null,
    inp: null,
  })
  
  const [showMetrics, setShowMetrics] = useState(false)
  
  // Αποστολή μετρικών σε analytics service
  const sendToAnalytics = useCallback((
    metricName: keyof PerformanceData, 
    metric: WebVitalsMetric
  ) => {
    // Έλεγχος αν υπάρχει το Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window && window.gtag) {
      window.gtag('event', metricName.toUpperCase(), {
        value: metricName === 'cls' ? Math.round(metric.value * 1000) : Math.round(metric.value),
        event_category: 'Web Vitals',
        non_interaction: true,
      });
    }
    
    // Αποθήκευση μετρικών στο localStorage για ανάλυση
    try {
      const storedMetrics = JSON.parse(
        localStorage.getItem('web_vitals_history') || '[]'
      );
      
      storedMetrics.push({
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        [metricName]: metric.value,
      });
      
      // Διατήρηση μόνο των τελευταίων 50 καταγραφών
      if (storedMetrics.length > 50) {
        storedMetrics.shift();
      }
      
      localStorage.setItem('web_vitals_history', JSON.stringify(storedMetrics));
    } catch (e) {
      console.error('Failed to store web vitals data:', e);
    }
  }, []);

  // Χρήση του useCallback για την αποφυγή περιττών επαναδημιουργιών συναρτήσεων
  const handleMetric = useCallback((metricName: keyof PerformanceData) => 
    (metric: WebVitalsMetric) => {
      setMetrics(prev => {
        // Για το CLS, στρογγυλοποιούμε σε 3 δεκαδικά ψηφία
        const value = metricName === 'cls' 
          ? Math.round(metric.value * 1000) / 1000 
          : Math.round(metric.value);
        
        return { ...prev, [metricName]: value };
      });
      
      // Αποστολή σε analytics service εάν χρειάζεται
      sendToAnalytics(metricName, metric);
    }, [sendToAnalytics]);
  
  // Εγκατάσταση των Web Vitals event listeners
  useEffect(() => {
    // Μόνο στο browser environment
    if (typeof window === 'undefined') return;
    
    // Ενεργοποίηση μόνο για development ή αν υπάρχει ρητή flag
    if (process.env.NODE_ENV !== 'development' && !window.__ENABLE_PERFORMANCE_MONITORING__) {
      return;
    }
    
    // Για εύκολη ενεργοποίηση/απενεργοποίηση μέσω του console
    window.__PERFORMANCE_MONITOR__ = {
      enable: () => setShowMetrics(true),
      disable: () => setShowMetrics(false),
      toggle: () => setShowMetrics(prev => !prev),
      getMetrics: () => JSON.parse(JSON.stringify(metrics)) as Record<string, unknown>
    };
    
    // Ενεργοποίηση με πληκτρολόγιο (Ctrl+Alt+P)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key === 'p') {
        setShowMetrics(prev => !prev);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Φόρτωση και χρήση του web-vitals API
    let intervalId: number | null = null;
    
    const loadWebVitals = async () => {
      try {
        const webVitals = await import('web-vitals');
        
        // Καταγραφή των βασικών Web Vitals
        webVitals.onFCP(handleMetric('fcp'));
        webVitals.onLCP(handleMetric('lcp'));
        webVitals.onCLS(handleMetric('cls'));
        webVitals.onFID(handleMetric('fid'));
        webVitals.onTTFB(handleMetric('ttfb'));
        
        // Το INP είναι πιο πολύπλοκο, χρειάζεται επαναληπτική ανανέωση
        webVitals.onINP(handleMetric('inp'));
        
        // Περιοδική ανανέωση του INP
        if (process.env.NODE_ENV === 'development') {
          intervalId = window.setInterval(() => {
            webVitals.onINP(handleMetric('inp'));
          }, REFRESH_INTERVAL);
        }
      } catch (error) {
        console.error('Failed to load web-vitals module:', error);
        
        // Εναλλακτική λύση με Performance API αν χρειαστεί
        if (typeof performance !== 'undefined' && performance.getEntriesByType) {
          try {
            const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            
            if (navEntry) {
              setMetrics(prev => ({
                ...prev,
                ttfb: Math.round(navEntry.responseStart),
                fcp: Math.round(
                  performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
                )
              }));
            }
          } catch (e) {
            console.error('Failed to use Performance API fallback:', e);
          }
        }
      }
    };
    
    loadWebVitals();
    
    // Περιοδική ανανέωση των μετρικών όταν είναι ορατές
    if (showMetrics) {
      const refreshId = window.setInterval(() => {
        loadWebVitals();
      }, REFRESH_INTERVAL);
      
      return () => {
        window.clearInterval(refreshId);
        if (intervalId) window.clearInterval(intervalId);
      };
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (intervalId) window.clearInterval(intervalId);
      delete window.__PERFORMANCE_MONITOR__;
    };
  }, [handleMetric, metrics, showMetrics]);
  
  // Βελτιωμένες συναρτήσεις για το χρωματισμό και τις συμβουλές τιμών με memoization
  const getMetricColor = useCallback((
    value: number | null, 
    good: number, 
    needsImprovement: number
  ) => {
    if (value === null) return 'text-gray-400 dark:text-gray-500';
    return value <= good 
      ? 'text-green-500 dark:text-green-400' 
      : value <= needsImprovement 
        ? 'text-yellow-500 dark:text-yellow-400' 
        : 'text-red-500 dark:text-red-400';
  }, []);
  
  // Δημιουργία memoized χρωμάτων για καλύτερη απόδοση
  const colors = useMemo(() => ({
    lcp: getMetricColor(metrics.lcp, 2500, 4000),
    fid: getMetricColor(metrics.fid, 100, 300),
    cls: getMetricColor(metrics.cls, 0.1, 0.25),
    inp: getMetricColor(metrics.inp, 200, 500),
    fcp: getMetricColor(metrics.fcp, 1800, 3000),
    ttfb: getMetricColor(metrics.ttfb, 800, 1800)
  }), [getMetricColor, metrics]);
  
  // Δημιουργία badge status για κάθε μετρική
  const getBadgeStatus = useCallback((
    value: number | null, 
    good: number, 
    needsImprovement: number
  ) => {
    if (value === null) return '?';
    return value <= good 
      ? '✓' 
      : value <= needsImprovement 
        ? '!' 
        : '✗';
  }, []);
  
  // Μετατροπή όλων των τιμών σε badges για το UI
  const badges = useMemo(() => ({
    lcp: getBadgeStatus(metrics.lcp, 2500, 4000),
    fid: getBadgeStatus(metrics.fid, 100, 300),
    cls: getBadgeStatus(metrics.cls, 0.1, 0.25),
    inp: getBadgeStatus(metrics.inp, 200, 500),
    fcp: getBadgeStatus(metrics.fcp, 1800, 3000),
    ttfb: getBadgeStatus(metrics.ttfb, 800, 1800)
  }), [getBadgeStatus, metrics]);
  
  // Εάν δεν είμαστε σε development mode ή το panel είναι απενεργοποιημένο
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development' && !window.__ENABLE_PERFORMANCE_MONITORING__) {
    return null;
  }
  
  if (!showMetrics) {
    return null;
  }
  
  // Βελτιωμένο UI με tooltip και badges
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 text-xs font-mono max-w-xs border border-gray-200 dark:border-gray-700 animate-fadeIn">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Performance Metrics</h3>
        <button 
          onClick={() => setShowMetrics(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close performance metrics"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-1">
          <div className="col-span-1">LCP:</div>
          <div className={`col-span-1 ${colors.lcp} flex items-center`}>
            <span className="mr-1">{badges.lcp}</span> 
            {metrics.lcp === null ? '–' : `${metrics.lcp}ms`}
          </div>
          <div className="col-span-1 text-right text-gray-500 text-[10px]">
            {metrics.lcp !== null && (metrics.lcp <= 2500 ? 'good' : metrics.lcp <= 4000 ? 'needs work' : 'poor')}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-1">
          <div className="col-span-1">CLS:</div>
          <div className={`col-span-1 ${colors.cls} flex items-center`}>
            <span className="mr-1">{badges.cls}</span> 
            {metrics.cls === null ? '–' : metrics.cls}
          </div>
          <div className="col-span-1 text-right text-gray-500 text-[10px]">
            {metrics.cls !== null && (metrics.cls <= 0.1 ? 'good' : metrics.cls <= 0.25 ? 'needs work' : 'poor')}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-1">
          <div className="col-span-1">INP:</div>
          <div className={`col-span-1 ${colors.inp} flex items-center`}>
            <span className="mr-1">{badges.inp}</span> 
            {metrics.inp === null ? '–' : `${metrics.inp}ms`}
          </div>
          <div className="col-span-1 text-right text-gray-500 text-[10px]">
            {metrics.inp !== null && (metrics.inp <= 200 ? 'good' : metrics.inp <= 500 ? 'needs work' : 'poor')}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-1">
          <div className="col-span-1">FID:</div>
          <div className={`col-span-1 ${colors.fid} flex items-center`}>
            <span className="mr-1">{badges.fid}</span> 
            {metrics.fid === null ? '–' : `${metrics.fid}ms`}
          </div>
          <div className="col-span-1 text-right text-gray-500 text-[10px]">
            {metrics.fid !== null && (metrics.fid <= 100 ? 'good' : metrics.fid <= 300 ? 'needs work' : 'poor')}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-1">
          <div className="col-span-1">FCP:</div>
          <div className={`col-span-1 ${colors.fcp} flex items-center`}>
            <span className="mr-1">{badges.fcp}</span> 
            {metrics.fcp === null ? '–' : `${metrics.fcp}ms`}
          </div>
          <div className="col-span-1 text-right text-gray-500 text-[10px]">
            {metrics.fcp !== null && (metrics.fcp <= 1800 ? 'good' : metrics.fcp <= 3000 ? 'needs work' : 'poor')}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-1">
          <div className="col-span-1">TTFB:</div>
          <div className={`col-span-1 ${colors.ttfb} flex items-center`}>
            <span className="mr-1">{badges.ttfb}</span> 
            {metrics.ttfb === null ? '–' : `${metrics.ttfb}ms`}
          </div>
          <div className="col-span-1 text-right text-gray-500 text-[10px]">
            {metrics.ttfb !== null && (metrics.ttfb <= 800 ? 'good' : metrics.ttfb <= 1800 ? 'needs work' : 'poor')}
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 text-[10px] text-gray-500 dark:text-gray-400 flex justify-between items-center">
        <span>Ctrl+Alt+P to toggle</span>
        <a 
          href="https://web.dev/articles/vitals" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Info
        </a>
      </div>
    </div>
  );
}

// Επέκταση του global Window interface
declare global {
  interface Window {
    __PERFORMANCE_MONITOR__?: {
      enable: () => void
      disable: () => void
      toggle: () => void
      getMetrics: () => Record<string, unknown>
    }
    __ENABLE_PERFORMANCE_MONITORING__?: boolean
  }
}