// src/app/admin/posts/new/page.tsx
'use client'

import BlogPostForm from '@/components/admin/blog-post-form'

export default function NewBlogPostPage() {
  return <BlogPostForm isEditing={false} />
}