// src/lib/db/utils/mappers.ts
// DEPRECATED: These mappers are no longer used after migration to Supabase.
// Database types are now handled directly via @/lib/db/database.types
// This file is kept for reference but should not be imported.

/*
// Commented out to avoid build errors - these types no longer exist

import { SelectBlogPost, BlogPost } from '../schema/blog';
import { SelectCertification, Certification } from '../schema/certifications';
import { SelectProject, Project } from '../schema/projects';

export function mapDbPostToBlogPost(dbPost: SelectBlogPost, categories: string[] = []): BlogPost {
  return {
    id: dbPost.id,
    slug: dbPost.slug,
    title: dbPost.title,
    description: dbPost.description,
    content: dbPost.content,
    image: dbPost.image || null,
    authorName: dbPost.authorName,
    authorImage: dbPost.authorImage || null,
    date: dbPost.date,
    createdAt: dbPost.createdAt,
    updatedAt: dbPost.updatedAt,
    status: dbPost.status || 'draft',
    categories: categories.length > 0 ? categories : (dbPost.categories as string[] || ['general']),
    excerpt: dbPost.excerpt || null,
    metaTitle: dbPost.metaTitle || null,
    metaDescription: dbPost.metaDescription || null,
    published: dbPost.published ?? true,
    featured: dbPost.featured ?? false,
    views: Number(dbPost.views) || 0,
    readingTime: dbPost.readingTime || 1,
    category: dbPost.category || 'general',
  };
}

export function mapDbCertificationToCertification(
  dbCert: SelectCertification,
  skills: string[] = []
): Certification {
  return {
    id: dbCert.id,
    title: dbCert.title,
    issuer: dbCert.issuer,
    issueDate: dbCert.issueDate,
    expirationDate: dbCert.expirationDate || null,
    credentialId: dbCert.credentialId || null,
    credentialUrl: dbCert.credentialUrl || null,
    description: dbCert.description || null,
    skills: skills.length > 0 ? skills : (dbCert.skills || []),
    type: dbCert.type,
    filename: dbCert.filename,
    featured: dbCert.featured ?? false,
    createdAt: dbCert.createdAt,
    updatedAt: dbCert.updatedAt
  };
}

export function mapDbProjectToProject(
  dbProject: SelectProject,
  categories: string[] = [],
  tech: string[] = []
): Project {
  return {
    id: dbProject.id,
    slug: dbProject.slug,
    title: dbProject.title,
    description: dbProject.description,
    shortDescription: dbProject.shortDescription || null,
    categories: categories.length > 0 ? categories : (dbProject.categories || []),
    tech: tech.length > 0 ? tech : (dbProject.tech || []),
    github: dbProject.github,
    demo: dbProject.demo || null,
    image: dbProject.image,
    images: Array.isArray(dbProject.images) ? dbProject.images : null,
    status: dbProject.status,
    featured: dbProject.featured ?? false,
    order: dbProject.order,
    createdAt: dbProject.createdAt,
    updatedAt: dbProject.updatedAt
  };
}
*/

// Placeholder export to avoid "empty file" errors
export {};
