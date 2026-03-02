'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const rawTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme: Theme = rawTheme === 'light' ? 'light' : 'dark';
    setThemeState(initialTheme);
    localStorage.setItem('theme', initialTheme);

    // Function to update DOM
    const updateTheme = (newTheme: Theme) => {
      const html = document.documentElement;
      let shouldBeDark = false;

      shouldBeDark = newTheme !== 'light';

      if (shouldBeDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }

      setIsDark(shouldBeDark);
    };

    updateTheme(initialTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    const html = document.documentElement;
    let shouldBeDark = false;

    shouldBeDark = newTheme !== 'light';

    if (shouldBeDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    setIsDark(shouldBeDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
