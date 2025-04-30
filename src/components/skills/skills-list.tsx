'use client'

// /src/components/skills/skills-list.tsx
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"

interface SkillsListProps {
  skills: Record<string, string[]>
  theme: 'light' | 'dark'
}

// Client Component για τη λίστα των skills με animations
export default function SkillsList({ skills, theme }: SkillsListProps) {
  return (
    <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
      {Object.entries(skills).map(([category, items], categoryIndex) => (
        <motion.div 
          key={category} 
          className={cn(
            "border rounded-lg p-6",
            theme === 'dark' ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: categoryIndex * 0.1 }}
        >
          <h3 className={cn(
            "text-lg font-semibold capitalize mb-4",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {category}
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {items.map((skill, skillIndex) => (
              <motion.span
                key={skill}
                className={cn(
                  "inline-flex items-center rounded-md px-3 py-1 text-sm font-medium transition-colors duration-200",
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    : 'bg-blue-50 text-blue-700'
                )}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (categoryIndex * 0.1) + (skillIndex * 0.03) }}
                whileHover={{ scale: 1.05 }}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}