// src/lib/monitoring/performance.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../utils/logger';

/**
 * Interface για την αποθήκευση δεδομένων απόδοσης.
 */
interface PerformanceMetrics {
  url: string;
  method: string;
  duration: number;
  timestamp: string;
  statusCode?: number;
  userAgent?: string;
  referer?: string;
  ipAddress?: string;
}

/**
 * Συλλογή μετρικών απόδοσης για τα API requests.
 */
export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static maxStoredMetrics = 1000;
  private static slowThresholdMs = 500; // Όριο για "αργά" αιτήματα (ms)

  /**
   * Προσθήκη νέων μετρικών στη συλλογή.
   */
  static addMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // Αν ξεπεράσουμε το όριο, αφαιρούμε τις παλαιότερες εγγραφές
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics = this.metrics.slice(-this.maxStoredMetrics);
    }
    
    // Καταγραφή των αργών αιτημάτων
    if (metrics.duration > this.slowThresholdMs) {
      logger.warn(
        `Αργό αίτημα: ${metrics.method} ${metrics.url} (${metrics.duration.toFixed(2)}ms)`,
        { 
          statusCode: metrics.statusCode,
          userAgent: metrics.userAgent
        },
        'performance-monitor'
      );
    }
  }

  /**
   * Λήψη των συγκεντρωμένων μετρικών.
   */
  static getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Λήψη των αργών αιτημάτων.
   */
  static getSlowRequests(thresholdMs = this.slowThresholdMs): PerformanceMetrics[] {
    return this.metrics.filter(m => m.duration > thresholdMs);
  }

  /**
   * Υπολογισμός μέσης διάρκειας αιτημάτων.
   */
  static getAverageRequestDuration(): number {
    if (this.metrics.length === 0) return 0;
    const sum = this.metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / this.metrics.length;
  }

  /**
   * Εκκαθάριση των μετρικών.
   */
  static clearMetrics(): void {
    this.metrics = [];
  }
}

/**
 * Middleware για τη μέτρηση της διάρκειας των αιτημάτων.
 * 
 * @returns Middleware function
 */
export function measureRequestDuration() {
  return async function(req: NextRequest, next: () => Promise<NextResponse>) {
    const startTime = performance.now();
    const url = req.nextUrl.pathname;
    const method = req.method;
    
    try {
      // Εκτέλεση του επόμενου middleware ή handler
      const response = await next();
      
      // Υπολογισμός διάρκειας
      const duration = performance.now() - startTime;
      
      // Συλλογή μετρικών
      const metrics: PerformanceMetrics = {
        url,
        method,
        duration,
        timestamp: new Date().toISOString(),
        statusCode: response.status,
        userAgent: req.headers.get('user-agent') || undefined,
        referer: req.headers.get('referer') || undefined,
        ipAddress: req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || undefined,
      };
      
      // Προσθήκη στη συλλογή μετρικών
      PerformanceMonitor.addMetrics(metrics);
      
      // Προσθήκη του χρόνου εκτέλεσης στα headers για λόγους debugging
      if (process.env.NODE_ENV !== 'production') {
        response.headers.set('X-Request-Duration', `${duration.toFixed(2)}ms`);
      }
      
      return response;
    } catch (error) {
      // Ακόμα και αν συμβεί σφάλμα, καταγράφουμε τη διάρκεια
      const duration = performance.now() - startTime;
      
      PerformanceMonitor.addMetrics({
        url,
        method,
        duration,
        timestamp: new Date().toISOString(),
        statusCode: 500, // Υποθέτουμε ότι είναι σφάλμα εσωτερικού διακομιστή
      });
      
      // Επαναρίπτουμε το σφάλμα για να το χειριστεί το επόμενο middleware
      throw error;
    }
  };
}

/**
 * Δομή για την αποθήκευση μετρήσεων απόδοσης σε τμήματα κώδικα.
 */
class PerformanceTimer {
  private startTime: number;
  private name: string;
  
  /**
   * Δημιουργία νέου timer.
   * 
   * @param name Όνομα του timer για αναγνώριση
   */
  constructor(name: string) {
    this.name = name;
    this.startTime = performance.now();
  }
  
  /**
   * Ολοκλήρωση του timer και καταγραφή του αποτελέσματος.
   * 
   * @param additionalInfo Επιπλέον πληροφορίες για καταγραφή
   * @returns Η διάρκεια σε milliseconds
   */
  end(additionalInfo?: Record<string, unknown>): number {
    const duration = performance.now() - this.startTime;
    
    logger.debug(
      `Απόδοση [${this.name}]: ${duration.toFixed(2)}ms`,
      additionalInfo,
      'performance-timer'
    );
    
    return duration;
  }
}

/**
 * Δημιουργία νέου timer για μέτρηση απόδοσης σε τμήματα κώδικα.
 * 
 * @param name Όνομα του timer
 * @returns Αντικείμενο PerformanceTimer
 */
export function startTimer(name: string): PerformanceTimer {
  return new PerformanceTimer(name);
}