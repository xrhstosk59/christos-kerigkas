'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  profileImage: string;
  setProfileImage: (src: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [profileImage, setProfileImage] = useState<string>('/uploads/profile.jpg');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ενημέρωση του mounted state για να αποφύγουμε διαφορές
    // μεταξύ server και client rendering
    setMounted(true);

    // Φόρτωση του αποθηκευμένου θέματος από το localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Προτεραιότητα: savedTheme > prefersDark > default (light)
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }

    // Φόρτωση του προφίλ image από το localStorage
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);

  // Παρακολούθηση αλλαγών στο θέμα και ενημέρωση του DOM και localStorage
  useEffect(() => {
    if (!mounted) return;
    
    // Ενημέρωση του classList του document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Αποθήκευση στο localStorage
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  // Αποθήκευση του profileImage στο localStorage όταν αλλάζει
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('profileImage', profileImage);
  }, [profileImage, mounted]);

  // Συνάρτηση για εναλλαγή θέματος
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Context value
  const themeContextValue: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    profileImage,
    setProfileImage,
  };

  return (
    <>
      {/* Script για αποφυγή του flash of incorrect theme */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {
                // Σε περίπτωση σφάλματος (π.χ. localStorage μη διαθέσιμο),
                // απλά συνεχίζουμε χωρίς να αλλάξουμε τίποτα
                console.error('Error accessing localStorage for theme:', e);
              }
            })();
          `,
        }}
      />
      <ThemeContext.Provider value={themeContextValue}>
        {children}
      </ThemeContext.Provider>
    </>
  );
}

// Custom hook για εύκολη πρόσβαση στο ThemeContext
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}