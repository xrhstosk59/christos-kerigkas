// src/app/cv/loading.tsx
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
      <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
        Φόρτωση βιογραφικού...
      </p>
    </div>
  );
}