// src/lib/db/schema/audit.ts
import { pgTable, varchar, text, timestamp, uuid, jsonb, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from './auth';

// Audit Log Table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }),
  resourceId: varchar('resource_id', { length: 255 }),
  details: jsonb('details'), // Additional context data
  ipAddress: varchar('ip_address', { length: 45 }), // IPv6 compatible
  userAgent: text('user_agent'),
  sessionId: varchar('session_id', { length: 255 }),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
  severity: varchar('severity', { length: 20 }).default('INFO'), // INFO, WARN, ERROR, CRITICAL
  source: varchar('source', { length: 50 }).default('WEB'), // WEB, API, SYSTEM, CLI
}, (table) => ({
  // Indexes για performance
  userIdx: index('idx_audit_user').on(table.userId),
  actionIdx: index('idx_audit_action').on(table.action),
  timestampIdx: index('idx_audit_timestamp').on(table.timestamp),
  resourceIdx: index('idx_audit_resource').on(table.resourceType, table.resourceId),
  severityIdx: index('idx_audit_severity').on(table.severity),
  sourceIdx: index('idx_audit_source').on(table.source),
  // Composite index για συχνές αναζητήσεις
  userActionIdx: index('idx_audit_user_action').on(table.userId, table.action),
  resourceActionIdx: index('idx_audit_resource_action').on(table.resourceType, table.action),
}));

// Zod schemas για validation
export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const selectAuditLogSchema = createSelectSchema(auditLogs);

// Types
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

// Predefined audit actions για consistency
export const AuditAction = {
  // Authentication actions
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE: 'PASSWORD_RESET_COMPLETE',
  
  // Two-Factor Authentication
  '2FA_ENABLE': '2FA_ENABLE',
  '2FA_DISABLE': '2FA_DISABLE',
  '2FA_VERIFY_SUCCESS': '2FA_VERIFY_SUCCESS',
  '2FA_VERIFY_FAILED': '2FA_VERIFY_FAILED',
  '2FA_BACKUP_CODE_USED': '2FA_BACKUP_CODE_USED',
  '2FA_BACKUP_CODES_REGENERATED': '2FA_BACKUP_CODES_REGENERATED',
  
  // Account lockout
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  EMERGENCY_ACCOUNT_UNLOCK: 'EMERGENCY_ACCOUNT_UNLOCK',
  
  // User management
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_ROLE_CHANGE: 'USER_ROLE_CHANGE',
  
  // Content management
  BLOG_POST_CREATE: 'BLOG_POST_CREATE',
  BLOG_POST_UPDATE: 'BLOG_POST_UPDATE',
  BLOG_POST_DELETE: 'BLOG_POST_DELETE',
  BLOG_POST_PUBLISH: 'BLOG_POST_PUBLISH',
  BLOG_POST_UNPUBLISH: 'BLOG_POST_UNPUBLISH',
  
  PROJECT_CREATE: 'PROJECT_CREATE',
  PROJECT_UPDATE: 'PROJECT_UPDATE',
  PROJECT_DELETE: 'PROJECT_DELETE',
  
  // File operations
  FILE_UPLOAD: 'FILE_UPLOAD',
  FILE_DELETE: 'FILE_DELETE',
  FILE_ACCESS: 'FILE_ACCESS',
  
  // Admin actions
  ADMIN_ACCESS: 'ADMIN_ACCESS',
  ADMIN_SETTINGS_CHANGE: 'ADMIN_SETTINGS_CHANGE',
  ADMIN_USER_IMPERSONATE: 'ADMIN_USER_IMPERSONATE',
  
  // Security events
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS_ATTEMPT: 'UNAUTHORIZED_ACCESS_ATTEMPT',
  
  // System events
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SYSTEM_MAINTENANCE_START: 'SYSTEM_MAINTENANCE_START',
  SYSTEM_MAINTENANCE_END: 'SYSTEM_MAINTENANCE_END',
  
  // API events
  API_KEY_CREATE: 'API_KEY_CREATE',
  API_KEY_DELETE: 'API_KEY_DELETE',
  API_RATE_LIMIT_EXCEEDED: 'API_RATE_LIMIT_EXCEEDED',
  
  // Data events
  DATA_EXPORT: 'DATA_EXPORT',
  DATA_IMPORT: 'DATA_IMPORT',
  DATA_BACKUP: 'DATA_BACKUP',
  DATA_RESTORE: 'DATA_RESTORE',
} as const;

export type AuditActionType = typeof AuditAction[keyof typeof AuditAction];

// Resource types για consistency
export const ResourceType = {
  USER: 'USER',
  USER_PROFILE: 'USER_PROFILE',
  BLOG_POST: 'BLOG_POST',
  PROJECT: 'PROJECT',
  CERTIFICATION: 'CERTIFICATION',
  FILE: 'FILE',
  CONTACT_MESSAGE: 'CONTACT_MESSAGE',
  NEWSLETTER_SUBSCRIPTION: 'NEWSLETTER_SUBSCRIPTION',
  SYSTEM: 'SYSTEM',
  API_KEY: 'API_KEY',
  SESSION: 'SESSION',
} as const;

export type ResourceTypeType = typeof ResourceType[keyof typeof ResourceType];

// Severity levels
export const Severity = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
} as const;

export type SeverityType = typeof Severity[keyof typeof Severity];

// Source types
export const Source = {
  WEB: 'WEB',
  API: 'API',
  SYSTEM: 'SYSTEM',
  CLI: 'CLI',
} as const;

export type SourceType = typeof Source[keyof typeof Source];