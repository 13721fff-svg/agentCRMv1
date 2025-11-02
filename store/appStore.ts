import { create } from 'zustand';

type Theme = 'light' | 'dark';
type Language = 'uk' | 'en';

interface AppState {
  theme: Theme;
  language: Language;
  isOnboarded: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setOnboarded: (onboarded: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  language: 'uk',
  isOnboarded: false,
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  setOnboarded: (isOnboarded) => set({ isOnboarded }),
}));
