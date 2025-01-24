'use client'

import { useState } from 'react'
import { Mail, Phone, Github, Linkedin, Loader2 } from 'lucide-react'
import { useTheme } from './themeprovider'
import { motion } from 'framer-motion'

export function Contact() {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error()

      setStatus('success')
      setFormData({ name: '', email: '', message: '' })

      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }
  return (
    <section id="contact" className={`py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl lg:max-w-4xl"
        >
          <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            Contact
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <div className="space-y-4">
                {[
                  { icon: Mail, text: 'your-email@example.com', href: 'mailto:your-email@example.com' },
                  { icon: Phone, text: '+30 123 456 7890', href: 'tel:+301234567890' },
                  { icon: Github, text: 'GitHub', href: 'https://github.com/yourusername' },
                  { icon: Linkedin, text: 'LinkedIn', href: 'https://linkedin.com/in/yourusername' }
                ].map((item) => (
                  <motion.a
                    key={item.text}
                    href={item.href}
                    whileHover={{ x: 5 }}
                    className={`flex items-center gap-2 ${theme === 'dark'
                        ? 'text-gray-300 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                      } transition-colors duration-200`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.text}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {[
                { id: 'name', type: 'text', label: 'Name' },
                { id: 'email', type: 'email', label: 'Email' }
              ].map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id} className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    id={field.id}
                    value={formData[field.id as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${theme === 'dark'
                        ? 'bg-gray-900 border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    required
                    disabled={status === 'loading'}
                  />
                </div>
              ))}

              <div>
                <label htmlFor="message" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${theme === 'dark'
                      ? 'bg-gray-900 border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  required
                  disabled={status === 'loading'}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className={`relative w-full rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 ${status === 'loading'
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}
              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </span>
                ) : status === 'success' ? (
                  'Message Sent!'
                ) : status === 'error' ? (
                  'Failed to Send - Try Again'
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}