// src/components/ui/animated-button.tsx
"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "primary" | "ghost"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
  icon?: React.ReactNode
  withArrow?: boolean
  asChild?: boolean
  isLoading?: boolean
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "md", 
    children, 
    icon, 
    withArrow = false,
    isLoading = false,
    ...props 
  }, ref) => {
    const variants = {
      default: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
      primary: "bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500",
      outline: "border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
      ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
    }
    
    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4",
      lg: "h-11 px-6",
    }
    
    return (
      <motion.button
        ref={ref as any}
        className={cn(
          "relative inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        {...props as any}
      >
        {isLoading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        
        {icon && !isLoading && <span className="mr-2">{icon}</span>}
        
        {children}
        
        {withArrow && (
          <motion.span 
            className="ml-2"
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
          >
            →
          </motion.span>
        )}
      </motion.button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"