// src/lib/db/index.ts
export * from './database';
export * from './schema';
export * from './utils/mappers';

// Export the db instance for convenience
export { getDb as db } from './database';

// Εξαγωγή των τύπων για ευκολότερη πρόσβαση
import type { 
  BlogPost,
  SelectBlogPost, 
  InsertBlogPost,
  BlogCategory,
  SelectBlogCategory,
  InsertBlogCategory
} from './schema/blog';

import type {
  Certification,
  SelectCertification,
  InsertCertification,
  Skill,
  SelectSkill,
  InsertSkill,
  CertificationType
} from './schema/certifications';

import type {
  Project,
  SelectProject,
  InsertProject,
  ProjectCategory,
  SelectProjectCategory,
  InsertProjectCategory,
  ProjectTechnology,
  SelectProjectTechnology,
  InsertProjectTechnology,
  CryptoProject,
  SelectCryptoProject,
  InsertCryptoProject,
  ProjectStatus
} from './schema/projects';

// Επανεξαγωγή για ευκολία
export type {
  BlogPost,
  SelectBlogPost,
  InsertBlogPost,
  BlogCategory,
  SelectBlogCategory,
  InsertBlogCategory,
  Certification,
  SelectCertification,
  InsertCertification,
  Skill,
  SelectSkill,
  InsertSkill,
  CertificationType,
  Project,
  SelectProject,
  InsertProject,
  ProjectCategory,
  SelectProjectCategory,
  InsertProjectCategory,
  ProjectTechnology,
  SelectProjectTechnology,
  InsertProjectTechnology,
  CryptoProject,
  SelectCryptoProject,
  InsertCryptoProject,
  ProjectStatus
};