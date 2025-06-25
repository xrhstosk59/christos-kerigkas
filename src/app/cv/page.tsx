// src/app/cv/page.tsx
import { Suspense } from 'react'
import { getCVData } from '@/lib/data/cv-data'
import InteractiveCV from '@/components/features/cv/interactive-cv'
import Navbar from '@/components/common/navbar'

export const dynamic = 'force-dynamic' // Να σιγουρευτούμε ότι η σελίδα θα ανανεώνεται πάντα

export default async function CVPage() {
  // Φόρτωση των δεδομένων CV από τον server
  const cvData = await getCVData()
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-20">
        <Suspense fallback={
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        }>
          <InteractiveCV initialCVData={cvData} />
        </Suspense>
      </main>
    </>
  )
}