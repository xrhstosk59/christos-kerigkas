// src/app/blog/loading.tsx
export default function BlogLoading() {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col lg:flex-row gap-8 p-6 rounded-lg bg-white dark:bg-gray-900">
                <div className="lg:w-1/3 h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                <div className="lg:w-2/3 space-y-4">
                  <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }