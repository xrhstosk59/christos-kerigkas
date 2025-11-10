// src/content/projects.ts
import { Project, CryptoProject } from '@/types/projects';
import { 
  Eye, Bot, LineChart, TrendingUp, BrainCircuit 
} from 'lucide-react';

export const generalProjects: Project[] = [
  {
    title: 'Real Estate Platform',
    slug: 'bluewave-properties',
    description: 'A modern web application for real estate listings built with Next.js, featuring dynamic property search, user authentication, and responsive design.',
    categories: ['web-development', 'real-estate'],
    tech: ['Next.js', 'React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'PostgreSQL'],
    github: 'https://github.com/xrhstosk59/real-estate',
    demo: 'https://real-estate-demo.com',
    image: '/real-estate-preview.jpg',
    featured: true,
    status: 'In Development'
  },
  {
    title: 'Grade Calculator',
    slug: 'grade-calc',
    description: 'An educational tool that helps students calculate their grades and track academic progress. Features custom grading schemes and multiple subject tracking.',
    categories: ['web-development', 'education'],
    tech: ['React', 'JavaScript', 'CSS', 'LocalStorage'],
    github: 'https://github.com/xrhstosk59/grade-calc',
    demo: 'https://grade-calc-demo.com',
    image: '/grade-calc-preview.jpg',
    featured: true,
    status: 'In Development'
  },
  {
    title: 'Travel Planner',
    slug: 'travel-planer',
    description: 'A comprehensive travel planning application that helps users organize trips, find destinations, and create detailed itineraries.',
    categories: ['web-development', 'mobile'],
    tech: ['React Native', 'Redux', 'Node.js', 'MongoDB', 'Google Maps API'],
    github: 'https://github.com/xrhstosk59/travel-planer',
    demo: 'https://travel-planer-demo.com',
    image: '/travel-planer-preview.jpg',
    featured: true,
    status: 'In Development'
  },
  {
    title: 'SQLatch',
    slug: 'sqlatch-main',
    description: 'A SQL query builder and database management tool designed to simplify complex queries and database operations for developers and data analysts.',
    categories: ['web-development', 'data-analysis'],
    tech: ['TypeScript', 'Express.js', 'PostgreSQL', 'React', 'Redux'],
    github: 'https://github.com/xrhstosk59/sqlatch-main',
    demo: 'https://sqlatch-demo.com',
    image: '/sqlatch-preview.jpg',
    featured: true,
    status: 'In Development'
  },
  {
    title: 'Zoo Management System',
    slug: 'zwologikos-khpos',
    description: 'A comprehensive management system for zoos, featuring animal tracking, feeding schedules, health records, and visitor management.',
    categories: ['web-development', 'animals'],
    tech: ['Laravel', 'PHP', 'MySQL', 'Bootstrap', 'jQuery'],
    github: 'https://github.com/xrhstosk59/zwologikos-khpos',
    demo: 'https://zwologikos-khpos-demo.com',
    image: '/zoo-preview.jpg',
    featured: true,
    status: 'In Development'
  },
  {
    title: 'Personal Portfolio',
    slug: 'christos-kerigkas',
    description: 'My personal portfolio website built with Next.js, showcasing my projects, skills, and professional experience in a clean, modern design.',
    categories: ['web-development', 'portfolio'],
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Supabase'],
    github: 'https://github.com/xrhstosk59/christos-kerigkas',
    demo: 'https://christos-kerigkas.com',
    image: '/portfolio-preview.jpg',
    featured: false,
    status: 'In Development'
  }
];

export const cryptoProjects: CryptoProject[] = [
  {
    title: 'Sniper4Crypto',
    slug: 'sniper4crypto',
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
    github: 'https://github.com/xrhstosk59/sniper4crypto',
    status: 'In Development'
  },
  {
    title: 'Smart Trading Bot',
    slug: 'smart-trader-bot',
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
    github: 'https://github.com/xrhstosk59/trading-bot',
    status: 'In Development'
  },
  {
    title: 'Market Analyzer',
    slug: 'market-analyzer',
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
    github: 'https://github.com/xrhstosk59/market-analyzer',
    status: 'In Development'
  },
  {
    title: 'Crypto Portfolio Manager',
    slug: 'crypto-portfolio',
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
    github: 'https://github.com/xrhstosk59/crypto-portfolio',
    status: 'In Development'
  },
  {
    title: 'AI Trading Predictor',
    slug: 'ai-trading-predictor',
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
    github: 'https://github.com/xrhstosk59/ai-trading-predictor',
    status: 'In Development'
  }
];

// Φιλτράρουμε τα crypto projects για να κρατήσουμε μόνο αυτά που υπάρχουν στη λίστα των έργων μας
export const filteredCryptoProjects = cryptoProjects.filter(project => 
  ['sniper4crypto', 'smart-trader-bot'].includes(project.slug)
);

// Επιλογή των featured projects για την αρχική σελίδα
export const featuredProjects = generalProjects.filter(project => 
  project.featured || ['bluewave-properties', 'smart-trader-bot', 'sniper4crypto'].includes(project.slug)
);