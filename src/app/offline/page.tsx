// src/app/offline/page.tsx
'use client';

import Link from 'next/link';
import { WifiOff, Home, RefreshCw, Clock } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <WifiOff className="mx-auto h-16 w-16 text-gray-400" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            You're Offline
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            It looks like you're not connected to the internet.
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Some content is still available
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Pages you've visited recently might still work offline thanks to caching.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">What you can try:</h2>
              
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Check your internet connection
                </li>
                <li className="flex items-start">
                  <span className="block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Try refreshing the page
                </li>
                <li className="flex items-start">
                  <span className="block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Check if other websites are working
                </li>
                <li className="flex items-start">
                  <span className="block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Make sure WiFi is enabled
                </li>
              </ul>
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
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            This page works offline. When you're back online, you'll automatically have access to all features.
          </p>
        </div>
      </div>
    </div>
  );
}