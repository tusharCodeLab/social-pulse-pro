

## Cross-Platform Analytics Dashboard

### What it is
A new dedicated page at `/cross-platform` that provides a unified view of Instagram, YouTube, and Facebook data side-by-side. This is distinct from the existing `/dashboard` which shows aggregated totals -- this page focuses on **platform comparison and reach analysis**.

### What to build (only meaningful features)

**1. Platform Comparison Cards (3 cards)**
Each card shows one platform's key reach metrics: total reach, impressions, posts count, and followers. Uses real data from the `posts` and `social_accounts` tables filtered by platform. Includes platform icon and brand color. This is meaningful because users need to quickly see which platform is performing best.

**2. Multi-Line Reach Trend Chart**
A Recharts LineChart with 3 lines (one per platform) showing reach over time, grouped by date from the `posts` table. This is the core value -- seeing reach trends across platforms on one chart reveals which platform is growing or declining.

**3. Platform Distribution Donut**
A pie/donut chart showing what % of total reach comes from each platform. Useful for understanding content distribution balance.

**4. Top Content by Reach**
A ranked list of the top 5 posts across all platforms sorted by reach, showing thumbnail, platform badge, content snippet, and reach number. This answers "what's my best-performing content regardless of platform?"

**5. Engagement Rate Comparison**
A bar chart comparing average engagement rate per platform. This is more actionable than raw numbers since it normalizes for audience size.

**6. AI Cross-Platform Insights**
Display existing AI insights from `ai_insights` table grouped/filtered to show cross-platform patterns. No new edge function needed -- just surface existing insights in a cross-platform context.

### What NOT to add
- Growth metrics over time (insufficient historical data in `audience_metrics` to be reliable across all 3 platforms)
- Audience overlap analysis (no data source for this)
- Content calendar integration (already exists as separate page)

### Implementation

**New file: `src/pages/CrossPlatformAnalytics.tsx`**
- Queries `posts` table 3 times (one per platform) for reach/engagement data
- Queries `social_accounts` for follower counts per platform
- Queries `ai_insights` for cross-platform insights
- Uses existing hooks: `usePostsApi`, `usePostStatsApi`, `useSocialAccountsApi`, `useAIInsightsApi`
- Or direct Supabase queries for platform-filtered aggregations

**New hook: `src/hooks/useCrossPlatformData.ts`**
- `usePlatformReachComparison()` -- fetches posts grouped by platform with reach sums
- `useReachTrends()` -- fetches posts by date per platform for the line chart
- `useTopContentByReach()` -- fetches top 5 posts across all platforms sorted by reach

**Route & Navigation:**
- Add route `/cross-platform` in `App.tsx`
- Add nav link in `AppSidebar.tsx` under "General Overview" section, next to Dashboard

**Layout:** Uses existing `DashboardLayout`, `Card`, Recharts, Framer Motion, and the premium aesthetic already established.

