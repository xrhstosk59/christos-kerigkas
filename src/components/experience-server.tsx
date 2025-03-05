// src/components/experience-server.tsx
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const projects = [
    {
        name: 'Real Estate Platform',
        icon: 'FileCode2',
        description: `
      Full-stack web application for real estate listings featuring dynamic property search,
      user authentication, and responsive design. Implemented with modern web technologies
      and best practices for performance and SEO.
    `,
        keyFeatures: [
            'Dynamic property search with filters',
            'User authentication and profiles',
            'Real-time updates with WebSocket',
            'Responsive design for all devices',
            'SEO optimization and performance metrics'
        ],
        tech: ['Next.js', 'React', 'Supabase', 'Drizzle', 'Tailwind CSS', 'PostgreSQL'],
        status: 'In Development',
        link: 'https://github.com/yourusername/real-estate'
    },
    {
        name: 'Sniper4Crypto',
        icon: 'LineChart',
        description: `
      Advanced crypto analysis tool using data mining and machine learning to detect trending
      meme tokens. Features automated market analysis, social media monitoring, and real-time
      notifications through Telegram.
    `,
        keyFeatures: [
            'Real-time token detection',
            'Social media trend analysis',
            'Machine learning predictions',
            'Automated market analysis',
            'Telegram notifications'
        ],
        tech: ['Python', 'Scikit-learn', 'Telegram Bot API', 'MongoDB', 'PostgreSQL'],
        status: 'Active',
        link: 'https://github.com/yourusername/sniper4crypto'
    },
    {
        name: 'Trading Bot',
        icon: 'Bot',
        description: `
      Automated trading system with comprehensive market analysis, strategy implementation,
      and real-time notifications. Includes backtesting capabilities and risk management
      features.
    `,
        keyFeatures: [
            'Automated trading strategies',
            'Real-time market analysis',
            'Risk management system',
            'Performance analytics',
            'Backtesting framework'
        ],
        tech: ['Python', 'Exchange APIs', 'Telegram Bot API', 'Technical Analysis', 'Data Science'],
        status: 'Active',
        link: 'https://github.com/yourusername/trading-bot'
    }
]

interface ExperienceServerProps {
    theme: 'light' | 'dark'
    renderIcon: (iconName: string) => ReactNode
}

export function ExperienceServer({ theme, renderIcon }: ExperienceServerProps) {
    return (
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h2 className={cn(
                "text-3xl font-bold tracking-tight sm:text-4xl",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
                Experience & Projects
            </h2>

            <div className="mt-16 space-y-8">
                {projects.map((project) => (
                    <article
                        key={project.name}
                        className={cn(
                            "p-6 rounded-lg shadow-sm hover:shadow-md transition-all",
                            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        )}
                    >
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "p-2 rounded-lg",
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                            )}>
                                {renderIcon(project.icon)}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h3 className={cn(
                                        "text-lg font-semibold",
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    )}>
                                        {project.name}
                                    </h3>
                                    <span className={cn(
                                        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                                        project.status === 'Active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-blue-100 text-blue-700'
                                    )}>
                                        {project.status}
                                    </span>
                                </div>

                                <p className={cn(
                                    "mt-2 text-base",
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                )}>
                                    {project.description}
                                </p>

                                <ul className="mt-4 space-y-2">
                                    {project.keyFeatures.map((feature) => (
                                        <li
                                            key={feature}
                                            className={cn(
                                                "flex items-center text-sm",
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                            )}
                                        >
                                            <span className="mr-2">•</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {project.tech.map((tech) => (
                                        <span
                                            key={tech}
                                            className={cn(
                                                "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                                                theme === 'dark'
                                                    ? 'bg-gray-700 text-gray-200'
                                                    : 'bg-gray-100 text-gray-700'
                                            )}
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <a
                                    href={project.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "mt-4 inline-flex items-center text-sm font-medium",
                                        theme === 'dark'
                                            ? 'text-indigo-400 hover:text-indigo-300'
                                            : 'text-indigo-600 hover:text-indigo-500'
                                    )}
                                >
                                    View Project
                                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    )
}