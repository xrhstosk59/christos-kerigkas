// src/app/settings/page.tsx
import { Suspense } from 'react';
import UserSettings from '@/components/features/settings/user-settings';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your account security and preferences
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        }>
          <UserSettings />
        </Suspense>
      </div>
    </div>
  );
}