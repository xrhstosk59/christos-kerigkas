// src/app/admin/lockouts/page.tsx
import { Suspense } from 'react';
import LockoutManager from '@/components/features/admin/lockout-manager';

export default function LockoutsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Account Lockouts
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Monitor and manage failed login attempts and account lockouts
        </p>
      </div>
      
      <Suspense fallback={
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      }>
        <LockoutManager />
      </Suspense>
    </div>
  );
}