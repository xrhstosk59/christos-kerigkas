// Generated from the Supabase backup (db_cluster-28-01-2026) — do not edit by hand.
// Storage URLs are rewritten to local /certificates and /images/projects paths.
// Regenerate with: scripts snapshot in git history (generate-content.mjs), or edit
// the sibling curated files instead — this file is plain data.

import type {
  EducationRow,
  ExperienceRow,
  ProjectRow,
  SkillRow,
} from './types';

export const projectRows: ProjectRow[] = [
  {
    "id": 2,
    "title": "Travel Planner - AI-Powered Travel Platform",
    "slug": "travel-planner",
    "description": "Πλατφόρμα σχεδιασμού ταξιδιών με AI trip planner και σύστημα συνδρομών. Υλοποιήθηκε ως πτυχιακή εργασία με σύστημα οικονομίας πόντων για συνεισφέροντες, real-time ενημερώσεις με Supabase, και ολοκληρωμένη διαχείριση πληρωμών μέσω Stripe.",
    "tech": [
      "Next.js 15",
      "TypeScript",
      "Google Gemini AI",
      "Stripe",
      "Supabase",
      "Real-time",
      "PWA"
    ],
    "image": "/images/projects/placeholder.svg",
    "github": "https://github.com/xrhstosk59/travel-planner",
    "live_url": "https://travel-planner.vercel.app",
    "featured": true,
    "status": "In Progress",
    "order": 1,
    "created_at": "2025-11-06 13:02:02.475282+00",
    "updated_at": "2025-11-09 21:12:18.724962+00",
    "short_description": null,
    "categories": []
  },
  {
    "id": 3,
    "title": "Bluewave Properties - Real Estate Platform",
    "slug": "bluewave-properties",
    "description": "Full-stack πλατφόρμα ακινήτων με προηγμένη αναζήτηση/φιλτράρισμα και real-time ενημερώσεις. Χρησιμοποιεί Server Components για βελτιωμένη απόδοση και optimistic UI updates. Ενσωματωμένο σύστημα authentication με NextAuth.js και role-based access control.",
    "tech": [
      "Next.js 15",
      "TypeScript",
      "Supabase",
      "NextAuth.js",
      "Server Components",
      "Real Estate"
    ],
    "image": "/images/projects/placeholder.svg",
    "github": "https://github.com/xrhstosk59/bluewave-properties",
    "live_url": "https://bluewave-properties.vercel.app",
    "featured": true,
    "status": "In Progress",
    "order": 2,
    "created_at": "2025-11-06 13:02:02.475282+00",
    "updated_at": "2025-11-09 21:12:18.724962+00",
    "short_description": null,
    "categories": []
  },
  {
    "id": 7,
    "title": "Zoo Management System",
    "slug": "zoo",
    "description": "Σύστημα διαχείρισης ζωολογικού κήπου με PHP και MySQL. Περιλαμβάνει διαχείριση ειδών ζώων, εισιτηρίων, εκδηλώσεων, επισκεπτών, φροντιστών και προμηθευτών. Full-stack εφαρμογή με database integration και CRUD operations.",
    "tech": [
      "PHP",
      "MySQL",
      "HTML",
      "CSS",
      "JavaScript",
      "Database Design",
      "CRUD Operations"
    ],
    "image": "/images/projects/placeholder.svg",
    "github": "https://github.com/xrhstosk59/zoo",
    "live_url": null,
    "featured": false,
    "status": "Completed",
    "order": 6,
    "created_at": "2025-11-09 20:18:33.72032+00",
    "updated_at": "2025-11-09 21:00:21.967289+00",
    "short_description": null,
    "categories": []
  },
  {
    "id": 5,
    "title": "Grade-Calc - University Grade Calculator",
    "slug": "grade-calc",
    "description": "Progressive Web App με offline capabilities για υπολογισμό βαθμών πανεπιστημίου. AI-powered προβλέψεις βαθμών, gamification σύστημα με achievements, και interactive analytics dashboard για παρακολούθηση προόδου.",
    "tech": [
      "Next.js 15",
      "TypeScript",
      "PWA",
      "AI Features",
      "Analytics",
      "Gamification"
    ],
    "image": "/images/projects/placeholder.svg",
    "github": "https://github.com/xrhstosk59/grade-calc",
    "live_url": "https://grade-calc.vercel.app",
    "featured": true,
    "status": "In Progress",
    "order": 4,
    "created_at": "2025-11-06 13:02:02.475282+00",
    "updated_at": "2025-11-09 21:12:18.724962+00",
    "short_description": null,
    "categories": []
  },
  {
    "id": 8,
    "title": "Smart Trader Bot",
    "slug": "smart-trader-bot",
    "description": "Αυτοματοποιημένο σύστημα trading για κρυπτονομίσματα με Next.js 15 και real-time WebSocket connections. Περιλαμβάνει TradingView charts integration, technical analysis με Recharts, και automated trading strategies. Dashboard για monitoring και configuration.",
    "tech": [
      "Next.js 15",
      "TypeScript",
      "WebSocket",
      "Trading",
      "Crypto",
      "TradingView",
      "Recharts",
      "Chart.js"
    ],
    "image": "/images/projects/placeholder.svg",
    "github": null,
    "live_url": null,
    "featured": false,
    "status": "In Progress",
    "order": 7,
    "created_at": "2025-11-09 20:18:33.72032+00",
    "updated_at": "2025-11-09 21:12:18.724962+00",
    "short_description": null,
    "categories": []
  },
  {
    "id": 4,
    "title": "Wait-Less - Restaurant Queue Management",
    "slug": "wait-less",
    "description": "Cross-platform mobile εφαρμογή για iOS και Android που διαχειρίζεται ουρές εστιατορίων. Real-time ενημερώσεις ουράς με Supabase Realtime, push notifications με Firebase, και admin dashboard για αναλυτικά στοιχεία εστιατορίων.",
    "tech": [
      "React Native",
      "Node.js",
      "Supabase",
      "Firebase",
      "Push Notifications",
      "Mobile"
    ],
    "image": "/images/projects/placeholder.svg",
    "github": "https://github.com/xrhstosk59/wait-less",
    "live_url": null,
    "featured": true,
    "status": "In Progress",
    "order": 3,
    "created_at": "2025-11-06 13:02:02.475282+00",
    "updated_at": "2025-11-09 21:12:18.724962+00",
    "short_description": null,
    "categories": []
  },
  {
    "id": 9,
    "title": "Sniper4Crypto Bot",
    "slug": "sniper4crypto",
    "description": "Python-based cryptocurrency trading bot με automated sniping functionality. Real-time market monitoring, automated buy/sell executions, και comprehensive logging system για trading analytics και debugging.",
    "tech": [
      "Python",
      "Crypto Trading",
      "Automation",
      "Trading Bot",
      "Market Analysis"
    ],
    "image": "/images/projects/placeholder.svg",
    "github": null,
    "live_url": null,
    "featured": false,
    "status": "In Progress",
    "order": 8,
    "created_at": "2025-11-09 20:18:33.72032+00",
    "updated_at": "2025-11-09 21:12:18.724962+00",
    "short_description": null,
    "categories": []
  },
  {
    "id": 10,
    "title": "SQLatch - SQL Learning Platform",
    "slug": "sqlatch",
    "description": "Εκπαιδευτική πλατφόρμα για εκμάθηση SQL με χρήση Blockly visual programming. Drag-and-drop interface για δημιουργία SQL queries, ενσωματωμένο SQLite database engine, και προετοιμασμένα lessons/exercises/scenarios για interactive learning experience.",
    "tech": [
      "Next.js 13",
      "TypeScript",
      "Blockly",
      "SQLite WASM",
      "Education",
      "Visual Programming",
      "Bootstrap"
    ],
    "image": "/images/projects/placeholder.svg",
    "github": "https://github.com/xrhstosk59/SQLatch.git",
    "live_url": null,
    "featured": true,
    "status": "Completed",
    "order": 9,
    "created_at": "2025-11-09 20:18:33.72032+00",
    "updated_at": "2025-11-09 21:00:21.967289+00",
    "short_description": null,
    "categories": []
  },
  {
    "id": 1,
    "title": "Warrior vs Aliens Game",
    "slug": "warrior-vs-aliens",
    "description": "Παιχνίδι μεταξύ πολεμιστή και στρατιάς εξωγήινων με υλοποίηση Design Patterns (Strategy και Observer). Δυναμική επιλογή στρατηγικής επίθεσης, σύστημα παρατήρησης με δορυφόρο και τηλεσκόπιο, και turn-based combat μηχανισμό.",
    "tech": [
      "Java",
      "Design Patterns",
      "Strategy Pattern",
      "Observer Pattern",
      "OOP",
      "Game Development"
    ],
    "image": "/images/projects/placeholder.svg",
    "github": "https://github.com/xrhstosk59/warrior-vs-aliens",
    "live_url": null,
    "featured": false,
    "status": "Completed",
    "order": 5,
    "created_at": "2025-11-06 12:59:09.004938+00",
    "updated_at": "2025-11-09 21:00:21.967289+00",
    "short_description": null,
    "categories": []
  }
];

export const skillRows: SkillRow[] = [
  {
    "id": "d51e69dd-ae49-4e09-b92b-0035547f24d3",
    "name": "JavaScript",
    "category": "Languages & Frameworks",
    "proficiency": 5,
    "display_order": 1,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "71e91c1f-d89f-4390-b8c3-aed4130aa3f5",
    "name": "TypeScript",
    "category": "Languages & Frameworks",
    "proficiency": 5,
    "display_order": 2,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "5eab5a37-5dc7-4482-84d7-30a34c3318a1",
    "name": "React",
    "category": "Languages & Frameworks",
    "proficiency": 5,
    "display_order": 3,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "fafdf319-55db-45f0-9f41-64ff67dd4f4d",
    "name": "Next.js",
    "category": "Languages & Frameworks",
    "proficiency": 5,
    "display_order": 4,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "e747b9de-9fba-4f25-b36e-57b8c77e5741",
    "name": "TailwindCSS",
    "category": "Languages & Frameworks",
    "proficiency": 5,
    "display_order": 5,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "5488ef17-d403-4dac-b27f-ab98cc71e4c8",
    "name": "HTML5",
    "category": "Languages & Frameworks",
    "proficiency": 5,
    "display_order": 6,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "b4ee85fd-e037-4b51-9d2c-7d58b2776f18",
    "name": "CSS3",
    "category": "Languages & Frameworks",
    "proficiency": 5,
    "display_order": 7,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "ca6e359f-4f15-4087-9a02-a04a83fb6972",
    "name": "Node.js",
    "category": "Languages & Frameworks",
    "proficiency": 5,
    "display_order": 8,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "7f2db679-e56c-4435-b7d7-0f4a31944743",
    "name": "React Native",
    "category": "Languages & Frameworks",
    "proficiency": 4,
    "display_order": 9,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "4bc1c6fc-80bb-4383-855b-fea7350fc417",
    "name": "Python",
    "category": "Languages & Frameworks",
    "proficiency": 4,
    "display_order": 10,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "51c99056-b673-4daa-a50a-d18fd837a421",
    "name": "Bootstrap",
    "category": "Languages & Frameworks",
    "proficiency": 4,
    "display_order": 11,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "8dd11e97-cc04-4e43-bf70-bc5ff28c095b",
    "name": "Java",
    "category": "Languages & Frameworks",
    "proficiency": 3,
    "display_order": 12,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "c9336e84-1d5c-4a89-9bad-97178d5c25d0",
    "name": "PHP",
    "category": "Languages & Frameworks",
    "proficiency": 3,
    "display_order": 13,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "4f5d94e4-6e8b-4c93-ab7e-985a831e1ce3",
    "name": "C++",
    "category": "Languages & Frameworks",
    "proficiency": 3,
    "display_order": 14,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "6c88c74d-d08a-48f8-abe6-c1ac76f360b2",
    "name": "JavaFX",
    "category": "Languages & Frameworks",
    "proficiency": 3,
    "display_order": 15,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "2bd0abd0-a74b-4677-81c5-81896317d33d",
    "name": "Framer Motion",
    "category": "Languages & Frameworks",
    "proficiency": 4,
    "display_order": 16,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "2b69c8d8-8e4b-4f72-baef-314175b663ba",
    "name": "Radix UI",
    "category": "Languages & Frameworks",
    "proficiency": 4,
    "display_order": 17,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "959a4153-b6a1-4540-8893-c8f4de732f83",
    "name": "Git",
    "category": "Technologies & Tools",
    "proficiency": 5,
    "display_order": 1,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "99574fe2-817e-40eb-b6d0-f84421768757",
    "name": "PostgreSQL",
    "category": "Technologies & Tools",
    "proficiency": 5,
    "display_order": 2,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "40fceb40-c928-4e80-9225-3c3d2b552911",
    "name": "Supabase",
    "category": "Technologies & Tools",
    "proficiency": 5,
    "display_order": 3,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "c969ee6e-4311-4cf5-88e4-d2ea8913099d",
    "name": "MySQL",
    "category": "Technologies & Tools",
    "proficiency": 4,
    "display_order": 4,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "6f02ca71-100b-4996-bf16-ee7fe002775b",
    "name": "SQLite",
    "category": "Technologies & Tools",
    "proficiency": 4,
    "display_order": 5,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "d99b215e-ff09-41c0-93ad-43d5a33b765d",
    "name": "Firebase",
    "category": "Technologies & Tools",
    "proficiency": 4,
    "display_order": 6,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "58a71d96-6dfb-4fca-a99f-3bc70fc8b06e",
    "name": "Sentry",
    "category": "Technologies & Tools",
    "proficiency": 4,
    "display_order": 7,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "48f98a6e-1374-4759-a917-315c254f1aed",
    "name": "Docker",
    "category": "Technologies & Tools",
    "proficiency": 3,
    "display_order": 8,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "d30610a1-6cd6-4d2a-93d2-fd4cedc3842b",
    "name": "NextAuth.js",
    "category": "Technologies & Tools",
    "proficiency": 4,
    "display_order": 9,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "e80aa0ff-c5ef-4592-93b5-75297e04bc59",
    "name": "Stripe",
    "category": "Technologies & Tools",
    "proficiency": 4,
    "display_order": 11,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "287d15c6-167b-4eca-91cc-6f3fa541f341",
    "name": "Google Gemini AI",
    "category": "Technologies & Tools",
    "proficiency": 4,
    "display_order": 12,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "ed7a8c5f-c58c-4075-813b-9031210977f6",
    "name": "Chart.js",
    "category": "Technologies & Tools",
    "proficiency": 4,
    "display_order": 13,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "9509906e-3324-4dcc-af20-db0c6f16e024",
    "name": "Recharts",
    "category": "Technologies & Tools",
    "proficiency": 4,
    "display_order": 14,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "7f109e2c-24b5-44e5-bf39-54ad0c3a6ee5",
    "name": "TradingView",
    "category": "Technologies & Tools",
    "proficiency": 3,
    "display_order": 15,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "a888107e-963b-46a8-8062-8fcd11a5129e",
    "name": "Three.js",
    "category": "Technologies & Tools",
    "proficiency": 3,
    "display_order": 16,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "648219e3-a66e-4584-9fdc-05c610ad46dc",
    "name": "jsPDF",
    "category": "Technologies & Tools",
    "proficiency": 3,
    "display_order": 17,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "208c870d-06d4-4271-8788-735bc9b68e4a",
    "name": "Blockly",
    "category": "Technologies & Tools",
    "proficiency": 3,
    "display_order": 18,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "20c9c098-5703-4699-b948-32480707321c",
    "name": "WebSocket",
    "category": "Technologies & Tools",
    "proficiency": 4,
    "display_order": 19,
    "icon": null,
    "created_at": "2025-11-14 21:39:16.561531+00",
    "updated_at": "2025-11-14 21:39:16.561531+00"
  },
  {
    "id": "705fb0c0-1f81-45f4-b256-b4bf1527aedc",
    "name": "Drizzle",
    "category": "Technologies & Tools",
    "proficiency": 4,
    "display_order": 10,
    "icon": null,
    "created_at": "2025-11-14 21:42:31.901273+00",
    "updated_at": "2025-11-14 21:42:31.901273+00"
  }
];

export const educationRows: EducationRow[] = [
  {
    "id": "40145e59-b38b-4850-89f3-4ece7285aa17",
    "institution": "Democritus University of Thrace",
    "degree": "Bachelor's Degree",
    "field": "in Computer Science",
    "start_date": "2021-09-01",
    "end_date": null,
    "location": "Kavala, Greece",
    "description": "Currently pursuing a Bachelor's degree in Computer Science with focus on software engineering, web development, and database systems.",
    "gpa": null,
    "achievements": [],
    "display_order": 0,
    "created_at": "2025-11-14 20:50:35.714644+00",
    "updated_at": "2025-11-14 20:50:35.714644+00"
  }
];

export const experienceRows: ExperienceRow[] = [
  {
    "id": "0f69d9c3-fe44-487c-8c16-75be6e74fd64",
    "company": "Municipality of Nea Propontida, Chalkidiki",
    "position": "Technical Support - IT and Communications Department",
    "start_date": "2025-05-01",
    "end_date": "2025-07-31",
    "description": "Part-time technical support position in the IT and Communications Department.",
    "location": "Chalkidiki, Greece",
    "responsibilities": [
      "Operation and management of central and peripheral systems network and all wireless networks.",
      "Maintenance and troubleshooting of the Municipality's IT equipment.",
      "Data security and improvement of usability for the Municipality's websites and databases.",
      "Maintenance and development of web portals and websites.",
      "Active Directory support and administration."
    ],
    "technologies": [
      "Active Directory",
      "Networking",
      "Web Development",
      "Database Management"
    ],
    "achievements": [],
    "company_url": null,
    "display_order": 0,
    "created_at": "2025-11-14 20:50:35.714644+00",
    "updated_at": "2025-11-14 20:50:35.714644+00"
  }
];
