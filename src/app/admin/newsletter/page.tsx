// src/app/admin/newsletter/page.tsx
import { Suspense } from 'react';
import NewsletterManager from '@/components/features/admin/newsletter-manager';

export default function NewsletterPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Newsletter Subscribers
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage newsletter subscriptions and send updates to subscribers
        </p>
      </div>
      
      <Suspense fallback={
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      }>
        <NewsletterManager />
      </Suspense>
    </div>
  );
}