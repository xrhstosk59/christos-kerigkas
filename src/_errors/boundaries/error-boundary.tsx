'use client'

import React, { 
  Component, 
  ErrorInfo, 
  ReactNode, 
  useCallback, 
  useState 
} from 'react'
import { reportError } from './reporting'

// Props για το ErrorBoundary component
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<FallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: unknown[]
}

// Props για το Fallback component
export interface FallbackProps {
  error: Error
  errorInfo: ErrorInfo | null
  resetErrorBoundary: () => void
}

// State του ErrorBoundary
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

// Προεπιλεγμένο Fallback UI component
function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="p-6 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 border border-red-200 dark:border-red-800 text-center shadow-lg">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-800/20 flex items-center justify-center mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-red-600 dark:text-red-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold mb-2 text-red-700 dark:text-red-400">
          Κάτι πήγε στραβά
        </h2>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-lg">
          Παρουσιάστηκε ένα σφάλμα κατά την προβολή αυτού του περιεχομένου. 
          Μπορείτε να δοκιμάσετε ξανά ή να επιστρέψετε στην αρχική σελίδα.
        </p>
        
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-left mb-4 overflow-x-auto w-full max-w-lg">
          <p className="text-sm text-red-800 dark:text-red-300 font-mono whitespace-pre-wrap">
            {error.message}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Επιστροφή στην αρχική
          </button>
          
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Δοκιμάστε ξανά
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * ErrorBoundary component βελτιστοποιημένο για React 19
 * - Βελτιωμένος χειρισμός σφαλμάτων
 * - Υποστήριξη για προσαρμοσμένα fallback UIs
 * - Δυνατότητα επαναφοράς βασισμένη σε κλειδιά (resetKeys)
 * - Καλύτερη διαχείριση lifecycle
 */
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Ενημέρωση του state για εμφάνιση του fallback UI
    return { 
      hasError: true, 
      error 
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Αποθήκευση του errorInfo στο state
    this.setState({ errorInfo })
    
    // Καταγραφή του σφάλματος στην κονσόλα
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    
    // Αποστολή του σφάλματος στην υπηρεσία αναφοράς σφαλμάτων
    reportError(error, errorInfo)
    
    // Εκτέλεση του callback onError αν έχει οριστεί
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys, resetOnPropsChange } = this.props
    
    // Αν έχουμε σφάλμα και έχουν αλλάξει τα props
    if (this.state.hasError) {
      // Επαναφορά αν έχει οριστεί resetOnPropsChange
      if (resetOnPropsChange && prevProps !== this.props) {
        this.resetErrorBoundary()
      }
      
      // Επαναφορά αν έχουν αλλάξει τα resetKeys
      if (resetKeys) {
        const haveKeysChanged = resetKeys.some(
          (key, index) => key !== (prevProps.resetKeys || [])[index]
        )
        
        if (haveKeysChanged) {
          this.resetErrorBoundary()
        }
      }
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    })
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback: FallbackComponent = DefaultFallback } = this.props

    if (hasError && error) {
      // Χρησιμοποιούμε το προσαρμοσμένο ή το προεπιλεγμένο Fallback component
      return (
        <FallbackComponent
          error={error}
          errorInfo={errorInfo}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      )
    }

    return children
  }
}

/**
 * Wrapper function component για καλύτερη χρήση με hooks
 * και δυνατότητα προσθήκης επιπλέον λειτουργικότητας
 */
const ErrorBoundary = (props: ErrorBoundaryProps) => {
  // Χρήση του state για tracking επιπλέον δεδομένων όπως attempts
  const [resetAttempts, setResetAttempts] = useState(0)
  
  // Αποσυνθέτουμε το onError από τα props ώστε να αποφύγουμε το ESLint warning
  const { onError } = props
  
  // Handler για το onError με hooks για επιπλέον λειτουργικότητα
  const handleError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    // Αύξηση των απόπειρων επαναφοράς
    setResetAttempts(prev => prev + 1)
    
    // Κλήση του onError από τα props αν υπάρχει
    if (onError) {
      onError(error, errorInfo)
    }
    
    // Αποστολή περισσότερων δεδομένων στο σύστημα αναφοράς σφαλμάτων
    const enhancedErrorData = {
      attemptCount: resetAttempts + 1,
      url: typeof window !== 'undefined' ? window.location.href : null,
      timestamp: new Date().toISOString()
    }
    
    // Αποστολή των δεδομένων με το σφάλμα
    reportError(error, errorInfo, enhancedErrorData)
  }, [onError, resetAttempts])
  
  return <ErrorBoundaryClass {...props} onError={handleError} />
}

export default ErrorBoundary