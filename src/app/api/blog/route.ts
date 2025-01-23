// src/app/api/blog/route.ts
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { BlogPost } from '@/types/blog'

export async function GET() {
  try {
    const postsDirectory = path.join(process.cwd(), 'src/content/posts')
    const files = await fs.readdir(postsDirectory)
    
    const posts = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(postsDirectory, filename)
        const content = await fs.readFile(filePath, 'utf8')
        const post = JSON.parse(content) as BlogPost
        return post
      })
    )

    // Sort by date descending
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}