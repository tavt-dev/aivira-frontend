import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

// Safe localStorage access for SSR
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  return (stored === 'dark' || stored === 'light') ? stored : 'light';
};

// Safe DOM manipulation
const applyTheme = (theme: 'light' | 'dark'): void => {
  if (typeof window === 'undefined') return;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeState>((set) => {
  const initialTheme = getInitialTheme();
  // Apply theme on initialization
  if (typeof window !== 'undefined') {
    applyTheme(initialTheme);
  }

  return {
    theme: initialTheme,
    setTheme: (theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme);
        applyTheme(theme);
      }
      set({ theme });
    },
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
      }
      return { theme: newTheme };
    }),
  };
});