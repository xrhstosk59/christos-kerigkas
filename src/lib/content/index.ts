// Static portfolio content, formerly served from Postgres. The row data lives
// in rows.generated.ts; this module ports the ordering and mapping logic of the
// old repositories so the rest of the app is unaffected by the removal of the
// database.

import type { Certification } from '@/types/certifications';
import type { Education, Experience, Skill } from '@/types/cv';
import { certifications } from '@/content/certifications';
import { educationRows, experienceRows, projectRows, skillRows } from './rows.generated';
import type { ProjectRow } from './types';

export type { EducationRow, ExperienceRow, ProjectRow, SkillRow } from './types';

// ---------------------------------------------------------------------------
// Projects — ordered by "order" ASC, like the old repository
// ---------------------------------------------------------------------------

export function getProjectRows(): ProjectRow[] {
  return [...projectRows].sort(
    (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
  );
}

export function getProjectRowBySlug(slug: string): ProjectRow | undefined {
  return projectRows.find((project) => project.slug === slug);
}

// ---------------------------------------------------------------------------
// Certifications — the curated list in src/content/certifications.ts is the
// source of truth (it is newer than the last database backup). Sorted
// featured DESC, issueDate DESC like the old repository.
// ---------------------------------------------------------------------------

export function getCertifications(): Certification[] {
  return [...certifications].sort((a, b) => {
    const featured = Number(b.featured ?? false) - Number(a.featured ?? false);
    if (featured !== 0) return featured;
    return b.issueDate.localeCompare(a.issueDate);
  });
}

// ---------------------------------------------------------------------------
// Skills — category ASC, display_order ASC
// ---------------------------------------------------------------------------

export function getSkills(): Skill[] {
  return [...skillRows]
    .sort(
      (a, b) =>
        a.category.localeCompare(b.category) ||
        (a.display_order ?? Number.MAX_SAFE_INTEGER) - (b.display_order ?? Number.MAX_SAFE_INTEGER)
    )
    .map((row) => ({
      name: row.name,
      level: (row.proficiency ?? 0) * 20,
      category: row.category as Skill['category'],
      order: row.display_order ?? undefined,
      icon: row.icon || undefined,
    }));
}

// ---------------------------------------------------------------------------
// Education / Experience — display_order DESC, start_date DESC
// ---------------------------------------------------------------------------

function compareTimeline(
  a: { display_order: number | null; start_date: string },
  b: { display_order: number | null; start_date: string }
): number {
  const order = (b.display_order ?? 0) - (a.display_order ?? 0);
  if (order !== 0) return order;
  return b.start_date.localeCompare(a.start_date);
}

export function getEducation(): Education[] {
  return [...educationRows].sort(compareTimeline).map((row) => ({
    id: row.id,
    institution: row.institution,
    degree: row.degree,
    field: row.field,
    startDate: row.start_date,
    endDate: row.end_date || null,
    location: row.location || undefined,
    description: row.description || undefined,
    gpa: row.gpa ? Number(row.gpa) : undefined,
    achievements: row.achievements || [],
  }));
}

export function getExperience(): Experience[] {
  return [...experienceRows].sort(compareTimeline).map((row) => ({
    id: row.id,
    company: row.company,
    position: row.position,
    startDate: row.start_date,
    endDate: row.end_date || null,
    description: row.description,
    location: row.location || undefined,
    responsibilities: row.responsibilities || [],
    technologies: row.technologies || [],
    achievements: row.achievements || [],
    companyUrl: row.company_url || undefined,
  }));
}
