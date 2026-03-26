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

const DEFAULT_PROJECT_IMAGE =
  'https://glxsayutlvqyajerownj.supabase.co/storage/v1/object/public/project-images/placeholder.svg';

const EXCLUDED_PUBLIC_PROJECT_SLUGS = new Set(['smart-trader-bot', 'sniper4crypto']);

const PROJECT_COPY_OVERRIDES: Record<string, ProjectCopyOverride> = {
  'christos-kerigkas': {
    image: DEFAULT_PROJECT_IMAGE,
  },
  'travel-planner': {
    title: 'Travel Planner - Diploma Thesis Project',
    description:
      'Diploma thesis web application for trip planning, local recommendations, itinerary workflows, and AI-assisted planning features with Mapbox-based interfaces.',
    tech: ['Next.js', 'TypeScript', 'Supabase', 'Google Gemini AI', 'Mapbox', 'Tailwind CSS'],
  },
  'bluewave-properties': {
    title: 'Bluewave Properties',
    description:
      'Practice real estate platform for listings, discovery, and property workflows, developed mainly with an AI-assisted workflow plus manual customization, cleanup, and testing.',
    tech: ['Next.js', 'TypeScript', 'Supabase', 'NextAuth.js', 'Tailwind CSS', 'Sentry'],
  },
  'wait-less': {
    title: 'Wait-Less - Queue Management Platform',
    description:
      'Queue management concept for restaurants with a React Native customer app, React admin dashboard, and Node.js backend on Supabase for realtime waiting-list operations.',
    tech: ['React Native', 'React', 'Node.js', 'Supabase', 'Firebase', 'Material UI'],
  },
  'grade-calc': {
    title: 'Vathmos - Grade Management Project',
    description:
      'Greek university grade management project with GPA tracking, analytics, export flows, and DUTH-focused workflows for student productivity.',
    tech: ['Next.js', 'TypeScript', 'Supabase', 'Recharts', 'Tailwind CSS', 'PWA'],
  },
  'zoo': {
    title: 'Zoo Management System',
    description:
      'University semester web project with CRUD workflows for animals, staff, tickets, events, and suppliers, built with PHP, MySQL, and vanilla JavaScript.',
    tech: ['PHP', 'MySQL', 'JavaScript', 'HTML5', 'CSS3'],
  },
  'warrior-vs-aliens': {
    title: 'Warrior vs Aliens - Java Semester Project',
    description:
      'University Java console game focused on turn-based combat logic, object-oriented design, and the Strategy / Observer design patterns.',
    tech: ['Java', 'OOP', 'Strategy Pattern', 'Observer Pattern'],
  },
  'sqlatch': {
    title: 'SQLatch - University SQL Learning Project',
    description:
      'University SQL learning project that I later improved with maintenance, UI refinements, documentation updates, and AI-assisted tooling.',
    tech: ['Next.js', 'TypeScript', 'Blockly', 'SQLite WASM', 'React'],
  },
};

const SUPPLEMENTAL_PROJECTS: ProjectRow[] = [
  {
    id: -1,
    slug: 'christos-kerigkas',
    title: 'Christos Kerigkas Portfolio',
    description:
      'Personal portfolio and CV website built with Next.js, TypeScript, Tailwind CSS, and Supabase to present projects, certifications, and contact information.',
    short_description: 'Personal portfolio and CV website.',
    categories: ['portfolio', 'web-development'],
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Sentry'],
    github: 'https://github.com/xrhstosk59/christos-kerigkas',
    live_url: 'https://christoskerigkas.com',
    image: DEFAULT_PROJECT_IMAGE,
    featured: true,
    status: 'Completed',
    order: 0,
    created_at: null,
    updated_at: null,
  },
  {
    id: -2,
    slug: 'car-station',
    title: 'Car Station - University JavaFX Semester Project',
    description:
      'University JavaFX semester project for a car service station that I later improved with a Maven-based structure, SQLite-backed workflows, and repository cleanup.',
    short_description: 'University JavaFX desktop project later refined after coursework.',
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
    id: -3,
    slug: 'quiz-master',
    title: 'Quiz Master - JavaFX Quiz Application',
    description:
      'Small JavaFX learning project migrated from a legacy NetBeans/Ant setup into a portable Maven build with FXML views and bundled media assets.',
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
    id: -4,
    slug: 'saas-dashboard-template',
    title: 'SaaS Dashboard Template',
    description:
      'Learning-focused SaaS dashboard template developed with a heavily AI-assisted workflow plus manual customization, cleanup, and local testing.',
    short_description: 'Learning-focused dashboard template with auth and realtime features.',
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
    if (EXCLUDED_PUBLIC_PROJECT_SLUGS.has(project.slug)) {
      continue;
    }

    mergedProjects.set(project.slug, applyProjectCopyOverrides(project));
  }

  for (const project of SUPPLEMENTAL_PROJECTS) {
    if (!mergedProjects.has(project.slug)) {
      mergedProjects.set(project.slug, project);
    }
  }

  return Array.from(mergedProjects.values())
    .filter(project => !EXCLUDED_PUBLIC_PROJECT_SLUGS.has(project.slug))
    .sort(compareProjects);
}
