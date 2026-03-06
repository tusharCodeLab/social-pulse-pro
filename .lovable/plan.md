

## Make Recent Activity Section Work Properly & Professionally

### Current State
The ActivityFeed component displays AI insights from the `ai_insights` table, but it's passive — no way to mark items as read, no ability to generate insights from the dashboard, no "mark all read" action, and limited interactivity. The data fetch works but the UX is bare.

### Plan

#### 1. Enhance ActivityFeed Component (`src/components/dashboard/ActivityFeed.tsx`)
- Add a **"Mark all read"** button in the header that updates `is_read = true` for all user insights
- Add **click-to-mark-read** on individual items (clicking an insight marks it as read)
- Add **platform badge** next to each insight showing which platform it relates to (Instagram/YouTube/Facebook icon)
- Add **priority indicator** — color-coded left border or badge (high = red, medium = amber, low = green)
- Add a **"Generate Insights"** button in the empty state and header that triggers the existing `generate-insights` edge function
- Show a **loading state** while generating insights
- Add **"View all"** expansion — show 5 by default with a "Show more" button to reveal all
- Add **smooth animations** for items appearing/disappearing when marked as read

#### 2. Wire Up Insight Generation from Dashboard (`src/pages/Dashboard.tsx`)
- Pass a `onGenerateInsights` callback to ActivityFeed that calls the `generate-insights` edge function
- Use existing mutation pattern with toast feedback on success/failure
- Invalidate the `cross-platform-insights` query after generation

#### 3. Visual Polish
- Add a subtle gradient header bar to the card
- Use platform-colored icons (Instagram pink, YouTube red, Facebook blue) for platform-specific insights
- Add hover expand on description (remove `line-clamp-1` on hover to show full text)
- Add a timestamp divider grouping ("Today", "Yesterday", "Earlier")

### Files to Modify
- `src/components/dashboard/ActivityFeed.tsx` — Main rewrite with all enhancements
- `src/pages/Dashboard.tsx` — Wire up generate insights callback

