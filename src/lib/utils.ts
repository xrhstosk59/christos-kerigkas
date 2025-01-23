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

export function isExternalLink(url: string): boolean {
  return url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')
}