import type { Database } from '@/lib/db/database.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

type ProjectCopyOverride = Partial<
  Pick<
    ProjectRow,
    'title' | 'description' | 'categories' | 'tech' | 'github' | 'image' | 'featured' | 'status'
  >
>;

function createPlaceholderImage(label: string, background: string, foreground = 'f8fafc') {
  return `https://placehold.co/1200x675/${background}/${foreground}?text=${encodeURIComponent(label)}`;
}

const PROJECT_COPY_OVERRIDES: Record<string, ProjectCopyOverride> = {
  'travel-planner': {
    title: 'Travel Planner - Community-Driven Travel Platform',
    description:
      'Full-stack travel platform where locals share authentic recommendations and travelers generate AI-powered itineraries with Gemini, Supabase, and an interactive Mapbox globe.',
    tech: ['Next.js', 'TypeScript', 'Supabase', 'Google Gemini AI', 'Mapbox', 'Tailwind CSS'],
  },
  'bluewave-properties': {
    title: 'Bluewave Properties - Real Estate Platform',
    description:
      'Modern real estate platform for listings, discovery, and property workflows, built with Next.js 15, TypeScript, Supabase, NextAuth.js, and a production-focused frontend architecture.',
    tech: ['Next.js', 'TypeScript', 'Supabase', 'NextAuth.js', 'Tailwind CSS', 'Sentry'],
  },
  'wait-less': {
    title: 'Wait-Less - Queue Management Platform',
    description:
      'Queue management system for restaurants with a React Native customer app, React admin dashboard, and Node.js backend on Supabase for realtime waiting-list operations.',
    tech: ['React Native', 'React', 'Node.js', 'Supabase', 'Firebase', 'Material UI'],
  },
  'grade-calc': {
    title: 'Vathmos - AI-Powered Grade Management System',
    description:
      'Greek university grade management platform with analytics, GPA tracking, DUTH-focused workflows, offline-friendly UX, and AI-assisted academic insights.',
    tech: ['Next.js', 'TypeScript', 'Supabase', 'Recharts', 'Tailwind CSS', 'PWA'],
  },
  'zoo': {
    title: 'Zoo Management System',
    description:
      'Web-based zoo management system with CRUD workflows for animals, staff, tickets, events, and suppliers, built with PHP, MySQL, and vanilla JavaScript.',
    tech: ['PHP', 'MySQL', 'JavaScript', 'HTML5', 'CSS3'],
  },
  'warrior-vs-aliens': {
    title: 'Warrior vs Aliens',
    description:
      'Java console game implementing Strategy and Observer patterns, focused on turn-based combat logic, object-oriented design, and gameplay flow.',
    tech: ['Java', 'OOP', 'Strategy Pattern', 'Observer Pattern'],
  },
  'sqlatch': {
    title: 'SQLatch - Visual SQL Learning Platform',
    description:
      'Browser-based educational platform that teaches SQL through Blockly drag-and-drop blocks, instant feedback, and in-browser SQLite WASM execution.',
    tech: ['Next.js', 'TypeScript', 'Blockly', 'SQLite WASM', 'React'],
  },
  'smart-trader-bot': {
    title: 'Smart Trader Bot',
    description:
      'Cryptocurrency trading dashboard and bot with configurable strategies, risk management, backtesting, and realtime market monitoring through the Bybit API.',
    tech: ['Next.js', 'TypeScript', 'Bybit API', 'WebSocket', 'Chart.js', 'Recharts'],
  },
  'sniper4crypto': {
    title: 'Sniper4Crypto',
    description:
      'Python-based crypto monitoring tool that organizes token, DEX, and social-signal integrations for automated market tracking workflows.',
    tech: ['Python', 'Telegram API', 'Twitter API', 'DEX APIs'],
  },
};

const SUPPLEMENTAL_PROJECTS: ProjectRow[] = [
  {
    id: -1,
    slug: 'car-station',
    title: 'Car Station - JavaFX Service Management App',
    description:
      'JavaFX desktop application for a car service station with customer, staff, and admin workflows backed by a local SQLite database and Maven-based structure.',
    short_description: 'JavaFX desktop app for service station workflows.',
    categories: ['education', 'portfolio'],
    tech: ['Java', 'JavaFX', 'SQLite', 'Maven', 'JUnit 5'],
    github: 'https://github.com/xrhstosk59/car-station',
    live_url: null,
    image: createPlaceholderImage('Car Station', '0f172a'),
    featured: false,
    status: 'Completed',
    order: 10,
    created_at: null,
    updated_at: null,
  },
  {
    id: -2,
    slug: 'quiz-master',
    title: 'Quiz Master - JavaFX Quiz Application',
    description:
      'Small JavaFX quiz application migrated from a legacy NetBeans/Ant setup into a portable Maven build with FXML views and bundled media assets.',
    short_description: 'JavaFX quiz app modernized into a Maven project.',
    categories: ['education'],
    tech: ['Java', 'JavaFX', 'FXML', 'Maven'],
    github: 'https://github.com/xrhstosk59/java-fx',
    live_url: null,
    image: createPlaceholderImage('Quiz Master', '1d4ed8'),
    featured: false,
    status: 'Completed',
    order: 11,
    created_at: null,
    updated_at: null,
  },
  {
    id: -3,
    slug: 'saas-dashboard-template',
    title: 'SaaS Dashboard Template',
    description:
      'Production-ready SaaS dashboard template with authentication, analytics, file uploads, realtime notifications, and Prisma-powered data flows for rapid business app delivery.',
    short_description: 'Reusable SaaS dashboard starter with auth and realtime features.',
    categories: ['web-development', 'portfolio'],
    tech: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'NextAuth.js', 'Socket.IO'],
    github: 'https://github.com/xrhstosk59/saas-dashboard-template',
    live_url: null,
    image: createPlaceholderImage('SaaS Dashboard', '0f766e'),
    featured: false,
    status: 'Completed',
    order: 12,
    created_at: null,
    updated_at: null,
  },
];

function compareProjects(left: ProjectRow, right: ProjectRow) {
  const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return left.title.localeCompare(right.title);
}

export function applyProjectCopyOverrides<T extends { slug: string }>(project: T): T {
  const overrides = PROJECT_COPY_OVERRIDES[project.slug];

  if (!overrides) {
    return project;
  }

  return {
    ...project,
    ...overrides,
  };
}

export function getSupplementalProjectBySlug(slug: string): ProjectRow | null {
  return SUPPLEMENTAL_PROJECTS.find(project => project.slug === slug) ?? null;
}

export function mergePortfolioProjects(projects: ProjectRow[]): ProjectRow[] {
  const mergedProjects = new Map<string, ProjectRow>();

  for (const project of projects) {
    mergedProjects.set(project.slug, applyProjectCopyOverrides(project));
  }

  for (const project of SUPPLEMENTAL_PROJECTS) {
    if (!mergedProjects.has(project.slug)) {
      mergedProjects.set(project.slug, project);
    }
  }

  return Array.from(mergedProjects.values()).sort(compareProjects);
}
