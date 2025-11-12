// src/components/common/dynamic-components.tsx
'use client';

import dynamic from 'next/dynamic';
import {
  ProjectCardSkeleton,
  DashboardSkeleton,
  CVSkeleton,
  CertificationCardSkeleton
} from '@/components/ui/skeleton';

// Trading Dashboard Components
export const TradingDashboard = dynamic(
  () => import('@/components/features/trading/trading-dashboard'),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false, // Heavy charts and real-time data
  }
);

// CV Components
export const InteractiveCV = dynamic(
  () => import('@/components/features/cv/interactive-cv'),
  {
    loading: () => <CVSkeleton />,
    ssr: true, // Important for SEO and initial load
  }
);

export const CVExport = dynamic(
  () => import('@/components/features/cv/cv-export'),
  {
    loading: () => <div>Loading PDF generator...</div>,
    ssr: false, // PDF generation is client-only
  }
);

export const CVSkillsChart = dynamic(
  () => import('@/components/features/cv/cv-skills-chart'),
  {
    loading: () => <div>Loading charts...</div>,
    ssr: false, // Charts library
  }
);

// Admin Components
export const AdminNavbar = dynamic(
  () => import('@/components/features/admin/navbar'),
  {
    loading: () => <div>Loading admin navigation...</div>,
    ssr: false,
  }
);

// UserManagement component removed - not implemented yet
// export const UserManagement = dynamic(
//   () => import('@/components/features/admin/user-management'),
//   {
//     loading: () => <DashboardSkeleton />,
//     ssr: false,
//   }
// );

// Contact Form με progressive enhancement
export const ContactForm = dynamic(
  () => import('@/components/features/contact/contact').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="space-y-4 p-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    ),
    ssr: true, // Forms should be SSR for accessibility
  }
);

// Performance Monitor (development only)
export const PerformanceMonitor = dynamic(
  () => import('@/components/client/performance-monitor'),
  {
    loading: () => null,
    ssr: false,
  }
);

// Components removed - not implemented yet
// export const MarkdownEditor = dynamic(
//   () => import('@/components/common/markdown-editor'),
//   {
//     loading: () => <EditorSkeleton />,
//     ssr: false,
//   }
// );

// export const ImageGallery = dynamic(
//   () => import('@/components/common/image-gallery'),
//   {
//     loading: () => (
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//         {Array.from({ length: 6 }).map((_, i) => (
//           <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse" />
//         ))}
//       </div>
//     ),
//     ssr: false,
//   }
// );

// ProjectSearch and AnalyticsDashboard removed - not implemented yet
// export const ProjectSearch = dynamic(
//   () => import('@/components/features/projects/project-search'),
//   {
//     loading: () => <div className="h-10 bg-gray-200 rounded animate-pulse" />,
//     ssr: false,
//   }
// );

// export const AnalyticsDashboard = dynamic(
//   () => import('@/components/features/analytics/analytics-dashboard'),
//   {
//     loading: () => <DashboardSkeleton />,
//     ssr: false, // Charts and real-time data
//   }
// );

// More components removed - not implemented yet
// export const FileUpload = dynamic(
//   () => import('@/components/common/file-upload'),
//   {
//     loading: () => <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />,
//     ssr: false, // File APIs are browser-only
//   }
// );

// export const SocialShare = dynamic(
//   () => import('@/components/common/social-share'),
//   {
//     loading: () => <div className="flex space-x-2">
//       {Array.from({ length: 4 }).map((_, i) => (
//         <div key={i} className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
//       ))}
//     </div>,
//     ssr: false, // Social APIs may not be available on server
//   }
// );

// export const CommentsSection = dynamic(
//   () => import('@/components/common/comments'),
//   {
//     loading: () => <div className="space-y-4">
//       {Array.from({ length: 3 }).map((_, i) => (
//         <div key={i} className="flex space-x-3">
//           <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
//           <div className="flex-1 space-y-2">
//             <div className="h-4 bg-gray-200 rounded animate-pulse" />
//             <div className="h-12 bg-gray-200 rounded animate-pulse" />
//           </div>
//         </div>
//       ))}
//     </div>,
//     ssr: false, // Comments are interactive
//   }
// );

// export const CodeEditor = dynamic(
//   () => import('@/components/common/code-editor'),
//   {
//     loading: () => <EditorSkeleton />,
//     ssr: false, // Monaco/CodeMirror are browser-only
//   }
// );

// export const ThemeSwitcher = dynamic(
//   () => import('@/components/common/theme-switcher'),
//   {
//     loading: () => <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />,
//     ssr: false, // Theme switching requires client-side JS
//   }
// );

// Certifications Display
export const CertificationsList = dynamic(
  () => import('@/components/features/certifications/certification-list'),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CertificationCardSkeleton key={i} />
        ))}
      </div>
    ),
    ssr: true, // Important for SEO
  }
);

// Project Gallery
export const ProjectGallery = dynamic(
  () => import('@/components/features/projects/project-list'),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    ),
    ssr: true, // Important for SEO
  }
);