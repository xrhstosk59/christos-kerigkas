// src/app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/providers/theme-provider'
import { useAuth } from '@/components/providers/auth-provider'
import Link from 'next/link'
import { 
  Layout, 
  Plus, 
  LogOut, 
  Edit, 
  Trash2,
  ChevronLeft,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import type { BlogPost } from '@/types/blog'

export default function AdminDashboard() {
  const { theme } = useTheme()
  const { user, signOut } = useAuth()
  // Αφαιρούμε την αχρησιμοποίητη μεταβλητή router
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/blog?page=1&limit=100')
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts')
      }
      
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
      console.error('Error fetching blog posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleDeletePost = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    try {
      setDeleteId(slug)
      setDeleteLoading(true)
      
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete post')
      }
      
      // Refresh the post list
      fetchPosts()
    } catch (err) {
      alert('Error deleting post: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setDeleteLoading(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <nav className={cn(
          "flex items-center justify-between py-4 border-b mb-8",
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        )}>
          <div className="flex items-center space-x-4">
            <Layout className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
            <h1 className={cn(
              "text-xl font-bold",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Admin Dashboard
            </h1>
            {user && (
              <span className={cn(
                "text-sm px-2 py-1 rounded-md",
                theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
              )}>
                {user.email}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-md text-sm",
                theme === 'dark' 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              View Site
            </Link>
            
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-md text-sm",
                theme === 'dark' 
                  ? 'text-red-400 hover:text-red-300 hover:bg-gray-800' 
                  : 'text-red-600 hover:text-red-500 hover:bg-gray-100'
              )}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>
        
        <div className="mb-8 flex justify-between items-center">
          <h2 className={cn(
            "text-2xl font-bold",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Blog Posts
          </h2>
          
          <Link
            href="/admin/post/new"
            className={cn(
              "flex items-center gap-1 px-4 py-2 rounded-md text-white",
              "bg-indigo-600 hover:bg-indigo-500 transition-colors"
            )}
          >
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : error ? (
          <div className={cn(
            "p-4 rounded-md mb-6",
            theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600'
          )}>
            {error}
          </div>
        ) : (
          <div className={cn(
            "border rounded-lg overflow-hidden",
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          )}>
            <table className="w-full">
              <thead className={cn(
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
              )}>
                <tr>
                  <th className={cn(
                    "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    Title
                  </th>
                  <th className={cn(
                    "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    Date
                  </th>
                  <th className={cn(
                    "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    Categories
                  </th>
                  <th className={cn(
                    "px-6 py-3 text-right text-xs font-medium uppercase tracking-wider",
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
                {posts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className={cn(
                        "px-6 py-4 text-center",
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      )}
                    >
                      No blog posts found. Create your first post!
                    </td>
                  </tr>
                ) : (
                  posts.map((post, index) => (
                    <tr 
                      key={post.slug}
                      className={cn(
                        index !== posts.length - 1 && (
                          theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'
                        )
                      )}
                    >
                      <td className={cn(
                        "px-6 py-4 whitespace-nowrap text-sm font-medium",
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="hover:underline"
                          target="_blank"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className={cn(
                        "px-6 py-4 whitespace-nowrap text-sm",
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      )}>
                        {new Date(post.date).toLocaleDateString()}
                      </td>
                      <td className={cn(
                        "px-6 py-4 whitespace-nowrap text-sm",
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      )}>
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {(post.categories || []).map((category, i) => (
                            <span
                              key={i}
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                theme === 'dark' 
                                  ? 'bg-gray-700 text-gray-300' 
                                  : 'bg-gray-100 text-gray-800'
                              )}
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/post/edit/${post.slug}`}
                            className={cn(
                              "p-1 rounded-md",
                              theme === 'dark' 
                                ? 'text-indigo-400 hover:text-indigo-300 hover:bg-gray-700' 
                                : 'text-indigo-600 hover:text-indigo-500 hover:bg-gray-100'
                            )}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                          
                          <button
                            onClick={() => handleDeletePost(post.slug)}
                            disabled={deleteLoading && deleteId === post.slug}
                            className={cn(
                              "p-1 rounded-md",
                              theme === 'dark' 
                                ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' 
                                : 'text-red-600 hover:text-red-500 hover:bg-gray-100',
                              (deleteLoading && deleteId === post.slug) && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            {deleteLoading && deleteId === post.slug ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}