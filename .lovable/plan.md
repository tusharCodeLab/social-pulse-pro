

## Plan: Add Light/Dark Theme Toggle with Professional Light Theme

Currently the app is dark-only with no theme switching. Will add a proper light theme and a toggle in Settings + sidebar.

### Changes

**1. `src/index.css`** — Add a `.light` class (or default `:root` as light, `.dark` as dark)
- Add complete light theme CSS variables under a `.light` selector covering all `--background`, `--card`, `--primary`, `--border`, `--sidebar-*`, `--chart-*`, `--shadow-*`, and `--gradient-*` variables
- Professional light palette: clean whites, soft grays, maintain the teal primary accent

**2. `src/stores/settingsStore.ts`** — Add `theme` state
- Add `theme: 'dark' | 'light'` with `setTheme` action
- Persist in localStorage alongside existing settings
- On load, apply the class to `document.documentElement`

**3. `src/App.tsx`** — Apply theme class on mount
- Read theme from store and apply `dark`/`light` class to `<html>` element via a small `useEffect`

**4. `src/pages/Settings.tsx`** — Add "Appearance" section
- New card between Profile and Connected Platforms with a toggle switch for Light/Dark mode
- Include Sun/Moon icon indicator

**5. `src/components/navigation/AppSidebar.tsx`** — Add quick theme toggle button
- Small Sun/Moon icon button in the sidebar footer for fast switching

### Light Theme Color Palette
- Background: white/gray-50
- Cards: white with subtle gray borders
- Text: gray-900 foreground, gray-500 muted
- Primary: same teal (173 80% 40%) adjusted for light contrast
- Sidebar: gray-50/white with teal accents
- Shadows: soft gray instead of dark

