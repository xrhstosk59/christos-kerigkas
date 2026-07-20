'use client';

import { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';

// Theme Provider using next-themes
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // The profile photo is a fixed asset now; clear the obsolete override that
  // the old upload feature stored in visitors' localStorage.
  useEffect(() => {
    localStorage.removeItem('profileImage');
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
