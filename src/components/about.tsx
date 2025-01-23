'use client'

import { useTheme } from './themeprovider'
import { motion } from 'framer-motion'
import { Code2, Dumbbell, GraduationCap, Home, Binary } from 'lucide-react'
import { cn } from '@/lib/utils'

const details = [
  {
    icon: Code2,
    title: 'Full Stack Developer',
    description: 'Ειδικεύομαι στην ανάπτυξη web εφαρμογών με Next.js, React και TypeScript'
  },
  {
    icon: GraduationCap,
    title: 'Computer Science Student',
    description: 'Φοιτητής Πληροφορικής με έμφαση στο web development'
  },
  {
    icon: Binary,
    title: 'Crypto Enthusiast',
    description: 'Ανάπτυξη εργαλείων ανάλυσης και trading bots για κρυπτονομίσματα'
  },
  {
    icon: Home,
    title: 'Location',
    description: 'Καβάλα, Ελλάδα με καταγωγή από τη Χαλκιδική'
  },
  {
    icon: Dumbbell,
    title: 'Lifestyle',
    description: 'Καθημερινή γυμναστική και υγιεινή διατροφή'
  }
]

export function About() {
  const { theme } = useTheme()
  
  return (
    <section id="about" className={cn(
      "py-24",
      theme === 'dark' ? 'bg-gray-950' : 'bg-white'
    )}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl lg:max-w-4xl"
        >
          <h2 className={cn(
            "text-3xl font-bold tracking-tight sm:text-4xl text-center",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            About Me
          </h2>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {details.map((detail, index) => (
              <motion.div
                key={detail.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative p-6 rounded-2xl transition-colors",
                  theme === 'dark' 
                    ? 'bg-gray-900/50 hover:bg-gray-900/80' 
                    : 'bg-gray-50 hover:bg-gray-100'
                )}
              >
                <div className={cn(
                  "rounded-lg p-2 w-10 h-10 mb-4 flex items-center justify-center",
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                )}>
                  <detail.icon className={cn(
                    "w-5 h-5",
                    theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                  )} />
                </div>
                
                <h3 className={cn(
                  "text-lg font-semibold mb-2",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {detail.title}
                </h3>
                
                <p className={cn(
                  "text-sm leading-relaxed",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  {detail.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={cn(
              "mt-12 text-lg leading-8 text-center",
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            )}
          >
            21 ετών, με πάθος για την τεχνολογία και την ανάπτυξη καινοτόμων λύσεων. 
            Συνδυάζω τις σπουδές μου στην πληροφορική με πρακτική εμπειρία σε modern web development 
            και blockchain τεχνολογίες.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}