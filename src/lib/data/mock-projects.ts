// src/lib/data/mock-projects.ts
import { Project, CryptoProject } from '@/types/projects';
import { Bitcoin, LineChart, Network, Code, RefreshCw } from 'lucide-react';

// Real projects from my portfolio
export const studentProjects: Project[] = [
  {
    title: "Travel Planner - AI-Powered Travel Platform",
    slug: "travel-planner",
    description: "Bachelor's Thesis project (In Development) - Community-driven travel platform where locals share knowledge to earn points, and travelers use those points to generate AI-powered personalized trip plans. Features 3D interactive globe with rotating Earth showing contribution pins, points economy system, and real-time updates with Supabase.",
    categories: ["web-development", "ai", "travel"],
    tech: ["Next.js 15", "TypeScript", "Google Gemini AI", "Stripe", "Supabase", "Globe.gl", "PostgreSQL"],
    image: "/uploads/projects/travel-planner.jpg",
    featured: true,
    status: "In Development"
  },
  {
    title: "Bluewave Properties - Real Estate Platform",
    slug: "bluewave-properties",
    description: "Full-stack real estate platform with advanced property search and filtering capabilities, real-time updates, and optimized performance using Next.js Server Components. Features authentication system with NextAuth.js, role-based access control, and optimistic UI updates for enhanced user experience.",
    categories: ["web-development", "real-estate"],
    tech: ["Next.js 15", "TypeScript", "Supabase", "NextAuth.js", "PostgreSQL", "Tailwind CSS", "Sentry"],
    image: "/uploads/projects/bluewave-properties.jpg",
    featured: true,
    status: "In Development"
  },
  {
    title: "Wait-Less - Restaurant Queue Management",
    slug: "wait-less",
    description: "Cross-platform mobile application for iOS and Android built with React Native. Features real-time queue updates using Supabase Realtime, push notifications via Firebase, comprehensive admin dashboard for restaurant analytics and queue management. Monorepo structure with backend, admin panel, and mobile app.",
    categories: ["mobile", "business"],
    tech: ["React Native", "Node.js", "Supabase", "Firebase", "Expo", "TypeScript", "Docker"],
    image: "/uploads/projects/wait-less.jpg",
    featured: true,
    status: "In Development"
  },
  {
    title: "Grade-Calc - University Grade Calculator",
    slug: "grade-calc",
    description: "Progressive Web App (PWA) designed for university students to track and calculate their grades. Features offline capabilities, AI-powered grade predictions, gamification system with achievements, interactive analytics dashboard, and comprehensive testing with Vitest and Playwright.",
    categories: ["web-development", "education", "pwa"],
    tech: ["Next.js 15", "TypeScript", "PWA", "AI/ML", "Chart.js", "Tailwind CSS", "Supabase"],
    image: "/uploads/projects/grade-calc.jpg",
    featured: true,
    status: "In Development"
  },
  {
    title: "Smart Trader Bot - Crypto Trading Automation",
    slug: "smart-trader-bot",
    description: "Automated cryptocurrency trading bot with intelligent algorithms for market analysis and trade execution. Built with Next.js for the dashboard interface and real-time monitoring capabilities.",
    categories: ["web-development", "crypto", "trading"],
    tech: ["Next.js", "TypeScript", "Trading APIs", "Real-time Data", "Tailwind CSS"],
    image: "/uploads/projects/smart-trader-bot.jpg",
    status: "In Development"
  },
  {
    title: "Sniper4Crypto - Crypto Sniping Tool",
    slug: "sniper4crypto",
    description: "Advanced cryptocurrency sniping tool for identifying and executing rapid trades on new token launches. Python-based system with real-time blockchain monitoring and automated execution.",
    categories: ["crypto", "trading", "automation"],
    tech: ["Python", "Web3", "Blockchain APIs", "Real-time Monitoring"],
    image: "/uploads/projects/sniper4crypto.jpg",
    status: "In Development"
  },
  {
    title: "Zwologikos Khpos - Zoo Management System",
    slug: "zwologikos-khpos",
    description: "Database management system for zoo operations including visitor management, ticket sales, species tracking, and supplier management. Full-stack application with PHP backend and MySQL database. University project for Database Systems course.",
    categories: ["web-development", "database"],
    tech: ["PHP", "MySQL", "JavaScript", "HTML/CSS"],
    image: "/uploads/projects/zoo.jpg",
    status: "Completed"
  },
  {
    title: "SQLatch - Database Learning Tool",
    slug: "sqlatch",
    description: "Educational platform for learning SQL and database concepts. Interactive tutorials and exercises help students master database design and query optimization. University project for Database Systems course.",
    categories: ["web-development", "education"],
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    image: "/uploads/projects/sqlatch.jpg",
    status: "In Development"
  }
];

// Mock projects για crypto & trading
export const filteredCryptoProjects: CryptoProject[] = [
  {
    title: "Crypto Trading Bot",
    slug: "crypto-trading-bot",
    description: "Αυτοματοποιημένο σύστημα συναλλαγών κρυπτονομισμάτων που χρησιμοποιεί αλγόριθμους ML για να εντοπίζει και να εκτελεί συναλλαγές με βάση παραμέτρους που ορίζονται από τον χρήστη.",
    tech: ["Python", "TensorFlow", "Binance API", "Docker", "MongoDB"],
    features: [
      "Ανάλυση τεχνικών δεικτών σε πραγματικό χρόνο",
      "Backtesting με ιστορικά δεδομένα",
      "Αυτόματη εκτέλεση συναλλαγών",
      "Διαχείριση κινδύνου και ρυθμιζόμενα stop-loss",
      "Web dashboard για παρακολούθηση απόδοσης"
    ],
    github: "https://github.com/christoskerigkas/crypto-trading-bot",
    status: "Active",
    icon: Bitcoin
  },
  {
    title: "Market Sentiment Analyzer",
    slug: "market-sentiment-analyzer",
    description: "Εργαλείο ανάλυσης κοινωνικών μέσων που παρακολουθεί το Twitter, Reddit και άλλες πλατφόρμες για να μετρήσει το συναίσθημα της αγοράς σχετικά με συγκεκριμένα κρυπτονομίσματα.",
    tech: ["Python", "NLTK", "Twitter API", "React", "FastAPI"],
    features: [
      "Ανάλυση συναισθημάτων σε δημοσιεύσεις κοινωνικών μέσων",
      "Οπτικοποίηση τάσεων συναισθημάτων με την πάροδο του χρόνου",
      "Συσχέτιση συναισθημάτων με κινήσεις τιμών",
      "Προσαρμοσμένες ειδοποιήσεις για απότομες αλλαγές",
      "Εβδομαδιαίες αναφορές με βασικές πληροφορίες"
    ],
    github: "https://github.com/christoskerigkas/market-sentiment-analyzer",
    status: "Completed",
    icon: LineChart
  },
  {
    title: "DeFi Portfolio Manager",
    slug: "defi-portfolio-manager",
    description: "Web εφαρμογή για τη διαχείριση και παρακολούθηση επενδύσεων DeFi σε πολλαπλά blockchain. Συγκεντρώνει όλα τα assets, yields και liquidity pools σε ένα εύχρηστο dashboard.",
    tech: ["Next.js", "Ethers.js", "Web3.js", "TheGraph", "Tailwind CSS"],
    features: [
      "Παρακολούθηση αποδόσεων και φαρμαρισμάτων σε πολλαπλά πρωτόκολλα",
      "Ιστορικά δεδομένα και οπτικοποιήσεις απόδοσης",
      "Ειδοποιήσεις για σημαντικά γεγονότα, όπως λήξη κλειδώματος",
      "Αυτόματος υπολογισμός και βελτιστοποίηση APY",
      "Ενσωμάτωση με MetaMask και άλλα wallets"
    ],
    github: "https://github.com/christoskerigkas/defi-portfolio-manager",
    status: "In Development",
    icon: Network
  },
  {
    title: "Smart Contract Development Framework",
    slug: "smart-contract-development-framework",
    description: "Ολοκληρωμένο πλαίσιο ανάπτυξης, ελέγχου και εξάπλωσης έξυπνων συμβολαίων για Ethereum και συμβατά blockchains με έμφαση στην ασφάλεια και τη βελτιστοποίηση gas.",
    tech: ["Solidity", "Hardhat", "TypeScript", "Waffle", "Ethers.js"],
    features: [
      "Προκαθορισμένα μοτίβα για τύπους συμβολαίων (ERC20, ERC721, κ.λπ.)",
      "Αυτοματοποιημένες δοκιμές ασφάλειας και auditing",
      "Βελτιστοποίηση gas με προηγμένες τεχνικές",
      "Αυτοματοποιημένη ανάπτυξη σε testnet και mainnet",
      "Εκτενής τεκμηρίωση και παραδείγματα χρήσης"
    ],
    github: "https://github.com/christoskerigkas/smart-contract-framework",
    status: "Active",
    icon: Code
  },
  {
    title: "Arbitrage Scanner",
    slug: "arbitrage-scanner",
    description: "Σύστημα που εντοπίζει και εκμεταλλεύεται ευκαιρίες arbitrage μεταξύ διαφορετικών ανταλλακτηρίων κρυπτονομισμάτων σε πραγματικό χρόνο, εστιάζοντας στην ταχύτητα εκτέλεσης και την ελαχιστοποίηση του κινδύνου.",
    tech: ["Rust", "WebSocket APIs", "PostgreSQL", "Redis", "Docker"],
    features: [
      "Παρακολούθηση 20+ ανταλλακτηρίων για διαφορές τιμών",
      "Υπολογισμός κόστους συναλλαγών και κέρδους σε πραγματικό χρόνο",
      "Αυτόματη εκτέλεση συναλλαγών όταν πληρούνται προκαθορισμένα κριτήρια",
      "Εξελιγμένοι αλγόριθμοι δρομολόγησης για βέλτιστη εκτέλεση",
      "Λεπτομερής καταγραφή και αναφορές απόδοσης"
    ],
    github: "https://github.com/christoskerigkas/arbitrage-scanner",
    status: "Completed",
    icon: RefreshCw
  }
];