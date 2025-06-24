// src/lib/db/schema/index.ts
// Κεντρικό αρχείο που εξάγει όλα τα schema και τους τύπους

// Εξαγωγή των σχημάτων
export * from './auth';
export * from './blog';
export * from './projects';
export * from './certifications';
export * from './contact';
export * from './rate-limit';
export * from './audit';
export * from './common';

// Εξαγωγή των relations
export {
  projectsRelations,
  projectTechnologiesRelations,
  projectCategoriesRelations,
  projectsToTechRelations,
  projectsToCategoriesRelations
} from './projects';

// Βοηθητικές συναρτήσεις για schema
export { generateSlug, createSlugIndex, createTimestampIndexes } from './common';