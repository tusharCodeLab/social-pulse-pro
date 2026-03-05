

## Fix Dashboard to Work With Real Instagram Data

### Problem Analysis

The Instagram sync is actually **working correctly** -- the edge function successfully fetches 6 posts and 30 comments from @mr__tp99. However, the dashboard appears broken because:

1. **All reach/impressions are 0**: The Instagram Basic Display API does not return reach or impressions (requires `instagram_manage_insights` permission via Meta App Review). Every Instagram post has `reach: 0, impressions: 0`.
2. **Engagement rate is always 0.00**: The `fetch-instagram` function never calculates engagement rate -- it stores `0`.
3. **Reach chart is empty**: Since all reach values are 0, the "Combined User Reach" chart shows nothing.
4. **Realtime channels timeout**: Console logs show `TIMED_OUT` for all three realtime channels because realtime is not enabled on the database tables.

### Changes

**1. `supabase/functions/fetch-instagram/index.ts` -- Calculate engagement rate**
- After fetching posts, compute `engagement_rate = ((likes + comments) / followers) * 100` for each post (only when followers > 0).
- Store the calculated rate in the `posts` table during upsert.

**2. `src/services/api/socialApi.ts` -- Smart fallback metrics in `getDashboardSummary`**
- When `totalReach` is 0, fall back to `totalEngagement` (likes + comments + shares) as the "reach" display value.
- Calculate `avgEngagementRate` from individual post interactions when the stored rate is 0.

**3. `src/hooks/useCrossPlatformData.ts` -- Fix reach trends chart to show interactions**
- In `useReachTrends`, when a post's `reach` is 0, use `likes_count + comments_count` as the chart value so the area chart is not flat.
- In `usePlatformComparison`, when `totalReach` is 0 for a platform, fall back to summing `likes_count + comments_count` from the posts.

**4. Database migration -- Enable realtime on tables**
- Run: `ALTER PUBLICATION supabase_realtime ADD TABLE public.posts; ALTER PUBLICATION supabase_realtime ADD TABLE public.social_accounts; ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;`

**5. `src/pages/Dashboard.tsx` -- Label accuracy**
- Change the "Reach" metric label to "Reach / Interactions" when reach data is unavailable, so users understand the fallback.

### Result
- Dashboard metrics will show real non-zero values from synced Instagram data.
- The area chart will display interaction trends instead of a blank chart.
- Engagement rates will be calculated and visible per platform.
- Realtime subscriptions will work, enabling live UI updates when data changes.

