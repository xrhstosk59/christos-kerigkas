// /src/components/blog/blog-card.tsx
import Image from 'next/image'
import Link from 'next/link'
import { Post } from '@/types/blog'
import { cn } from '@/lib/utils'
import { formatDateWithOptions } from '@/lib/utils'

interface BlogCardProps {
  post: Post
  theme: 'light' | 'dark'
}

// Server Component για το rendering κάθε blog post card
export default function BlogCard({ post, theme }: BlogCardProps) {
  return (
    <Link 
      href={`/blog/${post.slug}`}
      className={cn(
        "block h-full rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg",
        theme === 'dark' 
          ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
          : 'bg-white hover:bg-gray-50 border border-gray-200'
      )}
    >
      <div className="relative aspect-video">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-4">
        <div className="flex space-x-2 mb-2">
          {post.categories && post.categories.map((category: string) => (
            <span
              key={category}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {category}
            </span>
          ))}
        </div>
        
        <h2 className={cn(
          "text-xl font-semibold mb-2 line-clamp-1",
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          {post.title}
        </h2>
        
        <p className={cn(
          "text-sm mb-4 line-clamp-2",
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        )}>
          {post.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
              <Image
                src={post.authorImage || '/placeholder-avatar.jpg'}
                alt={post.authorName}
                fill
                className="object-cover"
              />
            </div>
            <span className={cn(
              "text-sm",
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              {post.authorName}
            </span>
          </div>
          
          <span className={cn(
            "text-xs",
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          )}>
            {formatDateWithOptions(post.date, 'short')}
          </span>
        </div>
      </div>
    </Link>
  )
}