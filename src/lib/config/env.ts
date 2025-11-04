// src/lib/config/env.ts
import { z } from 'zod';

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default('Christos Kerigkas'),
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),
  
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_ADMIN_URL: z.string().optional(),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  
  // Authentication
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  
  // Security
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters').optional(),
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 characters').optional(),
  
  // Email (Optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  
  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'),
  
  // Analytics (Optional)
  NEXT_PUBLIC_GA_TRACKING_ID: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_ANALYTICS: z.string().optional(),
  
  // Sentry (Optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  
  // File Upload (Optional)
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('5242880'),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp,application/pdf'),
  
  // Redis (Optional)
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Feature Flags
  ENABLE_2FA: z.string().transform(val => val === 'true').default('true'),
  ENABLE_AUDIT_LOGGING: z.string().transform(val => val === 'true').default('true'),
  ENABLE_RATE_LIMITING: z.string().transform(val => val === 'true').default('true'),
  ENABLE_OFFLINE_SUPPORT: z.string().transform(val => val === 'true').default('true'),
  
  // Performance & Monitoring
  ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default('true'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Social Media (Optional)
  NEXT_PUBLIC_TWITTER_HANDLE: z.string().optional(),
  NEXT_PUBLIC_LINKEDIN_URL: z.string().url().optional(),
  NEXT_PUBLIC_GITHUB_URL: z.string().url().optional(),
  
  // Contact
  CONTACT_FORM_TO_EMAIL: z.string().email().optional(),
  NOTIFICATION_EMAIL: z.string().email().optional(),
  
  // Deployment (Optional)
  VERCEL_URL: z.string().optional(),
  DEPLOYMENT_WEBHOOK_SECRET: z.string().optional(),
});

/**
 * Parsed and validated environment variables
 */
let parsedEnv: z.infer<typeof envSchema>;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    console.error(error.errors.map(err => `  - ${err.path.join('.')}: ${err.message}`).join('\n'));
    process.exit(1);
  }
  throw error;
}

/**
 * Type-safe environment variables
 */
export const env = parsedEnv;

/**
 * Runtime environment check
 */
export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

/**
 * Feature flags
 */
export const features = {
  enable2FA: env.ENABLE_2FA,
  enableAuditLogging: env.ENABLE_AUDIT_LOGGING,
  enableRateLimiting: env.ENABLE_RATE_LIMITING,
  enableOfflineSupport: env.ENABLE_OFFLINE_SUPPORT,
  enablePerformanceMonitoring: env.ENABLE_PERFORMANCE_MONITORING,
} as const;

/**
 * Application configuration
 */
export const appConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  url: env.NEXT_PUBLIC_APP_URL,
  version: env.NEXT_PUBLIC_APP_VERSION,
} as const;

/**
 * Database configuration
 */
export const dbConfig = {
  url: env.DATABASE_URL,
  adminUrl: env.DATABASE_ADMIN_URL,
} as const;

/**
 * Supabase configuration
 */
export const supabaseConfig = {
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

/**
 * Security configuration
 */
export const securityConfig = {
  authSecret: env.AUTH_SECRET,
  encryptionKey: env.ENCRYPTION_KEY,
  csrfSecret: env.CSRF_SECRET,
} as const;

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
} as const;

/**
 * Email configuration
 */
export const emailConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT ? parseInt(env.SMTP_PORT) : undefined,
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
  from: env.FROM_EMAIL,
  contactTo: env.CONTACT_FORM_TO_EMAIL,
  notificationTo: env.NOTIFICATION_EMAIL,
} as const;

/**
 * Analytics configuration
 */
export const analyticsConfig = {
  gaTrackingId: env.NEXT_PUBLIC_GA_TRACKING_ID,
  googleAnalytics: env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
} as const;

/**
 * Sentry configuration
 */
export const sentryConfig = {
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  org: env.SENTRY_ORG,
  project: env.SENTRY_PROJECT,
  authToken: env.SENTRY_AUTH_TOKEN,
} as const;

/**
 * File upload configuration
 */
export const uploadConfig = {
  maxFileSize: env.MAX_FILE_SIZE,
  allowedTypes: env.ALLOWED_FILE_TYPES.split(',').map(type => type.trim()),
} as const;

/**
 * Social media configuration
 */
export const socialConfig = {
  twitter: env.NEXT_PUBLIC_TWITTER_HANDLE,
  linkedin: env.NEXT_PUBLIC_LINKEDIN_URL,
  github: env.NEXT_PUBLIC_GITHUB_URL,
} as const;

/**
 * Validate critical environment variables are present
 */
export function validateCriticalEnv(): void {
  const criticalVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'AUTH_SECRET',
  ];
  
  const missing = criticalVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Critical environment variables missing:');
    console.error(missing.map(varName => `  - ${varName}`).join('\n'));
    throw new Error(`Missing critical environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ All critical environment variables are present');
}

/**
 * Log environment configuration (safe for development)
 */
export function logEnvConfig(): void {
  if (!isDev) return;
  
  console.log('🔧 Environment Configuration:');
  console.log(`  - NODE_ENV: ${env.NODE_ENV}`);
  console.log(`  - App Name: ${appConfig.name}`);
  console.log(`  - App URL: ${appConfig.url || 'not set'}`);
  console.log(`  - Database: ${dbConfig.url ? '✅ configured' : '❌ missing'}`);
  console.log(`  - Supabase: ${supabaseConfig.url ? '✅ configured' : '❌ missing'}`);
  console.log(`  - Sentry: ${sentryConfig.dsn ? '✅ configured' : '⚠️  not configured'}`);
  console.log(`  - Analytics: ${analyticsConfig.googleAnalytics ? '✅ configured' : '⚠️  not configured'}`);
  console.log('🚀 Feature Flags:');
  console.log(`  - 2FA: ${features.enable2FA ? '✅' : '❌'}`);
  console.log(`  - Audit Logging: ${features.enableAuditLogging ? '✅' : '❌'}`);
  console.log(`  - Rate Limiting: ${features.enableRateLimiting ? '✅' : '❌'}`);
  console.log(`  - Offline Support: ${features.enableOfflineSupport ? '✅' : '❌'}`);
  console.log(`  - Performance Monitoring: ${features.enablePerformanceMonitoring ? '✅' : '❌'}`);
}