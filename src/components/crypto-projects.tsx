// src/components/crypto-projects.tsx
'use client'

import { useTheme } from './themeprovider'
import { motion } from 'framer-motion'
import { LineChart, Cpu, Bot, TrendingUp, Eye, BrainCircuit } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const cryptoProjects = [
  {
    title: 'Sniper4Crypto',
    icon: Eye,
    description: 'Advanced crypto token detection tool using data mining and machine learning to identify trending meme tokens before they gain mainstream attention.',
    features: [
      'Real-time token detection on DEX platforms',
      'Social media trend analysis integration',
      'Machine learning-based price prediction',
      'Automated buy/sell signal generation',
      'Telegram notifications with detailed metrics'
    ],
    tech: ['Python', 'TensorFlow', 'MongoDB', 'Telegram API', 'Web3.py', 'Data Mining'],
    github: 'https://github.com/yourusername/sniper4crypto',
    status: 'Active Development'
  },
  {
    title: 'Smart Trading Bot',
    icon: Bot,
    description: 'Fully automated trading system with comprehensive market analysis, multi-timeframe strategy implementation, and risk management features.',
    features: [
      'Multiple configurable trading strategies',
      'Custom technical indicator calculations',
      'Real-time market data analysis',
      'Position sizing and risk management',
      'Performance analytics dashboard'
    ],
    tech: ['Python', 'CCXT', 'PostgreSQL', 'RESTful APIs', 'Technical Analysis', 'Statistics'],
    github: 'https://github.com/yourusername/trading-bot',
    status: 'Production'
  },
  {
    title: 'Market Analyzer',
    icon: LineChart,
    description: 'Data-driven market analysis tool that processes historical cryptocurrency data to identify patterns and generate trading opportunities.',
    features: [
      'Historical data backtesting framework',
      'Custom indicator development environment',
      'Statistical analysis of market conditions',
      'Correlation finder between assets',
      'CSV/JSON export for further analysis'
    ],
    tech: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn', 'Jupyter'],
    github: 'https://github.com/yourusername/market-analyzer',
    status: 'Beta'
  },
  {
    title: 'Crypto Portfolio Manager',
    icon: TrendingUp,
    description: 'Full-featured portfolio management application for cryptocurrency investors to track, analyze, and optimize their holdings across exchanges.',
    features: [
      'Multi-exchange API integration',
      'Portfolio performance tracking',
      'Tax reporting and transaction history',
      'Rebalancing recommendations',
      'Mobile-responsive web dashboard'
    ],
    tech: ['Next.js', 'TypeScript', 'Supabase', 'Chart.js', 'CCXT', 'TailwindCSS'],
    github: 'https://github.com/yourusername/crypto-portfolio',
    status: 'Concept'
  },
  {
    title: 'AI Trading Predictor',
    icon: BrainCircuit,
    description: 'Experimental project using deep learning and neural networks to predict short-term price movements in major cryptocurrency pairs.',
    features: [
      'LSTM neural network implementation',
      'Multiple timeframe prediction models',
      'Feature engineering pipeline',
      'Accuracy and error measurement',
      'Model persistence and versioning'
    ],
    tech: ['Python', 'TensorFlow', 'Keras', 'Scikit-learn', 'PyTorch', 'Pandas'],
    github: 'https://github.com/yourusername/ai-trading-predictor',
    status: 'Research'
  }
]

export function CryptoProjects() {
  const { theme } = useTheme()
  
  return (
    <section 
      id="crypto-projects" 
      className={cn(
        "py-24",
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      )}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl lg:max-w-5xl"
        >
          <h2 className={cn(
            "text-3xl font-bold tracking-tight sm:text-4xl text-center mb-4",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Crypto & Trading Projects
          </h2>
          
          <p className={cn(
            "text-center max-w-3xl mx-auto mb-16",
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            Combining my passion for programming with financial markets to create automated 
            trading systems, market analysis tools, and cryptocurrency applications.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cryptoProjects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "h-full flex flex-col transition-all duration-200 hover:shadow-md",
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
                )}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "p-2 rounded-lg",
                        theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
                      )}>
                        <project.icon className={cn(
                          "w-5 h-5",
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                        )} />
                      </div>
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded",
                        project.status === 'Production' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : project.status === 'Active Development'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : project.status === 'Beta'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      )}>
                        {project.status}
                      </span>
                    </div>
                    <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {project.title}
                    </CardTitle>
                    <CardDescription className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className={cn(
                      "text-sm font-medium mb-2",
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    )}>
                      Key Features:
                    </h4>
                    <ul className="space-y-1 mb-4">
                      {project.features.map((feature, i) => (
                        <li 
                          key={i}
                          className={cn(
                            "text-sm flex items-start",
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          )}
                        >
                          <span className="mr-2 mt-0.5">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className={cn(
                            "inline-flex items-center text-xs font-medium rounded-full px-2.5 py-0.5",
                            theme === 'dark' 
                              ? 'bg-gray-700 text-gray-200' 
                              : 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto pt-4">
                    <a 
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button 
                        variant={theme === 'dark' ? 'outline' : 'default'} 
                        className="w-full"
                      >
                        <Cpu className="mr-2 h-4 w-4" />
                        View Project
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}