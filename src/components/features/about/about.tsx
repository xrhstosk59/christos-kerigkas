'use client'

import { motion } from 'framer-motion'
import { Code2, GraduationCap, MapPin, Briefcase } from 'lucide-react'

const details = [
  {
    icon: Code2,
    title: 'Web Developer',
    description: 'Building mainly with TypeScript and JavaScript across React, Next.js, Supabase, and selected Java/JavaFX coursework projects'
  },
  {
    icon: GraduationCap,
    title: 'Undergraduate CS Student',
    description: 'Studying Computer Science at Democritus University of Thrace'
  },
  {
    icon: Briefcase,
    title: 'Internship',
    description: 'Technical Support internship focused on hardware, printers, networking, and day-to-day ICT support for the Municipality of Nea Propontida'
  },
  {
    icon: MapPin,
    title: 'Location',
    description: 'Based in Greece and open to new opportunities and collaborations'
  }
]

export function About() {
  return (
    <section
      id="about"
      className="py-24 bg-background"
      aria-label="About Me Section"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl lg:max-w-4xl"
        >
          <div className="text-center">
            <p className="text-[0.7rem] sm:text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              Introduction
            </p>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl font-medium tracking-tight text-foreground">
              About Me
            </h2>
            <div aria-hidden="true" className="mt-6 mx-auto h-px w-16 bg-primary/60" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-2"
          >
            {details.map((detail, index) => (
              <motion.div
                key={detail.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors"
              >
                <div className="rounded-lg p-2 w-10 h-10 mb-4 flex items-center justify-center bg-primary/10">
                  <detail.icon className="w-5 h-5 text-primary" />
                </div>

                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {detail.title}
                </h3>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {detail.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-lg leading-8 text-center text-muted-foreground"
          >
            Computer Science student at Democritus University of Thrace, focused on responsive websites and web applications with
            TypeScript and JavaScript. My work so far comes mainly from university projects, personal projects, and experimentation,
            often using AI-assisted workflows for faster iteration, debugging, and cleanup.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
