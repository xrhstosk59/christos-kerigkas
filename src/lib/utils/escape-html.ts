// src/lib/utils/escape-html.ts
// Ξεχωριστό από το sanitize.ts επειδή εκείνο κάνει top-level import του jsdom.
// Έτσι consumers που θέλουν μόνο escaping (π.χ. API routes) δεν σέρνουν jsdom.

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/** Escape HTML entities σε κείμενο που πάει σε HTML context. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"'/]/g, (match) => HTML_ESCAPES[match] || match);
}
