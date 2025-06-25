'use client';

import { useState, useEffect } from 'react';
import { Eye, Clock, FileText, TrendingUp } from 'lucide-react';
import { formatViewCount, formatReadingTime } from '@/lib/utils/blog-utils';

interface BlogStatistics {
  totalPublishedPosts: number;
  totalViews: number;
  avgReadingTime: number;
}

interface PopularPost {
  slug: string;
  title: string;
  views: number;
  readingTime: number;
  date: string;
}

interface BlogStatsResponse {
  statistics: BlogStatistics;
  popularPosts?: PopularPost[];
}

interface BlogStatsProps {
  showPopular?: boolean;
  className?: string;
}

export default function BlogStats({ showPopular = false, className = '' }: BlogStatsProps) {
  const [stats, setStats] = useState<BlogStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/blog/statistics');
        if (!response.ok) {
          throw new Error('Failed to fetch blog statistics');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">
          {error || 'Unable to load blog statistics'}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.statistics.totalPublishedPosts}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Published Posts</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatViewCount(stats.statistics.totalViews)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatReadingTime(stats.statistics.avgReadingTime)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Reading Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Posts (Admin Only) */}
      {showPopular && stats.popularPosts && stats.popularPosts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Most Popular Posts
            </h3>
          </div>
          
          <div className="space-y-3">
            {stats.popularPosts.map((post, index) => (
              <div 
                key={post.slug}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      #{index + 1}
                    </span>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {post.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatViewCount(post.views)} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatReadingTime(post.readingTime)}
                    </span>
                    <span>
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <a 
                  href={`/blog/${post.slug}`}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-3"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}