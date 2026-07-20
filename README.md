# Christos Kerigkas Portfolio

Personal portfolio and CV website for a web developer focused on responsive websites and web applications, built with Next.js, React, TypeScript, and Tailwind CSS.

The current app surface includes:
- Landing page with About, Projects, Certifications, and Contact sections
- Interactive CV page at `/cv`
- Static portfolio content compiled into the app — no database dependency
- Theme switching, Sentry monitoring, security headers, and PDF export utilities

The repository is intended to present projects, certifications, and contact details in a production-oriented format rather than as a generic starter template.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS
- Framer Motion
- Recharts
- Sentry

## Content model

All portfolio content lives in the repository:

- `src/lib/content/rows.generated.ts` — projects, skills, education, and experience rows (recovered from the last database backup)
- `src/content/certifications.ts` — curated certifications list (source of truth)
- `src/lib/data/project-copy.ts` — per-project copy overrides, supplemental projects, and cover images
- `src/lib/data/cv-data.ts` — CV curation (ordering, skill definitions, languages)
- `public/certificates/` and `public/images/projects/` — certificate PDFs and project covers

Updating content is a code change: edit the relevant file, commit, and redeploy.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill in the required values.

Minimum useful env vars (only needed for the contact form):

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
CONTACT_EMAIL=
```

3. Start the app:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run dev:turbo
npm run lint
npm run type-check
npm run build
npm run start
npm run analyze
npm run bundle-size
npm run deps:check
npm run clean
npm run clean:install
```

Notes:
- `npm run type-check` runs TypeScript without emitting build artifacts.

## Project Structure

```text
src/
  app/                App Router pages and API routes
  components/         Shared UI, layout, and feature components
  content/            Curated certifications content
  hooks/              Client hooks
  lib/                Config, content, monitoring, services, utils
  types/              Shared TypeScript types
scripts/              Bundle size check
```

## Operational Notes

- The contact form delivers via SMTP only; without SMTP configuration it returns an error.
- Public certificate files live under `public/certificates/`.
- The repo intentionally ignores `.env*` except `.env.example`; do not commit real credentials.

## Quality Checks

Before pushing changes, run:

```bash
npm run lint
npm run type-check
npm run build
```
