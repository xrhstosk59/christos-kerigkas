// src/lib/db/schema/certifications.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  primaryKey,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Certifications table
export const certifications = pgTable('certifications', {
  id: varchar('id', { length: 100 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  issuer: varchar('issuer', { length: 255 }).notNull(),
  issueDate: timestamp('issue_date').notNull(),
  expirationDate: timestamp('expiration_date'),
  credentialId: varchar('credential_id', { length: 100 }),
  credentialUrl: varchar('credential_url', { length: 255 }),
  description: text('description'),
  skills: text('skills').array(),
  // Χρήση varchar αντί για enum για συμβατότητα
  type: varchar('type', { length: 50 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    // Προσθήκη index στον τύπο για γρηγορότερες αναζητήσεις
    typeIdx: index('certifications_type_idx').on(table.type),
    // Προσθήκη index στο featured για γρηγορότερες αναζητήσεις προτεινόμενων
    featuredIdx: index('certifications_featured_idx').on(table.featured),
    // Προσθήκη index στο issuer για αναζητήσεις με βάση τον εκδότη
    issuerIdx: index('certifications_issuer_idx').on(table.issuer),
    // Προσθήκη index στο issue_date για ταξινόμηση με βάση την ημερομηνία
    issueDateIdx: index('certifications_issue_date_idx').on(table.issueDate)
  }
});

// Skills table
export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  category: varchar('category', { length: 50 }).notNull(),
}, (table) => {
  return {
    // Προσθήκη index στο name για γρηγορότερες αναζητήσεις
    nameIdx: uniqueIndex('skills_name_idx').on(table.name),
    // Προσθήκη index στην κατηγορία για φιλτράρισμα με βάση την κατηγορία
    categoryIdx: index('skills_category_idx').on(table.category)
  }
});

// Certification to skill junction table (many-to-many)
export const certificationsToSkills = pgTable('certifications_to_skills', {
  certificationId: varchar('certification_id', { length: 100 })
    .notNull()
    .references(() => certifications.id, { onDelete: 'cascade' }),
  skillId: integer('skill_id')
    .notNull()
    .references(() => skills.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.certificationId, table.skillId] }),
    // Προσθήκη index στο certification_id για γρηγορότερες αναζητήσεις
    certificationIdx: index('certifications_to_skills_certification_idx').on(table.certificationId),
    // Προσθήκη index στο skill_id για γρηγορότερες αναζητήσεις
    skillIdx: index('certifications_to_skills_skill_idx').on(table.skillId)
  }
});

// Ορισμός των σχέσεων
export const certificationsRelations = relations(certifications, ({ many }) => ({
  skills: many(certificationsToSkills)
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  certifications: many(certificationsToSkills)
}));

export const certificationsToSkillsRelations = relations(certificationsToSkills, ({ one }) => ({
  certification: one(certifications, {
    fields: [certificationsToSkills.certificationId],
    references: [certifications.id]
  }),
  skill: one(skills, {
    fields: [certificationsToSkills.skillId],
    references: [skills.id]
  })
}));

// Τύποι για το certification type
export type CertificationType = 'course' | 'certification' | 'degree' | 'award' | 'other' | 'badge' | 'conference' | 'seminar';

// Zod schema για τις πιστοποιήσεις
export const certificationSchema = z.object({
  id: z.string(),
  title: z.string().min(2).max(255),
  issuer: z.string().min(2).max(255),
  issueDate: z.date(),
  expirationDate: z.date().optional().nullable(),
  credentialId: z.string().max(100).optional().nullable(),
  credentialUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  skills: z.array(z.string()).optional(),
  type: z.string(), // αντί για enum χρησιμοποιούμε string για πιο ευέλικτους τύπους
  filename: z.string().min(2).max(255),
  featured: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Zod schema για τα skills
export const skillSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2).max(100),
  category: z.string().min(2).max(50),
});

// Export types
export type Certification = z.infer<typeof certificationSchema>;
export type NewCertification = Omit<Certification, 'createdAt' | 'updatedAt'>;
export type SelectCertification = typeof certifications.$inferSelect;
export type InsertCertification = typeof certifications.$inferInsert;

export type Skill = z.infer<typeof skillSchema>;
export type NewSkill = Omit<Skill, 'id'>;
export type SelectSkill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;