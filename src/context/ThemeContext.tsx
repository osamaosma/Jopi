// ============================================================================
// MingleUp Theme Context (Dark Mode & Light Mode)
// Smooth UI theme management with class-based persistence
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService, STORAGE_KEYS } from '../services/storageService';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const settings = StorageService.get<any>(STORAGE_KEYS.USER_SETTINGS, null);
    return settings ? !!settings.dark_mode : true; // Default dark mode for modern high-contrast sleek aesthetic
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const settings = StorageService.get<any>(STORAGE_KEYS.USER_SETTINGS, {});
    StorageService.set(STORAGE_KEYS.USER_SETTINGS, { ...settings, dark_mode: isDark });
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
