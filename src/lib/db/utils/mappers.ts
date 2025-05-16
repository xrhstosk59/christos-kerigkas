// src/lib/db/utils/mappers.ts
import { SelectBlogPost, BlogPost } from '../schema/blog';
import { SelectCertification, Certification } from '../schema/certifications';
import { SelectProject, Project } from '../schema/projects';

/**
 * Μετατρέπει ένα DB blog post σε τύπο BlogPost για το frontend
 */
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
    category: dbPost.category || 'general',
  };
}

/**
 * Μετατρέπει ένα DB certification σε τύπο Certification για το frontend
 */
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
    featured: dbCert.featured ?? false, // Χρήση ?? για να αποφύγουμε το null
    createdAt: dbCert.createdAt,
    updatedAt: dbCert.updatedAt
  };
}

/**
 * Μετατρέπει ένα DB project σε τύπο Project για το frontend
 */
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
    images: Array.isArray(dbProject.images) ? dbProject.images : null, // Διασφάλιση ότι είναι array ή null
    status: dbProject.status,
    featured: dbProject.featured ?? false, // Χρήση ?? για να αποφύγουμε το null
    order: dbProject.order,
    createdAt: dbProject.createdAt,
    updatedAt: dbProject.updatedAt
  };
}