// src/app/admin/audit-logs/page.tsx
import { Suspense } from 'react';
import AuditLogsViewer from '@/components/features/admin/audit-logs-viewer';

export default function AuditLogsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Audit Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          View and analyze system audit logs and user activities
        </p>
      </div>
      
      <Suspense fallback={
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      }>
        <AuditLogsViewer />
      </Suspense>
    </div>
  );
}