// src/components/projects-server.tsx
import { type ReactNode } from 'react'
import { cn } from "@/lib/utils"

// These would normally come from a CMS or API
const projects = [
 {
   title: 'Real Estate Platform',
   description: 'A modern web application for real estate listings built with Next.js, featuring dynamic property search, user authentication, and responsive design.',
   tech: ['Next.js', 'React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'PostgreSQL'],
   github: 'https://github.com/yourusername/real-estate',
   demo: 'https://real-estate-demo.com',
   image: '/real-estate-preview.jpg'
 },
 {
   title: 'Sniper4Crypto',
   description: 'Advanced crypto analysis tool using data mining and machine learning for detecting trending meme tokens. Features real-time notifications via Telegram.',
   tech: ['Python', 'Scikit-learn', 'MongoDB', 'Telegram API'],
   github: 'https://github.com/yourusername/sniper4crypto',
   demo: 'https://sniper4crypto.com',
   image: '/crypto-preview.jpg'
 },
 {
   title: 'Trading Bot',
   description: 'Automated trading system with market analysis, strategy implementation, and real-time alerts. Includes backtesting and paper trading capabilities.',
   tech: ['Python', 'Exchange APIs', 'Technical Analysis', 'Telegram API'],
   github: 'https://github.com/yourusername/trading-bot',
   demo: 'https://trading-bot-demo.com',
   image: '/trading-preview.jpg'
 }
]

interface ProjectsServerProps {
  theme: 'light' | 'dark';
  renderImage: (src: string, alt: string, index: number) => ReactNode;
  renderTechBadge: (tech: string, theme: 'light' | 'dark') => ReactNode;
  renderProjectLinks: (project: {
    github: string;
    demo: string;
  }, theme: 'light' | 'dark') => ReactNode;
}

export function ProjectsServer({ 
  theme, 
  renderImage, 
  renderTechBadge,
  renderProjectLinks
}: ProjectsServerProps) {
  return (
    <div className="mx-auto max-w-2xl lg:max-w-4xl">
      <h2 className={cn("text-3xl font-bold tracking-tight sm:text-4xl mb-16", 
        theme === 'dark' ? 'text-white' : 'text-gray-900')}
      >
        Featured Projects
      </h2>
      
      <div className="space-y-16">
        {projects.map((project, index) => (
          <div 
            key={project.title} 
            className={cn("flex flex-col lg:flex-row gap-8", 
              index % 2 === 1 ? 'lg:flex-row-reverse' : '')}
          >
            <div className="lg:w-1/2">
              <div className={cn("rounded-lg shadow-lg overflow-hidden aspect-video",
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100')}>
                {renderImage(project.image, project.title, index)}
              </div>
            </div>
            
            <div className="lg:w-1/2 space-y-4">
              <h3 className={cn("text-2xl font-bold",
                theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {project.title}
              </h3>
              
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => renderTechBadge(tech, theme))}
              </div>
              
              <div className="flex gap-4 pt-4">
                {renderProjectLinks(project, theme)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}