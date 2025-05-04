import { NextRequest, NextResponse } from 'next/server';

// Define log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Define log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  requestInfo?: RequestInfo;
}

// Define request info interface
export interface RequestInfo {
  method: string;
  path: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  ip?: string;
  userAgent?: string;
}

/**
 * Class for handling audit logging
 */
export class AuditLogger {
  private static instance: AuditLogger;
  private minLevel: LogLevel = LogLevel.INFO;

  private constructor() {
    // Initialize with environment settings if needed
    if (process.env.LOG_LEVEL) {
      this.setMinLevel(process.env.LOG_LEVEL as LogLevel);
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Set minimum log level
   */
  public setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Create a log entry with formatted data
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    userId?: string,
    requestInfo?: RequestInfo
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId,
      requestInfo,
    };
  }

  /**
   * Extract request information from NextRequest
   */
  public getRequestInfo(req: NextRequest): RequestInfo {
    const url = new URL(req.url);
    
    // Safe access to headers
    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    return {
      method: req.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      headers: headersObj,
      ip: headersObj['x-forwarded-for'] || headersObj['x-real-ip'] || 'unknown',
      userAgent: headersObj['user-agent'],
    };
  }

  /**
   * Log a message at specified level
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    userId?: string,
    requestInfo?: RequestInfo
  ): void {
    // Skip if below minimum level
    if (this.shouldSkip(level)) {
      return;
    }

    const entry = this.createLogEntry(level, message, context, userId, requestInfo);
    
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      const method = level === LogLevel.ERROR ? 'error' : 
                    level === LogLevel.WARN ? 'warn' : 
                    level === LogLevel.DEBUG ? 'debug' : 'log';
      console[method](JSON.stringify(entry, null, 2));
    } else {
      // In production, could send to a logging service
      // TODO: Implement production logging
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Determine if log should be skipped based on minimum level
   */
  private shouldSkip(level: LogLevel): boolean {
    const levelPriority = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3,
    };

    return levelPriority[level] < levelPriority[this.minLevel];
  }

  // Public logging methods
  public debug(
    message: string,
    context?: Record<string, unknown>,
    userId?: string,
    requestInfo?: RequestInfo
  ): void {
    this.log(LogLevel.DEBUG, message, context, userId, requestInfo);
  }

  public info(
    message: string,
    context?: Record<string, unknown>,
    userId?: string,
    requestInfo?: RequestInfo
  ): void {
    this.log(LogLevel.INFO, message, context, userId, requestInfo);
  }

  public warn(
    message: string,
    context?: Record<string, unknown>,
    userId?: string,
    requestInfo?: RequestInfo
  ): void {
    this.log(LogLevel.WARN, message, context, userId, requestInfo);
  }

  public error(
    message: string,
    context?: Record<string, unknown>,
    userId?: string,
    requestInfo?: RequestInfo
  ): void {
    this.log(LogLevel.ERROR, message, context, userId, requestInfo);
  }

  /**
   * Log API request
   */
  public logRequest(
    req: NextRequest,
    message: string = 'API Request',
    userId?: string,
    context?: Record<string, unknown>
  ): void {
    const requestInfo = this.getRequestInfo(req);
    this.info(message, context, userId, requestInfo);
  }

  /**
   * Log API response
   */
  public logResponse(
    req: NextRequest,
    res: NextResponse,
    message: string = 'API Response',
    userId?: string,
    context?: Record<string, unknown>
  ): void {
    const requestInfo = this.getRequestInfo(req);
    this.info(
      message,
      {
        ...context,
        statusCode: res.status,
        statusText: res.statusText,
      },
      userId,
      requestInfo
    );
  }

  /**
   * Log API error
   */
  public logError(
    req: NextRequest,
    error: Error,
    message: string = 'API Error',
    userId?: string,
    context?: Record<string, unknown>
  ): void {
    const requestInfo = this.getRequestInfo(req);
    this.error(
      message,
      {
        ...context,
        error: {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
      },
      userId,
      requestInfo
    );
  }
}

// Export singleton instance
export const logger = AuditLogger.getInstance();