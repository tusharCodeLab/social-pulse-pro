

## Redesign Dashboard Layout (Reference-Inspired)

Inspired by the uploaded reference, the dashboard will be restructured into a more polished, information-dense layout while keeping the existing data hooks and strict real-data policy.

### Key Layout Changes

**1. Enhanced Header Row**
- Keep welcome message + sentiment donut, but make the sentiment display larger and more prominent with a label like "Overall Sentiment: Positive (X%)"
- Make the top metrics row (Followers, Engagement, Reach, Posts) use pill/rounded-card styling with larger typography

**2. Main Content: 2-Column Layout (65/35 split)**
- **Left column**: "Combined User Reach" area chart, taller (350px), with a time period selector dropdown ("Last 30 Days") in the card header
- **Right column**: Richer platform cards stacked vertically, each with:
  - Platform-colored left border/accent
  - Platform-specific metrics (Likes, Comments, Engagement %, Followers)
  - Post count badge in top-right corner
  - More detailed stats grid (3-4 metrics per card instead of current 2+1)

**3. Improved Platform Cards**
- Instagram card: Show Likes total, Comments total, Engagement %, posts count badge
- YouTube card: Show Subscribers, Views (impressions), Engagement %
- Facebook card: Show Page Likes (followers), Reach, Engagement %
- Each card gets a subtle platform-colored border on the left side for visual distinction

**4. AI Performance Digest** stays below the main grid, unchanged.

**5. Remove the 5th "Positive" metric** from top row (already shown in sentiment donut), replace with "Avg Engagement" rate.

### Files to Change

- **`src/pages/Dashboard.tsx`**: Restructure layout, enhance MiniStat styling to pill/rounded look, redesign PlatformCard with richer metrics and post count badge, add time period selector UI element to reach chart header, increase chart height, improve sentiment donut display.

### Data — No Hook Changes Needed
All data is already available from existing hooks (`usePlatformComparison`, `useReachTrends`, `useDashboardSummaryApi`, `useSentimentStatsApi`). The `PlatformMetrics` interface already includes `totalReach`, `totalImpressions`, `postsCount`, `avgEngagementRate`, `followers`. We also have `likes_count` and `comments_count` totals available. We'll add those to the platform comparison query select to show per-platform likes/comments totals.

- **`src/hooks/useCrossPlatformData.ts`**: Add `totalLikes` and `totalComments` to `PlatformMetrics` and compute them in `usePlatformComparison`.

