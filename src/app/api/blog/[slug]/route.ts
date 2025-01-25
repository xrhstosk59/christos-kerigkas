// src/app/api/blog/[slug]/route.ts
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { BlogPost } from '@/types/blog'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
): Promise<NextResponse> {
  try {
    const filePath = path.join(process.cwd(), 'src/content/posts', `${params.slug}.json`)
    const content = await fs.readFile(filePath, 'utf8')
    const post = JSON.parse(content) as BlogPost

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { message: 'Post not found' },
      { status: 404 }
    )
  }
}