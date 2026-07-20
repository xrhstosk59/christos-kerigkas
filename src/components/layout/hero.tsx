// src/components/layout/hero.tsx — editorial hero
'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowDownCircle, Github, Linkedin, Mail } from 'lucide-react'
import Link from 'next/link'
import { PROFILE_IMAGE_URL } from '@/lib/utils/storage'

interface SocialLink {
  icon: React.ComponentType<{ className?: string }>
  href: string
  label: string
  username: string
}

const socialLinks: SocialLink[] = [
  {
    icon: Github,
    href: 'https://github.com/xrhstosk59',
    label: 'GitHub Profile',
    username: '@xrhstosk59'
  },
  {
    icon: Linkedin,
    href: 'https://linkedin.com/in/christoskerigkas',
    label: 'LinkedIn Profile',
    username: 'Christos Kerigkas'
  },
  {
    icon: Mail,
    href: 'mailto:xrhstosk59@gmail.com',
    label: 'Email Contact',
    username: 'xrhstosk59@gmail.com'
  }
]

export default function Hero() {
  const [imageError, setImageError] = useState(false)

  const handleImageError = useCallback(() => {
    setImageError(true)
    console.warn('Profile image failed to load')
  }, [])

  return (
    <section
      className="relative isolate overflow-hidden px-4 sm:px-6 pt-14 lg:px-8 min-h-[calc(100vh-64px)] flex items-center bg-background"
      aria-label="Introduction"
    >
      {/* Soft brass glow behind the composition */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_45%_at_50%_38%,hsl(var(--primary)/0.10),transparent_70%)]"
      />

      <div className="mx-auto max-w-3xl py-12 sm:py-20 lg:py-28 w-full">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative mb-10 mx-auto w-32"
          >
            <div className="w-32 h-32 relative rounded-full overflow-hidden ring-1 ring-primary/70 ring-offset-4 ring-offset-background shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.45)]">
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted text-sm text-muted-foreground z-10">
                  Image failed to load
                </div>
              )}
              <Image
                src={PROFILE_IMAGE_URL}
                alt="Christos Kerigkas Profile Picture"
                fill
                sizes="(max-width: 768px) 96px, 128px"
                priority
                className="object-cover w-full h-full"
                onError={handleImageError}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-[0.7rem] sm:text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              Portfolio · Web Developer
            </p>

            <h1 className="mt-5 font-display text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-foreground [font-optical-sizing:auto]">
              Christos Kerigkas
            </h1>

            <div aria-hidden="true" className="mt-7 mx-auto h-px w-16 bg-primary/60" />

            <p className="mt-7 text-base sm:text-lg leading-relaxed max-w-xl mx-auto text-muted-foreground">
              Computer Science student building responsive websites and web applications while using
              AI-assisted workflows to iterate faster and improve project quality.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center gap-3"
          >
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full border border-transparent text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors duration-200"
                aria-label={link.label}
              >
                <link.icon className="w-5 h-5" />
                <span className="sr-only">{link.username}</span>
              </a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-8"
          >
            <Link
              href="#contact"
              className="w-full sm:w-auto rounded-full bg-primary px-8 py-3 text-sm font-semibold tracking-wide text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-opacity duration-200"
            >
              Get in Touch
            </Link>
            <Link
              href="#projects"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors duration-200"
            >
              View Projects
              <ArrowDownCircle className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
