// src/app/trading-dashboard/page.tsx
"use client"

import dynamic from 'next/dynamic'

const Navbar = dynamic(() => import('@/components/common/navbar'), { ssr: false })
import TradingDashboard from '@/components/features/trading/trading-dashboard'
import { Footer } from '@/components/common/footer'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="pt-24">
        <TradingDashboard />
      </div>
      <Footer />
    </main>
  )
}