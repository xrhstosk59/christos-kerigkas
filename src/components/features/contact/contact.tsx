'use client'

import { useState } from 'react'
import { Mail, Phone, Github, Linkedin, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useClientTheme } from '@/hooks/useClientTheme'

type StatusType = 'idle' | 'loading' | 'success' | 'error' | 'partialSuccess'
type ValidationError = {
  fieldErrors: Record<string, string[]>;
  formErrors: string[];
}
type ErrorType = ValidationError | null

export function Contact() {
  const { mounted } = useClientTheme();
  
  // Αρχικοποίηση της φόρμας με κενό string για να αποφύγουμε το hydration mismatch
  // μεταξύ server και client rendering
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  
  const [status, setStatus] = useState<StatusType>('idle')
  const [errors, setErrors] = useState<ErrorType>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successDetails, setSuccessDetails] = useState<{
    databaseSuccess?: boolean;
    emailSent?: boolean;
  }>({})

  // Το mounted το παίρνουμε από το useClientTheme hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrors(null)
    setErrorMessage('')
    setSuccessDetails({})

    try {
      console.log('Submitting form data')
      
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      // Log response status
      console.log('Server response status:', res.status)
      
      // Parse the JSON response
      let data
      try {
        data = await res.json()
        console.log('Server response data:', data)
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError)
        setErrorMessage('Received invalid response from server')
        setStatus('error')
        return
      }

      if (!res.ok) {
        // Handle validation errors
        if (res.status === 400 && data.errors) {
          setErrors(data.errors)
          setErrorMessage(data.message || 'Please check the form for errors')
        } else {
          setErrorMessage(data.message || 'Failed to send message')
        }
        setStatus('error')
        return
      }

      // Store details about what operations succeeded
      setSuccessDetails({
        databaseSuccess: data.databaseSuccess,
        emailSent: data.emailSent
      })

      // Set appropriate status based on response
      if (data.databaseSuccess && data.emailSent) {
        // Everything successful
        setStatus('success')
      } else if (data.databaseSuccess || data.emailSent) {
        // Partial success
        setStatus('partialSuccess')
      } else {
        // Something went wrong but the server returned 200
        setStatus('partialSuccess')
      }
      
      // Reset form on successful submission
      setFormData({ name: '', email: '', message: '' })

      // Reset status after delay
      setTimeout(() => setStatus('idle'), 7000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setStatus('error')
      setErrorMessage('Network error - please try again later')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  const getFieldError = (field: keyof typeof formData): string => {
    if (!errors || !errors.fieldErrors) return ''
    const fieldErrors = errors.fieldErrors[field]
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : ''
  }

  // Function to get the appropriate message based on status and success details
  const getStatusMessage = () => {
    if (status === 'success') {
      return 'Your message has been sent successfully and saved!'
    }
    
    if (status === 'partialSuccess') {
      if (successDetails.databaseSuccess && !successDetails.emailSent) {
        return 'Your message has been saved, but the email notification could not be sent.'
      }
      if (!successDetails.databaseSuccess && successDetails.emailSent) {
        return 'Your message has been sent by email, but could not be saved in our database.'
      }
      return 'Your message was partially processed. We may have received it but there was an issue.'
    }
    
    if (status === 'error') {
      return errorMessage || 'There was an error sending your message. Please try again.'
    }
    
    return ''
  }

  // Αν δεν έχει γίνει ακόμα mounted στον client, επιστρέφουμε μια skeleton έκδοση
  // του component για να αποφύγουμε hydration issues
  if (!mounted) {
    return (
      <section id="contact" className="py-24 bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
              Contact
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/5"></div>
              </div>
              <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="py-24 bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl lg:max-w-4xl"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
            Contact
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <div className="space-y-4">
                {[
                  { icon: Mail, text: 'xrhstosk59@gmail.com', href: 'mailto:xrhstosk59@gmail.com' },
                  { icon: Phone, text: '+30 6982031371', href: 'tel:+306982031371' },
                  { icon: Github, text: 'xrhstosk59', href: 'https://github.com/xrhstosk59' },
                  { icon: Linkedin, text: 'christoskerigkas', href: 'https://www.linkedin.com/in/christoskerigkas/' }
                ].map((item) => (
                  <motion.a
                    key={item.text}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.text}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form status message */}
              {status !== 'idle' && status !== 'loading' && (
                <div className={`p-3 rounded-md ${
                  status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                  status === 'partialSuccess' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                } flex items-start gap-2`}>
                  {status === 'success' && <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                  {status === 'partialSuccess' && <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                  {status === 'error' && <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                  <div>
                    {getStatusMessage()}
                  </div>
                </div>
              )}

              {/* Name field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 ${
                    getFieldError('name') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  required
                  disabled={status === 'loading'}
                />
                {getFieldError('name') && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('name')}</p>
                )}
              </div>
              
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 ${
                    getFieldError('email') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  required
                  disabled={status === 'loading'}
                />
                {getFieldError('email') && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('email')}</p>
                )}
              </div>

              {/* Message field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 ${
                    getFieldError('message') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  required
                  disabled={status === 'loading'}
                  spellCheck="false"
                  data-ms-editor="true"
                />
                {getFieldError('message') && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('message')}</p>
                )}
              </div>

              {/* Submit button */}
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
                    Αποστολή...
                  </span>
                ) : (
                  'Αποστολή Μηνύματος'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact