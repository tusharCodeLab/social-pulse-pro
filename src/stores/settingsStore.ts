import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface SettingsState {
  connectedPlatforms: string[];
  theme: Theme;
  togglePlatform: (platform: string) => void;
  setTheme: (theme: Theme) => void;
}

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(theme);
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      connectedPlatforms: [],
      theme: 'dark',
      togglePlatform: (platform) =>
        set((state) => ({
          connectedPlatforms: state.connectedPlatforms.includes(platform)
            ? state.connectedPlatforms.filter((p) => p !== platform)
            : [...state.connectedPlatforms, platform],
        })),
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: 'analytics-settings',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);
