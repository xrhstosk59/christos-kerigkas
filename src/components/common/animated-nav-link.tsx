// src/components/animated-nav-link.tsx
"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils/utils"

interface AnimatedNavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function AnimatedNavLink({ href, children, className, onClick }: AnimatedNavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || 
                  (pathname?.startsWith(href) && href !== '/' && pathname !== '/')
  
  return (
    <a 
      href={href} 
      className={cn(
        "relative py-1.5 px-1 text-sm font-medium transition-colors",
        className
      )}
      onClick={onClick}
    >
      {children}
      {isActive && (
        <motion.span
          layoutId="navbar-indicator"
          className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
    </a>
  )
}