// src/app/admin/contact-messages/page.tsx
import { Suspense } from 'react';
import ContactMessagesManager from '@/components/features/admin/contact-messages-manager';

export default function ContactMessagesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Contact Messages
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage and respond to contact form submissions
        </p>
      </div>
      
      <Suspense fallback={
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      }>
        <ContactMessagesManager />
      </Suspense>
    </div>
  );
}