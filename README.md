# Christos Kerigkas Portfolio

Personal portfolio and CV website for a web developer focused on responsive websites and web applications, built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.

The current app surface includes:
- Landing page with About, Projects, Certifications, and Contact sections
- Interactive CV page at `/cv`
- Supabase-backed APIs for projects, certifications, uploads, and contact
- Theme switching, Sentry monitoring, security headers, and PDF export utilities

The repository is intended to present projects, certifications, and contact details in a production-oriented format rather than as a generic starter template.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS
- Supabase Auth, Database, and Storage
- Framer Motion
- Recharts
- Sentry

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill in the required values.

Minimum useful env vars:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
CONTACT_EMAIL=
NEXT_PUBLIC_API_URL=
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
npm run db:health
npm run deps:check
npm run clean
npm run clean:install
```

Notes:
- `npm run type-check` runs `next typegen` before `tsc --noEmit` so route/layout types are generated consistently.
- `npm run db:health` checks the Supabase-backed project connectivity used by the app.

## Project Structure

```text
src/
  app/                App Router pages and API routes
  components/         Shared UI, layout, and feature components
  content/            Static fallback content
  hooks/              Client hooks
  lib/                Auth, db, config, monitoring, utils
  types/              Shared TypeScript types
scripts/              Bundle size and DB health checks
supabase/             Local Supabase config and migrations
```

## Operational Notes

- Certifications can come from Supabase or local fallback content, but the app normalizes them to one stable UI contract.
- Certificate previews depend on Supabase Storage plus the CSP rules defined in `next.config.ts`.
- The repo intentionally ignores `.env*` except `.env.example`; do not commit real credentials.

## Quality Checks

Before pushing changes, run:

```bash
npm run lint
npm run type-check
npm run build
```
