# Setup Guide

Quick setup guide for running this portfolio locally.

## Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account - free tier is fine)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

### 3. Required Variables (Minimum Setup)

Edit `.env.local` and set these:

```bash
# Database (get from Supabase or local PostgreSQL)
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key"

# Security (generate with the commands below)
ENCRYPTION_KEY="generate_with_command_below"
ENCRYPTION_SALT="any_random_string"

# Email (optional - only if you want contact form to work)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
```

### 4. Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `ENCRYPTION_KEY` in `.env.local`

### 5. Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Optional Features

### Upstash Redis (for production rate limiting)

Free tier: https://console.upstash.com/

```bash
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="your_token"
```

### Email Setup (for contact form)

Use Gmail with App Password:
1. Enable 2FA on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate app password
4. Use it in `SMTP_PASS`

### Analytics (optional)

```bash
NEXT_PUBLIC_GA_TRACKING_ID="G-XXXXXXXXXX"
```

## Admin Access

Default admin credentials (change after first login):
- Email: Set in your Supabase users table
- Password: Set via Supabase Auth

## Troubleshooting

**Database connection errors:**
- Check your `DATABASE_URL` is correct
- Make sure PostgreSQL is running

**2FA not working:**
- Ensure `ENCRYPTION_KEY` is set (64 characters)
- Run `npm run migrate:2fa-encryption` if upgrading from old version

**Build errors:**
- Delete `node_modules` and `.next`
- Run `npm clean:install`

## Production Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

**Important**: Set `ENCRYPTION_KEY` and database credentials in Vercel env vars.

## Security Notes

- Never commit `.env.local` to git
- Use different encryption keys for dev/production
- Keep dependencies updated: `npm audit`

## Need Help?

Check the full documentation in `SECURITY_FIXES.md` for detailed info on security features.
