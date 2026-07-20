// Row shapes for the static portfolio content, matching the columns of the
// former Postgres tables so downstream mappers keep working unchanged.

export interface ProjectRow {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  categories: string[] | null;
  tech: string[];
  image: string;
  github: string | null;
  live_url: string | null;
  featured: boolean | null;
  status: string | null;
  order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CertificationRow {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  credential_id: string | null;
  credential_url: string | null;
  description: string | null;
  type: string;
  filename: string | null;
  featured: boolean | null;
  expiry_date: string | null;
  skills: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SkillRow {
  id: string;
  name: string;
  category: string;
  proficiency: number | null;
  display_order: number | null;
  icon: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EducationRow {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  description: string | null;
  gpa: number | null;
  achievements: string[] | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ExperienceRow {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string | null;
  description: string;
  location: string | null;
  responsibilities: string[] | null;
  technologies: string[] | null;
  achievements: string[] | null;
  company_url: string | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}
