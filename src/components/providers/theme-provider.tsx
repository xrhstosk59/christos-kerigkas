'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';
import { PROFILE_IMAGE_URL } from '@/lib/utils/storage';

// Separate context for profile image (not related to theme)
interface ProfileContextType {
  profileImage: string;
  setProfileImage: (src: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Profile Provider (separate from theme)
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profileImage, setProfileImage] = useState<string>(PROFILE_IMAGE_URL);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load profile image from localStorage
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);

  // Save profile image to localStorage when it changes
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('profileImage', profileImage);
  }, [profileImage, mounted]);

  return (
    <ProfileContext.Provider value={{ profileImage, setProfileImage }}>
      {children}
    </ProfileContext.Provider>
  );
}

// Custom hook for profile
export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

// Theme Provider using next-themes
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ProfileProvider>
        {children}
      </ProfileProvider>
    </NextThemesProvider>
  );
}