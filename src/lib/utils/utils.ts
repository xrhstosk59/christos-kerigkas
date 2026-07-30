// src/lib/utils/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Συνδυάζει class names με Tailwind-aware merging. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
