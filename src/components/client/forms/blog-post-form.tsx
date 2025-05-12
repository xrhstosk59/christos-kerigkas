'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBlogPost, updateBlogPost } from '@/_actions/blog'
import type { BlogPost } from '@/types/blog'

interface BlogPostFormProps {
  post?: BlogPost  // Υπάρχει μόνο για ενημέρωση, όχι για δημιουργία
  categories: string[]
}

export default function BlogPostForm({ post, categories }: BlogPostFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    post?.categories || []
  )
  
  const isEditMode = !!post
  
  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Προσθήκη των κατηγοριών στο formData ως JSON string
      formData.set('categories', JSON.stringify(selectedCategories))
      
      let result
      
      if (isEditMode && post) {
        // Ενημέρωση υπάρχοντος post
        result = await updateBlogPost(post.slug, formData)
      } else {
        // Δημιουργία νέου post
        result = await createBlogPost(formData)
      }
      
      if (result.success) {
        // Ανακατεύθυνση στη σελίδα του blog
        if (isEditMode) {
          // Ανακατεύθυνση στη σελίδα του ενημερωμένου post
          const newSlug = formData.get('slug') as string
          router.push(`/blog/${newSlug}`)
        } else {
          // Ανακατεύθυνση στη λίστα blog
          router.push('/blog')
        }
        router.refresh()
      } else {
        setError(result.error || 'Παρουσιάστηκε ένα σφάλμα. Παρακαλώ προσπαθήστε ξανά.')
      }
    } catch (err) {
      setError('Παρουσιάστηκε ένα σφάλμα κατά την υποβολή της φόρμας.')
      console.error('Form submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  function handleCategoryToggle(category: string) {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category)
      } else {
        return [...prev, category]
      }
    })
  }
  
  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            defaultValue={post?.slug}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            placeholder="my-blog-post"
          />
        </div>
        
        {/* Τίτλος */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Τίτλος
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={post?.title}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            placeholder="Ο τίτλος του άρθρου"
          />
        </div>
      </div>
      
      {/* Περιγραφή */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Περιγραφή
        </label>
        <textarea
          id="description"
          name="description"
          required
          defaultValue={post?.description}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
          placeholder="Μια σύντομη περιγραφή του άρθρου..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ημερομηνία */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ημερομηνία
          </label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            required
            defaultValue={post?.date 
              ? new Date(post.date).toISOString().slice(0, 16) 
              : new Date().toISOString().slice(0, 16)}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
          />
        </div>
        
        {/* Εικόνα */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            URL Εικόνας
          </label>
          <input
            id="image"
            name="image"
            type="url"
            required
            defaultValue={post?.image}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Όνομα συντάκτη */}
        <div>
          <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Όνομα συντάκτη
          </label>
          <input
            id="authorName"
            name="authorName"
            type="text"
            required
            defaultValue={post?.author?.name}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            placeholder="Christos Kerigkas"
          />
        </div>
        
        {/* Εικόνα συντάκτη */}
        <div>
          <label htmlFor="authorImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            URL Εικόνας συντάκτη
          </label>
          <input
            id="authorImage"
            name="authorImage"
            type="url"
            required
            defaultValue={post?.author?.image}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            placeholder="https://example.com/author.jpg"
          />
        </div>
      </div>
      
      {/* Κατηγορίες */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Κατηγορίες
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              type="button"
              key={category}
              onClick={() => handleCategoryToggle(category)}
              className={`px-3 py-1 rounded-full text-sm 
                ${selectedCategories.includes(category)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
        {selectedCategories.length === 0 && (
          <p className="text-red-500 text-sm mt-1">Επιλέξτε τουλάχιστον μία κατηγορία</p>
        )}
      </div>
      
      {/* Περιεχόμενο */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Περιεχόμενο (Markdown)
        </label>
        <textarea
          id="content"
          name="content"
          required
          defaultValue={post?.content}
          rows={12}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 font-mono"
          placeholder="# Τίτλος άρθρου

Αυτό είναι το περιεχόμενο του άρθρου σε μορφή Markdown..."
        />
      </div>
      
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Ακύρωση
        </button>
        <button
          type="submit"
          disabled={isSubmitting || selectedCategories.length === 0}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Υποβολή...'
            : isEditMode
              ? 'Ενημέρωση'
              : 'Δημιουργία'
          }
        </button>
      </div>
    </form>
  )
}