'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

/**
 * Custom hook to safely use theme in client components without hydration issues
 * Returns the current theme and a boolean indicating if the component is mounted
 */
export function useClientTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only set mounted to true after first render to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return safe theme values that won't cause hydration issues
  return {
    theme: mounted ? theme : undefined,
    resolvedTheme: mounted ? resolvedTheme : undefined,
    setTheme,
    mounted,
    // Helper function to get classes based on theme
    getThemeClasses: (lightClasses: string, darkClasses: string) => {
      if (!mounted) {
        return `${lightClasses} dark:${darkClasses.replace(/^dark:/, '')}`;
      }
      return resolvedTheme === 'dark' ? darkClasses : lightClasses;
    },
    // Helper function to conditionally apply classes
    isDark: mounted ? resolvedTheme === 'dark' : false,
    isLight: mounted ? resolvedTheme === 'light' : false,
  };
}

/**
 * Higher-order component to wrap components that need theme
 * and ensure they only render after hydration
 */
export function withClientTheme<T extends object>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return function ThemeWrappedComponent(props: T) {
    const { mounted } = useClientTheme();
    
    if (!mounted) {
      // Return a skeleton or placeholder during hydration
      return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />;
    }
    
    return <Component {...props} />;
  };
}