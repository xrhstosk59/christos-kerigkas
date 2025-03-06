// src/app/admin/layout.tsx
import type { Metadata } from 'next'
import { checkAuth } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Christos Kerigkas',
  description: 'Admin dashboard for managing website content',
  // Prevent indexing of admin pages
  robots: {
    index: false,
    follow: false,
  }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect to login if not authenticated
  checkAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {children}
    </div>
  )
}