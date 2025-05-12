'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { reportError } from './reporting'  // Διόρθωση: αλλαγή από '../reporting' σε './reporting'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Επαναχρησιμοποιήσιμο Error Boundary component
 * Μπορεί να χρησιμοποιηθεί σε οποιοδήποτε επίπεδο της εφαρμογής για χειρισμό σφαλμάτων
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Ενημέρωση του state ώστε να εμφανιστεί το fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Καταγραφή του σφάλματος
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    
    // Αποστολή του σφάλματος στην υπηρεσία αναφοράς σφαλμάτων
    reportError(error, errorInfo)
    
    // Εκτέλεση του callback onError αν έχει οριστεί
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  componentDidUpdate(prevProps: Props): void {
    // Επαναφορά του error boundary όταν αλλάζουν τα props
    // Χρήσιμο για αυτόματη επαναφορά κατά την αλλαγή της σελίδας ή άλλων props
    if (this.state.hasError && this.props.resetOnPropsChange && prevProps !== this.props) {
      this.reset()
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Αν έχει οριστεί custom fallback, το χρησιμοποιούμε
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Διαφορετικά, εμφανίζουμε ένα προεπιλεγμένο fallback UI
      return (
        <div className="py-8 px-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-700 dark:text-red-400">
            Κάτι πήγε στραβά
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Παρουσιάστηκε ένα σφάλμα κατά την προβολή αυτού του περιεχομένου.
          </p>
          <button
            onClick={this.reset}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Δοκιμάστε ξανά
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary