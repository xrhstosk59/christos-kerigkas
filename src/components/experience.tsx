// src/components/experience.tsx
'use client'

import { useTheme } from './themeprovider'
import { motion } from 'framer-motion'
import { FileCode2, LineChart, Bot } from 'lucide-react'
import { ExperienceServer } from './experience-server'

export function Experience() {
  const { theme } = useTheme()
  
  const renderIcon = (iconName: string) => {
    const iconProps = { className: `w-6 h-6 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}` }
    
    switch (iconName) {
      case 'FileCode2': return <FileCode2 {...iconProps} />
      case 'LineChart': return <LineChart {...iconProps} />
      case 'Bot': return <Bot {...iconProps} />
      default: return <FileCode2 {...iconProps} />
    }
  }
  
  return (
    <section 
      id="experience" 
      className={`py-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
      aria-label="Experience and Projects"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <ExperienceServer theme={theme} renderIcon={renderIcon} />
        </motion.div>
      </div>
    </section>
  )
}