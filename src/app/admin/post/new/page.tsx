// src/app/admin/post/new/page.tsx
'use client'

import BlogPostForm from '@/components/features/admin/blog-post-form'

export default function NewBlogPostPage() {
  return <BlogPostForm isEditing={false} />
}