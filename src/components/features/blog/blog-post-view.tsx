'use client';

// /src/components/features/blog/blog-post-view.tsx
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/types/blog';
import { Markdown } from '@/components/common/markdown';
import { useTheme } from '@/components/providers/theme-provider';

interface BlogPostViewProps {
  post: BlogPost;
}

export default function BlogPostView({ post }: BlogPostViewProps) {
  const { theme } = useTheme();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Μορφοποίηση ημερομηνίας
  const formattedDate = new Date(post.date).toLocaleDateString('el-GR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className={`container mx-auto px-4 py-8 max-w-4xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <Link href="/blog" className="flex items-center text-primary mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Επιστροφή στο Blog
      </Link>

      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="space-y-8"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center text-muted-foreground mb-6 gap-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>{post.author?.name || 'Christos Kerigkas'}</span>
            </div>
          </div>
        </motion.div>

        {post.image && (
          <motion.div 
            variants={itemVariants}
            className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full rounded-lg overflow-hidden"
          >
            <Image 
              src={post.image} 
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority
            />
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <div className="flex flex-wrap gap-2 mb-8">
            {post.categories && post.categories.map((category, index) => (
              <div 
                key={`${category}-${index}`}
                className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm flex items-center"
              >
                <Tag className="h-3 w-3 mr-1" />
                {category}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="prose dark:prose-invert max-w-none">
          <Markdown content={post.content} />
        </motion.div>
      </motion.div>
    </div>
  );
}