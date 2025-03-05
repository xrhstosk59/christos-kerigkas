// src/components/scroll-progress.tsx
"use client"

import { motion, useScroll } from "framer-motion"
import { useTheme } from './themeprovider'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const { theme } = useTheme()
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-50 origin-left"
      style={{ 
        scaleX: scrollYProgress, 
        backgroundColor: theme === 'dark' ? 'rgb(99, 102, 241)' : 'rgb(79, 70, 229)' 
      }}
    />
  )
}