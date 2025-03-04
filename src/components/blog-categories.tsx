// src/components/blog-categories.tsx
'use client'

import { useTheme } from './themeprovider'
import { cn } from '@/lib/utils'

interface BlogCategoriesProps {
  categories: string[]
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function BlogCategories({ categories, activeCategory, onCategoryChange }: BlogCategoriesProps) {
  const { theme } = useTheme()

  return (
    <div className="mb-8">
      <h3 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        Φιλτράρισμα ανά κατηγορία
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange('all')}
          className={cn(
            'px-3 py-1 text-sm rounded-full transition-colors',
            activeCategory === 'all'
              ? theme === 'dark'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-600 text-white'
              : theme === 'dark'
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          Όλα
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              'px-3 py-1 text-sm rounded-full transition-colors',
              activeCategory === category
                ? theme === 'dark'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-600 text-white'
                : theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}