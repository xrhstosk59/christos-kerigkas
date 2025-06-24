// src/components/error-boundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode, ReactElement } from 'react';
import { SentryErrorBoundary, reportError } from '@/lib/monitoring/sentry';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

/**
 * Enhanced Error Boundary with Sentry integration
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Report to Sentry
    const errorId = reportError(error, {
      feature: 'error_boundary',
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    });
    
    this.setState({ errorId });
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
              <h1 className="mt-6 text-3xl font-bold text-gray-900">
                Something went wrong
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                We're sorry, but something unexpected happened.
              </p>
            </div>

            <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="space-y-6">
                {this.props.showDetails && this.state.error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error Details
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <code className="text-xs">
                            {this.state.error.message}
                          </code>
                        </div>
                        {this.state.errorId && (
                          <div className="mt-2 text-xs text-red-600">
                            Error ID: {this.state.errorId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        What you can try
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Refresh the page</li>
                          <li>Clear your browser cache</li>
                          <li>Try again in a few minutes</li>
                          <li>Contact support if the problem persists</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </button>
                  
                  <Link
                    href="/"
                    className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Link>
                </div>
              </div>
            </div>

            {this.state.errorId && (
              <div className="mt-6 text-center text-xs text-gray-500">
                <p>
                  This error has been automatically reported. 
                  Reference ID: <code>{this.state.errorId}</code>
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Sentry-powered Error Boundary (recommended for production)
 */
export function SentryBasedErrorBoundary({ 
  children, 
  fallback,
  showDialog = false,
}: {
  children: ReactNode;
  fallback?: (props: any) => ReactElement;
  showDialog?: boolean;
}) {
  return (
    <SentryErrorBoundary
      fallback={fallback || ((props: any) => <ErrorFallback error={props.error} resetError={props.resetError} />)}
      showDialog={showDialog}
      beforeCapture={(scope, error, errorInfo) => {
        scope.setTag('errorBoundary', 'sentry');
        if (typeof errorInfo === 'object' && errorInfo !== null) {
          scope.setContext('errorInfo', {
            componentStack: (errorInfo as any).componentStack,
          });
        }
      }}
    >
      {children}
    </SentryErrorBoundary>
  );
}

/**
 * Default error fallback component
 */
function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4 max-w-md">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={resetError}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </button>
      </div>
    </div>
  );
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryConfig?: Partial<Props>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryConfig}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}