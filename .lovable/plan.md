

## Remove Smart Fallbacks, Use Strict Real Data

The previous implementation added "smart fallback" logic in three places that substitutes interactions (likes+comments) when reach is 0. You want strict real data only -- if reach is 0, show 0.

### Changes

**1. `src/hooks/useCrossPlatformData.ts`**
- `usePlatformComparison` (line 63-66): Remove `totalInteractions` fallback. Use `rawReach` directly as `totalReach`.
- `useReachTrends` (line 113-114): Remove fallback. Use `post.reach || 0` directly as the chart value. Also remove `likes_count, comments_count` from the select query (line 98).

**2. `src/services/api/socialApi.ts`**
- `getDashboardSummary` (line 644-646): Remove fallback. Use `rawReach` directly as `totalReach`.
- `avgEngagementRate` (line 648-652): Remove the `totalFollowers`-based fallback calculation. Use only the stored `engagement_rate` from the database.

**3. `src/pages/Dashboard.tsx`**
- Line 199: Change label back from "Reach / Interactions" to "Reach".
- Line 214: Change title back from "Reach & Interactions" to "Reach Trends".
- Line 215: Update subtitle to "Reach across all platforms over time".

