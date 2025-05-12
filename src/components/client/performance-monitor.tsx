'use client'

import { useEffect, useState } from 'react'

// Τύπος για τις μετρικές Web Vitals
interface Metric {
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
  
  useEffect(() => {
    // Μόνο για development mode
    if (process.env.NODE_ENV !== 'development') {
      return
    }
    
    // Για εύκολη ενεργοποίηση/απενεργοποίηση μέσω του console
    window.__PERFORMANCE_MONITOR__ = {
      enable: () => setShowMetrics(true),
      disable: () => setShowMetrics(false),
      toggle: () => setShowMetrics(prev => !prev),
    }
    
    // Ενεργοποίηση με πληκτρολόγιο (Ctrl+Alt+P)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key === 'p') {
        setShowMetrics(prev => !prev)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    
    // Μέτρηση Web Vitals με την web-vitals βιβλιοθήκη
    // Σημείωση: Το πακέτο web-vitals χρειάζεται να εγκατασταθεί
    const loadWebVitals = async () => {
      try {
        const webVitals = await import('web-vitals')
        
        // Μετρήσεις με σωστούς τύπους
        webVitals.onFCP((metric: Metric) => {
          setMetrics(prev => ({ ...prev, fcp: Math.round(metric.value) }))
        })
        
        webVitals.onLCP((metric: Metric) => {
          setMetrics(prev => ({ ...prev, lcp: Math.round(metric.value) }))
        })
        
        webVitals.onCLS((metric: Metric) => {
          setMetrics(prev => ({ ...prev, cls: Math.round(metric.value * 1000) / 1000 }))
        })
        
        webVitals.onFID((metric: Metric) => {
          setMetrics(prev => ({ ...prev, fid: Math.round(metric.value) }))
        })
        
        webVitals.onTTFB((metric: Metric) => {
          setMetrics(prev => ({ ...prev, ttfb: Math.round(metric.value) }))
        })
        
        webVitals.onINP((metric: Metric) => {
          setMetrics(prev => ({ ...prev, inp: Math.round(metric.value) }))
        })
      } catch (error) {
        console.error('Failed to load web-vitals module:', error);
        // Εναλλακτικά μπορούμε να χρησιμοποιήσουμε το Performance API
        // για μερικές βασικές μετρήσεις αν χρειαστεί
      }
    }
    
    loadWebVitals();
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      delete window.__PERFORMANCE_MONITOR__
    }
  }, [])
  
  // Εάν δεν είμαστε σε development mode ή το panel είναι απενεργοποιημένο
  if (process.env.NODE_ENV !== 'development' || !showMetrics) {
    return null
  }
  
  // Helpers για το χρωματισμό των μετρικών με βάση τις βέλτιστες πρακτικές
  const getLCPColor = (lcp: number | null) => {
    if (lcp === null) return 'text-gray-400'
    return lcp <= 2500 ? 'text-green-500' : lcp <= 4000 ? 'text-yellow-500' : 'text-red-500'
  }
  
  const getFIDColor = (fid: number | null) => {
    if (fid === null) return 'text-gray-400'
    return fid <= 100 ? 'text-green-500' : fid <= 300 ? 'text-yellow-500' : 'text-red-500'
  }
  
  const getCLSColor = (cls: number | null) => {
    if (cls === null) return 'text-gray-400'
    return cls <= 0.1 ? 'text-green-500' : cls <= 0.25 ? 'text-yellow-500' : 'text-red-500'
  }
  
  const getINPColor = (inp: number | null) => {
    if (inp === null) return 'text-gray-400'
    return inp <= 200 ? 'text-green-500' : inp <= 500 ? 'text-yellow-500' : 'text-red-500'
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 text-xs max-w-xs border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Performance Metrics</h3>
        <button 
          onClick={() => setShowMetrics(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>FCP:</span>
          <span className="font-mono">
            {metrics.fcp === null ? '–' : `${metrics.fcp}ms`}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>LCP:</span>
          <span className={`font-mono ${getLCPColor(metrics.lcp)}`}>
            {metrics.lcp === null ? '–' : `${metrics.lcp}ms`}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>CLS:</span>
          <span className={`font-mono ${getCLSColor(metrics.cls)}`}>
            {metrics.cls === null ? '–' : metrics.cls}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>FID:</span>
          <span className={`font-mono ${getFIDColor(metrics.fid)}`}>
            {metrics.fid === null ? '–' : `${metrics.fid}ms`}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>INP:</span>
          <span className={`font-mono ${getINPColor(metrics.inp)}`}>
            {metrics.inp === null ? '–' : `${metrics.inp}ms`}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>TTFB:</span>
          <span className="font-mono">
            {metrics.ttfb === null ? '–' : `${metrics.ttfb}ms`}
          </span>
        </div>
      </div>
      
      <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">
        Ctrl+Alt+P to toggle
      </div>
    </div>
  )
}

// Επέκταση του global Window interface για το performance monitor
declare global {
  interface Window {
    __PERFORMANCE_MONITOR__?: {
      enable: () => void
      disable: () => void
      toggle: () => void
    }
  }
}