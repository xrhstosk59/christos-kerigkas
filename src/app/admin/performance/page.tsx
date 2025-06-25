import { Metadata } from 'next';
import { Suspense } from 'react';
import PerformanceMonitor from '@/components/features/admin/performance-monitor';

export const metadata: Metadata = {
  title: 'Performance Monitor - Admin Dashboard',
  description: 'Monitor system performance metrics and analytics',
};

export default function PerformancePage() {
  return (
    <div className="p-6">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }>
        <PerformanceMonitor />
      </Suspense>
    </div>
  );
}