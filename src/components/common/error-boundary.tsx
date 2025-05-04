'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Ενημέρωση του state ώστε η επόμενη render να δείξει το fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Μπορείς να καταγράψεις το σφάλμα σε μια υπηρεσία καταγραφής σφαλμάτων
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Αν έχει παρασχεθεί custom fallback UI, χρησιμοποίησέ το
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Διαφορετικά, χρησιμοποίησε το προεπιλεγμένο fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
            Κάτι πήγε στραβά
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Παρουσιάστηκε ένα σφάλμα κατά την προβολή αυτού του περιεχομένου.
          </p>
          {this.state.error && (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 mb-6 rounded-md text-left w-full max-w-xl overflow-auto">
              <p className="font-mono text-sm text-red-600 dark:text-red-400 mb-2">
                {this.state.error.toString()}
              </p>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Component Stack
                  </summary>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto p-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Προσπάθησε ξανά
          </button>
        </div>
      );
    }

    // Όταν δεν υπάρχει σφάλμα, απλώς απόδωσε τα children
    return this.props.children;
  }
}