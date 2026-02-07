import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  connectedPlatforms: string[];
  togglePlatform: (platform: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      connectedPlatforms: [],
      togglePlatform: (platform) =>
        set((state) => ({
          connectedPlatforms: state.connectedPlatforms.includes(platform)
            ? state.connectedPlatforms.filter((p) => p !== platform)
            : [...state.connectedPlatforms, platform],
        })),
    }),
    {
      name: 'analytics-settings',
    }
  )
);
