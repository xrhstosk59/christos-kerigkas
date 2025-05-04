// src/lib/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
  source?: string;
  requestId?: string;
}

/**
 * Κεντρικοποιημένο σύστημα logging για την εφαρμογή.
 * Παρέχει ομοιόμορφη διαχείριση logs σε διαφορετικά επίπεδα 
 * και δυνατότητα αποστολής τους σε εξωτερικές υπηρεσίες.
 */
export const logger = {
  /**
   * Καταγραφή πληροφοριών debugging.
   * Χρησιμοποιείται μόνο κατά την ανάπτυξη.
   */
  debug(message: string, data?: unknown, source?: string, requestId?: string) {
    this.log('debug', message, data, source, requestId);
  },
  
  /**
   * Καταγραφή πληροφοριακών μηνυμάτων.
   */
  info(message: string, data?: unknown, source?: string, requestId?: string) {
    this.log('info', message, data, source, requestId);
  },
  
  /**
   * Καταγραφή προειδοποιήσεων.
   */
  warn(message: string, data?: unknown, source?: string, requestId?: string) {
    this.log('warn', message, data, source, requestId);
  },
  
  /**
   * Καταγραφή σφαλμάτων.
   */
  error(message: string, data?: unknown, source?: string, requestId?: string) {
    this.log('error', message, data, source, requestId);
  },
  
  /**
   * Βασική μέθοδος καταγραφής που χρησιμοποιείται από όλες τις άλλες.
   */
  log(level: LogLevel, message: string, data?: unknown, source?: string, requestId?: string) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      source,
      requestId,
      data: this.sanitizeData(data),
    };
    
    if (process.env.NODE_ENV === 'production') {
      // Αποστολή σε εξωτερική υπηρεσία logging σε παραγωγικό περιβάλλον
      this.sendToLogService(entry);
    } else {
      // Απλή εμφάνιση στην κονσόλα σε development περιβάλλον
      const consoleMethod = console[level] || console.log;
      const sourcePrefix = source ? `[${source}] ` : '';
      const requestIdSuffix = requestId ? ` (${requestId})` : '';
      
      consoleMethod(`${entry.timestamp} - ${level.toUpperCase()} - ${sourcePrefix}${entry.message}${requestIdSuffix}`, entry.data || '');
    }
    
    return entry;
  },
  
  /**
   * Αφαίρεση ευαίσθητων πληροφοριών πριν την καταγραφή.
   */
  sanitizeData(data: unknown): unknown {
    if (!data) return undefined;
    
    try {
      // Βαθιά αντιγραφή για να μην επηρεάσουμε το αρχικό αντικείμενο
      const sanitized = JSON.parse(JSON.stringify(data));
      
      // Αφαίρεση ευαίσθητων πεδίων
      const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization', 'cookie', 'credentials'];
      
      // Αλλαγή του Record<string, any> σε Record<string, unknown>
      const sanitizeObject = (obj: Record<string, unknown>) => {
        for (const key of Object.keys(obj)) {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            obj[key] = '[REDACTED]';
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key] as Record<string, unknown>);
          }
        }
      };
      
      if (typeof sanitized === 'object' && sanitized !== null) {
        sanitizeObject(sanitized as Record<string, unknown>);
      }
      
      return sanitized;
    } catch {
      // Σε περίπτωση που δεν μπορεί να γίνει JSON serialization
      // Αφαιρέθηκε η παράμετρος του catch block
      return '[Unable to sanitize data]';
    }
  },
  
  /**
   * Αποστολή των logs σε εξωτερική υπηρεσία.
   * Υλοποιήστε αυτή τη μέθοδο για να συνδέσετε με Sentry, LogDNA, κλπ.
   */
  sendToLogService(entry: LogEntry) {
    // Παράδειγμα υλοποίησης με console σε παραγωγή (αντικαταστήστε με πραγματική υπηρεσία)
    console[entry.level](`[PRODUCTION] ${entry.timestamp} - ${entry.level.toUpperCase()} - ${entry.message}`, entry.data || '');
    
    // Εδώ θα προσθέτατε τον κώδικα για αποστολή σε Sentry, LogDNA, ή άλλη υπηρεσία
    // Για παράδειγμα με Sentry:
    // if (entry.level === 'error' || entry.level === 'warn') {
    //   Sentry.captureMessage(entry.message, {
    //     level: entry.level === 'error' ? Sentry.Severity.Error : Sentry.Severity.Warning,
    //     extra: entry.data
    //   });
    // }
  }
};