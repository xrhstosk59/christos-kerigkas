// src/lib/config/env.ts
import { z } from 'zod';

/**
 * Environment variable validation schema
 */
const optionalEnv = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') return value;

    const normalized = value.trim();
    return normalized === '' ? undefined : normalized;
  }, schema.optional());

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Application
  NEXT_PUBLIC_APP_URL: optionalEnv(z.string().url()),
  NEXT_PUBLIC_APP_NAME: z.string().default('Christos Kerigkas'),
  NEXT_PUBLIC_APP_VERSION: optionalEnv(z.string()),
  
  // Email (Optional)
  SMTP_HOST: optionalEnv(z.string()),
  SMTP_PORT: optionalEnv(z.string()),
  SMTP_USER: optionalEnv(z.string()),
  SMTP_PASS: optionalEnv(z.string()),
  FROM_EMAIL: optionalEnv(z.string().email()),
  
  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'),
  
  // Analytics (Optional)
  NEXT_PUBLIC_GA_TRACKING_ID: optionalEnv(z.string()),
  NEXT_PUBLIC_GOOGLE_ANALYTICS: optionalEnv(z.string()),
  
  // Sentry (Optional)
  NEXT_PUBLIC_SENTRY_DSN: optionalEnv(z.string().url()),
  SENTRY_ORG: optionalEnv(z.string()),
  SENTRY_PROJECT: optionalEnv(z.string()),
  SENTRY_AUTH_TOKEN: optionalEnv(z.string()),
  
  // Feature Flags
  ENABLE_RATE_LIMITING: z.string().transform(val => val === 'true').default('true'),
  ENABLE_OFFLINE_SUPPORT: z.string().transform(val => val === 'true').default('true'),
  
  // Performance & Monitoring
  ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default('true'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Social Media (Optional)
  NEXT_PUBLIC_TWITTER_HANDLE: optionalEnv(z.string()),
  NEXT_PUBLIC_LINKEDIN_URL: optionalEnv(z.string().url()),
  NEXT_PUBLIC_GITHUB_URL: optionalEnv(z.string().url()),
  
  // Contact
  CONTACT_FORM_TO_EMAIL: optionalEnv(z.string().email()),
  NOTIFICATION_EMAIL: optionalEnv(z.string().email()),
  
  // Deployment (Optional)
  VERCEL_URL: optionalEnv(z.string()),
  DEPLOYMENT_WEBHOOK_SECRET: optionalEnv(z.string()),
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
    throw new Error('Environment validation failed');
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
 * Social media configuration
 */
export const socialConfig = {
  twitter: env.NEXT_PUBLIC_TWITTER_HANDLE,
  linkedin: env.NEXT_PUBLIC_LINKEDIN_URL,
  github: env.NEXT_PUBLIC_GITHUB_URL,
} as const;

/**
 * Log environment configuration (safe for development)
 */
export function logEnvConfig(): void {
  if (!isDev) return;
  
  console.log('🔧 Environment Configuration:');
  console.log(`  - NODE_ENV: ${env.NODE_ENV}`);
  console.log(`  - App Name: ${appConfig.name}`);
  console.log(`  - App URL: ${appConfig.url || 'not set'}`);
  console.log(`  - Sentry: ${sentryConfig.dsn ? '✅ configured' : '⚠️  not configured'}`);
  console.log(`  - Analytics: ${analyticsConfig.googleAnalytics ? '✅ configured' : '⚠️  not configured'}`);
  console.log('🚀 Feature Flags:');
  console.log(`  - Rate Limiting: ${features.enableRateLimiting ? '✅' : '❌'}`);
  console.log(`  - Offline Support: ${features.enableOfflineSupport ? '✅' : '❌'}`);
  console.log(`  - Performance Monitoring: ${features.enablePerformanceMonitoring ? '✅' : '❌'}`);
}
