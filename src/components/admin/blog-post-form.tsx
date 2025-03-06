// src/components/admin/blog-post-form.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Loader2, Save, X, Plus, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import type { BlogPost } from '@/types/blog'

interface BlogPostFormProps {
  initialData?: Partial<BlogPost>
  isEditing?: boolean
}

const DEFAULT_POST: Partial<BlogPost> = {
  title: '',
  description: '',
  content: '',
  slug: '',
  date: new Date().toISOString(),
  image: '/blog/placeholder.jpg',
  categories: [],
  author: {
    name: 'Christos Kerigkas',
    image: '/profile.jpg'
  }
}

export default function BlogPostForm({ initialData = {}, isEditing = false }: BlogPostFormProps) {
  const { theme } = useTheme()
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<BlogPost>>({ ...DEFAULT_POST, ...initialData })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [newCategory, setNewCategory] = useState('')

  // Generate slug from title
  useEffect(() => {
    if (!formData.title || (isEditing && initialData.slug)) return
    
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    
    setFormData(prev => ({ ...prev, slug }))
  }, [formData.title, isEditing, initialData.slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    
    try {
      // Validate required fields
      if (!formData.title || !formData.slug || !formData.content) {
        throw new Error('Title, slug and content are required fields')
      }
      
      const method = isEditing ? 'PUT' : 'POST'
      const url = isEditing ? `/api/blog/${initialData.slug}` : '/api/blog'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to save post')
      }
      
      setStatus('success')
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin')
        router.refresh()
      }, 1000)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAddCategory = () => {
    if (!newCategory.trim()) return
    if (formData.categories?.includes(newCategory.trim())) return
    
    setFormData({
      ...formData,
      categories: [...(formData.categories || []), newCategory.trim()]
    })
    setNewCategory('')
  }

  const handleRemoveCategory = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories?.filter(c => c !== category) || []
    })
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-1 p-2 rounded-md",
                theme === 'dark' 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
            
            <h1 className={cn(
              "text-2xl font-bold",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
          </div>
          
          <button
            type="submit"
            form="blog-post-form"
            disabled={status === 'loading'}
            className={cn(
              "flex items-center gap-1 px-4 py-2 rounded-md text-white",
              status === 'loading' 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500'
            )}
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : status === 'success' ? (
              <>
                <Save className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Post
              </>
            )}
          </button>
        </div>
        
        {status === 'error' && (
          <div className={cn(
            "p-4 rounded-md mb-6",
            theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600'
          )}>
            {errorMessage}
          </div>
        )}
        
        <form id="blog-post-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label 
                htmlFor="title" 
                className={cn(
                  "block text-sm font-medium mb-1",
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title || ''}
                onChange={handleChange}
                className={cn(
                  "w-full px-3 py-2 border rounded-md",
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                )}
                required
              />
            </div>
            
            <div>
              <label 
                htmlFor="slug" 
                className={cn(
                  "block text-sm font-medium mb-1",
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                Slug *
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                value={formData.slug || ''}
                onChange={handleChange}
                className={cn(
                  "w-full px-3 py-2 border rounded-md",
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                )}
                required
              />
            </div>
            
            <div>
              <label 
                htmlFor="date" 
                className={cn(
                  "block text-sm font-medium mb-1",
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                Date *
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
                  setFormData({ ...formData, date })
                }}
                className={cn(
                  "w-full px-3 py-2 border rounded-md",
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                )}
                required
              />
            </div>
            
            <div>
              <label 
                htmlFor="image" 
                className={cn(
                  "block text-sm font-medium mb-1",
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                Image URL
              </label>
              <input
                id="image"
                name="image"
                type="text"
                value={formData.image || ''}
                onChange={handleChange}
                className={cn(
                  "w-full px-3 py-2 border rounded-md",
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                )}
              />
            </div>
          </div>
          
          <div>
            <label 
              htmlFor="description" 
              className={cn(
                "block text-sm font-medium mb-1",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              value={formData.description || ''}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 border rounded-md",
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
              )}
              required
            />
          </div>
          
          <div>
            <label 
              htmlFor="categories" 
              className={cn(
                "block text-sm font-medium mb-1",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Categories
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.categories && formData.categories.length > 0 ? (
                formData.categories.map((category, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 text-sm rounded-md",
                      theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(category)}
                      className={theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              ) : (
                <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                  No categories added
                </span>
              )}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add a category"
                className={cn(
                  "flex-1 px-3 py-2 border rounded-l-md",
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCategory()
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className={cn(
                  "px-3 py-2 rounded-r-md",
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                )}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div>
            <label 
              htmlFor="content" 
              className={cn(
                "block text-sm font-medium mb-1",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Content (Markdown) *
            </label>
            <textarea
              id="content"
              name="content"
              rows={15}
              value={formData.content || ''}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 border rounded-md font-mono",
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
              )}
              required
            />
            <p className={cn(
              "mt-1 text-xs",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}>
              Markdown syntax is supported. You can use headers, lists, code blocks, etc.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}