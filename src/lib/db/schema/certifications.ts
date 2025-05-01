// src/lib/db/schema/certifications.ts
import {
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
    boolean,
    integer,
    primaryKey
  } from 'drizzle-orm/pg-core';
  
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
    type: varchar('type', { length: 50 }).notNull(),
    filename: varchar('filename', { length: 255 }).notNull(),
    featured: boolean('featured').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  });
  
  // Skills table
  export const skills = pgTable('skills', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    category: varchar('category', { length: 50 }).notNull(),
  });
  
  // Certification to skill junction table (many-to-many)
  export const certificationsToSkills = pgTable('certifications_to_skills', {
    certificationId: varchar('certification_id', { length: 100 }).notNull().references(() => certifications.id, { onDelete: 'cascade' }),
    skillId: integer('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  }, (table) => {
    return {
      pk: primaryKey(table.certificationId, table.skillId),
    }
  });
  
  // Export types
  export type Certification = typeof certifications.$inferSelect;
  export type NewCertification = typeof certifications.$inferInsert;
  
  export type Skill = typeof skills.$inferSelect;
  export type NewSkill = typeof skills.$inferInsert;