// src/app/error.tsx
'use client'

import ErrorBoundary from '@/components/common/error-boundary'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <ErrorBoundary
          fallback={
            <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
              <h2 className="mb-4 text-2xl font-bold">Κάτι πήγε στραβά!</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Συγγνώμη, αντιμετωπίσαμε ένα σφάλμα κατά την επεξεργασία του αιτήματός σας.
              </p>
              <button
                onClick={() => reset()}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Δοκιμάστε ξανά
              </button>
            </div>
          }
        >
          <div>
            <h2>Σφάλμα</h2>
            <p>{error.message}</p>
            <button onClick={() => reset()}>Δοκιμάστε ξανά</button>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}