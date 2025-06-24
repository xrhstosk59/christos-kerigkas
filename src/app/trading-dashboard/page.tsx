// src/app/trading-dashboard/page.tsx
"use client"

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { TradingDashboard } from '@/components/common/dynamic-components'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { Footer } from '@/components/common/footer'

const Navbar = dynamic(() => import('@/components/common/navbar'), { ssr: false })

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="pt-24">
        <Suspense fallback={<DashboardSkeleton />}>
          <TradingDashboard />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}