import { ErrorInfo } from 'react'

// Τύποι πιθανών σφαλμάτων
export enum ErrorType {
  NETWORK = 'NETWORK',      // Σφάλματα δικτύου (fetch, API calls)
  BOUNDARY = 'BOUNDARY',    // Σφάλματα από React Error Boundaries
  AUTH = 'AUTH',            // Σφάλματα αυθεντικοποίησης
  VALIDATION = 'VALIDATION',// Σφάλματα επικύρωσης δεδομένων
  RUNTIME = 'RUNTIME',      // Γενικά σφάλματα runtime
  UNKNOWN = 'UNKNOWN'       // Άγνωστα σφάλματα
}

// Δομή αναφοράς σφάλματος
interface ErrorReport {
  message: string
  stack?: string
  type: ErrorType
  timestamp: string
  url: string
  userAgent: string
  componentStack?: string
  additionalData?: Record<string, unknown>
}

/**
 * Προσδιορίζει τον τύπο του σφάλματος βάσει του error object
 */
function determineErrorType(error: Error): ErrorType {
  // DOMException Network Errors
  if (error instanceof DOMException && (
    error.name === 'NetworkError' || 
    error.message.includes('network'))) {
    return ErrorType.NETWORK
  }
  
  // TypeError για σφάλματα που μπορεί να σχετίζονται με δίκτυο
  if (error instanceof TypeError && (
    error.message.includes('fetch') || 
    error.message.includes('network') || 
    error.message.includes('Failed to fetch'))) {
    return ErrorType.NETWORK
  }
  
  // Σφάλματα αυθεντικοποίησης
  if (error.message.includes('authentication') || 
      error.message.includes('auth') || 
      error.message.includes('unauthorized') || 
      error.message.includes('not logged in') ||
      error.message.includes('forbidden')) {
    return ErrorType.AUTH
  }
  
  // Σφάλματα επικύρωσης
  if (error.message.includes('validation') || 
      error.name === 'ValidationError' || 
      error.message.includes('is required')) {
    return ErrorType.VALIDATION
  }
  
  // Αν δεν μπορούμε να προσδιορίσουμε τον τύπο
  return ErrorType.UNKNOWN
}

/**
 * Κύρια συνάρτηση αναφοράς σφαλμάτων
 * Καταγράφει το σφάλμα και το αποστέλλει στην υπηρεσία αναφοράς σφαλμάτων
 */
export function reportError(error: Error, errorInfo?: ErrorInfo, additionalData?: Record<string, unknown>): void {
  const errorType = determineErrorType(error)
  
  // Δημιουργία του report object
  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    type: errorType,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    componentStack: errorInfo?.componentStack || undefined,
    additionalData
  }
  
  // Console log για development
  if (process.env.NODE_ENV === 'development') {
    console.group('🔴 Error Report')
    console.error('Error:', error)
    if (errorInfo) {
      console.error('Error Info:', errorInfo)
    }
    console.log('Report:', report)
    console.groupEnd()
  }
  
  // Αποστολή του report στην υπηρεσία αναφοράς σφαλμάτων
  // Θα μπορούσαμε να χρησιμοποιήσουμε Sentry, LogRocket, κτλ
  sendErrorToReportingService(report).catch(err => {
    console.error('Failed to send error report:', err)
  })
}

/**
 * Αποστολή του σφάλματος σε external service
 * Προς το παρόν, απλά προσομοιώνουμε την αποστολή
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendErrorToReportingService(report: ErrorReport): Promise<void> {
  // Σε παραγωγικό περιβάλλον, θα κάναμε κάτι σαν:
  // await fetch('/api/error-reporting', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(report),
  // })
  
  // Για τώρα, απλά κάνουμε ένα fake delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Θα μπορούσαμε να ενσωματώσουμε υπηρεσίες όπως:
  // - Sentry
  // - LogRocket
  // - Bugsnag
  // - Rollbar
  // - Application Insights
}