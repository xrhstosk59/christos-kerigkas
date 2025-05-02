//src/lib/utils/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('el-GR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

/**
 * Μορφοποίηση ημερομηνίας με διάφορες επιλογές
 * @param date - Η ημερομηνία σε μορφή string ή Date
 * @param format - Η επιθυμητή μορφή ('short', 'medium', 'long')
 * @returns Η μορφοποιημένη ημερομηνία ως string
 */
export function formatDateWithOptions(date: string | Date, format: 'short' | 'medium' | 'long' = 'medium', locale: string = 'en-US'): string {
  // Μετατροπή του string σε Date object αν χρειάζεται
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Έλεγχος αν η ημερομηνία είναι έγκυρη
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  // Επιλογή διαφορετικών options ανάλογα με το format
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
  };
  
  // Προσθήκη ώρας για 'long' format
  if (format === 'long') {
    options.hour = 'numeric';
    options.minute = 'numeric';
  }
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

export function isExternalLink(url: string): boolean {
  return url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}