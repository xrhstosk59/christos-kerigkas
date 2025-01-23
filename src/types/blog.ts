// src/types/blog.ts
export type BlogPost = {
    slug: string
    title: string
    description: string
    date: string
    image: string
    author: {
      name: string
      image: string
    }
    categories: string[]
    content: string
  }