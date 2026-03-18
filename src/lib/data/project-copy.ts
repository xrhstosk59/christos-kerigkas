type ProjectCopyOverride = {
  title?: string;
  description?: string;
};

const PROJECT_COPY_OVERRIDES: Record<string, ProjectCopyOverride> = {
  'travel-planner': {
    title: "Travel Planner - AI-Powered Travel Platform (Bachelor's Thesis)",
    description:
      'Intelligent trip planning application with itinerary management, budget tracking, and destination recommendations.',
  },
  'bluewave-properties': {
    description:
      'Modern real estate platform featuring property listings, virtual tours, and client management.',
  },
  'wait-less': {
    description:
      'Smart queue management system designed to optimize wait times for businesses and improve customer experience.',
  },
  'grade-calc': {
    description:
      'Academic productivity tool for students to calculate and track their grades throughout the semester.',
  },
  'zoo': {
    description:
      'Comprehensive zoo management application with animal tracking, feeding schedules, and visitor management features.',
  },
  'warrior-vs-aliens': {
    description: 'Interactive game built with modern web technologies.',
  },
  'sqlatch': {
    description: 'SQL query builder and database management tool.',
  },
  'smart-trader-bot': {
    description:
      'Automated trading system with market analysis, risk management, and backtesting capabilities.',
  },
  'sniper4crypto': {
    description:
      'Advanced cryptocurrency trading tools with real-time market monitoring and automated execution.',
  },
};

export function applyProjectCopyOverrides<T extends { slug: string; title: string; description: string }>(
  project: T
): T {
  const overrides = PROJECT_COPY_OVERRIDES[project.slug];

  if (!overrides) {
    return project;
  }

  return {
    ...project,
    ...overrides,
  };
}
