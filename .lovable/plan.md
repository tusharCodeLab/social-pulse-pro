

## Fix: Prevent Sidebar from Remounting on Navigation

### Problem
Every page renders `<DashboardLayout>` individually, which contains `<AppSidebar>`. When navigating between routes, React unmounts the old page and mounts the new one, causing the entire sidebar to remount -- resetting its state (collapsed, expanded platforms) and replaying its entry animation. This feels like a "refresh."

### Solution
Move `DashboardLayout` into a shared layout route in `App.tsx` using React Router's `<Outlet>`, so it mounts once and persists across all dashboard pages. Remove `<DashboardLayout>` wrapping from every individual page component.

### Changes

**1. `src/components/DashboardLayout.tsx`**
- Import `Outlet` from `react-router-dom`
- Remove `children` prop; render `<Outlet />` instead
- Remove the `initial` animation on `motion.main` (no fade-in on every navigation) -- keep it as a plain `div` or use `layout` animation only

**2. `src/App.tsx`**
- Create a layout route: `<Route element={<DashboardLayout />}>` that wraps all protected dashboard routes
- Each child route renders just `<ProtectedRoute><PageComponent /></ProtectedRoute>`

**3. All 15 page files** (Dashboard, PostsAnalysis, AudienceInsights, Sentiment, Trends, YouTubeAnalytics, YouTubePostsAnalysis, YouTubeAudience, YouTubeSentiment, YouTubeTrends, FacebookAnalytics, FacebookPosts, FacebookAudience, Settings, ContentCalendar)
- Remove `import { DashboardLayout }` 
- Remove the `<DashboardLayout>` / `</DashboardLayout>` wrapper, keeping the inner content as-is

This ensures the sidebar is rendered once and never remounts during navigation, preserving its state (collapsed, expanded sections, scroll position).

