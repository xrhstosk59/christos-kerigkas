'use client'

import { useState } from 'react'
import { Mail, Phone, Github, Linkedin } from 'lucide-react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Add your form submission logic here
  }

  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Contact</h2>
          
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <div className="space-y-4">
                <a href="mailto:your-email@example.com" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Mail className="h-5 w-5" />
                  your-email@example.com
                </a>
                <a href="tel:+1234567890" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Phone className="h-5 w-5" />
                  +30 123 456 7890
                </a>
                <a href="https://github.com/yourusername" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Github className="h-5 w-5" />
                  GitHub
                </a>
                <a href="https://linkedin.com/in/yourusername" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Linkedin className="h-5 w-5" />
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}