// src/components/common/page-transition.tsx
"use client"

import { useRef, useEffect, useState, useMemo, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useSearchParams } from "next/navigation"

interface PageTransitionProps {
  children: React.ReactNode
}

// Το LoadingFallback component που θα εμφανίζεται κατά τη φόρτωση
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 border-l-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
    </div>
  )
}

// Το κύριο component που περιέχει την λογική μετάβασης
function PageTransitionContent({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Αποθήκευση του προηγούμενου pathname για σύγκριση
  const previousPathname = useRef<string | null>(null)
  
  // Παρακολούθηση του πρώτου render για αποφυγή animation
  const isFirstRender = useRef(true)
  
  // Καταγραφή του τρόπου μετάβασης (γρήγορη/αργή)
  const [transitionType, setTransitionType] = useState<'instant' | 'transition'>('instant')
  
  // Ενημέρωση του previousPathname μετά από κάθε αλλαγή διαδρομής
  useEffect(() => {
    // Το πρώτο render δεν θα έχει animation
    if (isFirstRender.current) {
      isFirstRender.current = false
      previousPathname.current = pathname
      return
    }
    
    // Ορισμός του τύπου μετάβασης
    if (previousPathname.current !== pathname) {
      // Ελέγχουμε αν έχουμε αλλαγή στο βασικό pathname ή μόνο στα query params
      const isFullPageChange = previousPathname.current?.split('?')[0] !== pathname.split('?')[0]
      
      // Για αλλαγή σελίδας χρησιμοποιούμε το κανονικό transition
      // Για αλλαγή μόνο στα query params χρησιμοποιούμε instant transition
      setTransitionType(isFullPageChange ? 'transition' : 'instant')
    }
    
    // Ενημέρωση του προηγούμενου pathname
    previousPathname.current = pathname
  }, [pathname, searchParams])
  
  // Δημιουργούμε ένα μοναδικό κλειδί για κάθε διαδρομή συμπεριλαμβανομένων των query params
  const routeKey = useMemo(() => {
    return `${pathname}${searchParams ? `?${searchParams.toString()}` : ''}`
  }, [pathname, searchParams])
  
  // Προσαρμοσμένο animation ανάλογα με τον τύπο μετάβασης
  const variants = {
    initial: {
      opacity: transitionType === 'transition' ? 0 : 1,
      y: transitionType === 'transition' ? 20 : 0,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: transitionType === 'transition' ? 0 : 1,
      y: transitionType === 'transition' ? -20 : 0,
    },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={isFirstRender.current ? false : "initial"}
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{
          duration: transitionType === 'transition' ? 0.3 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
        onAnimationStart={() => {
          // Προσθήκη class στο body για απενεργοποίηση της κύλισης κατά τη διάρκεια του animation
          if (transitionType === 'transition') {
            document.body.classList.add('transition-active')
          }
        }}
        onAnimationComplete={() => {
          // Αφαίρεση class από το body μετά το animation
          document.body.classList.remove('transition-active')
          
          // Μετατόπιση του παραθύρου στην κορυφή μετά την ολοκλήρωση της μετάβασης
          if (transitionType === 'transition' && typeof window !== 'undefined') {
            window.scrollTo(0, 0)
          }
        }}
        className="transition-wrapper"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Το wrapper component που εξάγεται, το οποίο τυλίγει το περιεχόμενο σε Suspense
export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PageTransitionContent>
        {children}
      </PageTransitionContent>
    </Suspense>
  )
}