import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  connectedPlatforms: string[];
  togglePlatform: (platform: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      demoMode: true,
      setDemoMode: (enabled) => set({ demoMode: enabled }),
      connectedPlatforms: ['twitter', 'instagram', 'facebook', 'linkedin'],
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
