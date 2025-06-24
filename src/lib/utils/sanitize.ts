// src/lib/utils/sanitize.ts
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Server-side DOMPurify initialization
const createDOMPurify = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    return DOMPurify;
  } else {
    // Server-side
    const { window } = new JSDOM('');
    const DOMPurifyServer = DOMPurify(window as any);
    return DOMPurifyServer;
  }
};

// Διαφορετικά επίπεδα sanitization
export const SanitizeLevel = {
  MINIMAL: 'minimal',
  STANDARD: 'standard',
  STRICT: 'strict',
  CONTENT: 'content',
} as const;

export type SanitizeLevelType = typeof SanitizeLevel[keyof typeof SanitizeLevel];

// Configurations για κάθε επίπεδο
const sanitizeConfigs = {
  [SanitizeLevel.MINIMAL]: {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  },
  [SanitizeLevel.STANDARD]: {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup',
      'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    KEEP_CONTENT: true,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  },
  [SanitizeLevel.STRICT]: {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'img', 'svg'],
    FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror'],
  },
  [SanitizeLevel.CONTENT]: {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup',
      'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'code', 'pre', 'img', 'figure', 'figcaption', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'src', 'alt', 'width', 'height', 'class'],
    KEEP_CONTENT: true,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  },
};

/**
 * Καθαρίζει HTML content από XSS attacks
 */
export function sanitizeHtml(
  content: string, 
  level: SanitizeLevelType = SanitizeLevel.STANDARD
): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  try {
    const purify = createDOMPurify();
    const config = sanitizeConfigs[level];

    // Additional security configurations
    const securityConfig = {
      ...config,
      USE_PROFILES: { html: true },
      SANITIZE_DOM: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false,
      // Αφαιρεί data attributes που μπορεί να είναι επικίνδυνα
      FORBID_ATTR: config.ALLOWED_ATTR ? undefined : ['data-*', 'style', 'onload', 'onerror', 'onclick'],
      // Αφαιρεί JavaScript protocols
      FORBID_CONTENTS: ['script', 'object', 'embed', 'applet'],
    };

    return purify.sanitize(content, securityConfig);
  } catch (error) {
    console.error('Sanitization error:', error);
    // Fallback to basic HTML entity encoding
    return basicHtmlEscape(content);
  }
}

/**
 * Basic HTML entity escaping (fallback)
 */
export function basicHtmlEscape(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (match) => htmlEscapes[match] || match);
}

/**
 * Καθαρίζει text από οποιοδήποτε HTML content
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Αφαιρεί όλα τα HTML tags
  const withoutTags = text.replace(/<[^>]*>/g, '');
  
  // Basic HTML entity decoding για συνηθισμένες περιπτώσεις
  return withoutTags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

/**
 * Καθαρίζει URLs από JavaScript protocols
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Λίστα επικίνδυνων protocols
  const dangerousProtocols = [
    'javascript:', 'vbscript:', 'data:', 'blob:', 
    'file:', 'ftp:', 'jar:', 'view-source:'
  ];

  const cleanUrl = url.trim().toLowerCase();

  // Έλεγχος για επικίνδυνα protocols
  for (const protocol of dangerousProtocols) {
    if (cleanUrl.startsWith(protocol)) {
      return ''; // Επιστρέφει κενό string για επικίνδυνα URLs
    }
  }

  // Επιτρέπει μόνο HTTP, HTTPS, mailto, tel
  const allowedPattern = /^(https?:|mailto:|tel:|#|\/)/i;
  if (!allowedPattern.test(cleanUrl)) {
    return '';
  }

  return url; // Επιστρέφει το original URL αν είναι ασφαλές
}

/**
 * Καθαρίζει CSS values
 */
export function sanitizeCss(cssValue: string): string {
  if (!cssValue || typeof cssValue !== 'string') {
    return '';
  }

  // Αφαιρεί επικίνδυνα CSS functions και properties
  const dangerousPatterns = [
    /expression\s*\(/gi,
    /javascript\s*:/gi,
    /vbscript\s*:/gi,
    /behavior\s*:/gi,
    /-moz-binding/gi,
    /import/gi,
    /@import/gi,
    /url\s*\(/gi,
  ];

  let clean = cssValue;
  dangerousPatterns.forEach(pattern => {
    clean = clean.replace(pattern, '');
  });

  return clean.trim();
}

/**
 * Comprehensive input sanitization για forms
 */
export function sanitizeInput(
  input: string,
  options: {
    maxLength?: number;
    allowHtml?: boolean;
    level?: SanitizeLevelType;
  } = {}
): string {
  const { maxLength = 1000, allowHtml = false, level = SanitizeLevel.STRICT } = options;

  if (!input || typeof input !== 'string') {
    return '';
  }

  // Περιορισμός μήκους
  let clean = input.substring(0, maxLength);

  // HTML sanitization ή removal
  if (allowHtml) {
    clean = sanitizeHtml(clean, level);
  } else {
    clean = sanitizeText(clean);
  }

  // Καθαρισμός whitespace
  clean = clean.trim();

  return clean;
}

/**
 * Ειδική sanitization για email addresses
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Basic email validation και sanitization
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const clean = email.trim().toLowerCase();

  if (!emailRegex.test(clean)) {
    return '';
  }

  // Αφαιρεί επικίνδυνους χαρακτήρες
  return clean.replace(/[<>'"]/g, '');
}