// /src/components/experience/index.tsx
import { cn } from '@/lib/utils/utils'
import ExperienceList from './experience-list'

// Σταθερά δεδομένα για τα projects εμπειρίας
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
        status: 'In Development',
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
        status: 'In Development',
        link: 'https://github.com/yourusername/trading-bot'
    }
]

interface ExperienceProps {
  theme: 'light' | 'dark'
}

// Server Component για experience
export default function Experience({ theme }: ExperienceProps) {
  return (
    <div className="mx-auto max-w-2xl lg:max-w-4xl">
      <h2 className={cn(
        "text-3xl font-bold tracking-tight sm:text-4xl",
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      )}>
        Experience & Projects
      </h2>

      {/* Περνάμε τα projects στο client component */}
      <ExperienceList projects={projects} theme={theme} />
    </div>
  )
}