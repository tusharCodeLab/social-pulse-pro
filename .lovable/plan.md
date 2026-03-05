

## Audit: Fix All Pages to Work Properly with Real Data

After reviewing every page, hook, edge function, and navigation link, here are the issues found and the fixes needed.

### Issues Found

**1. Content Calendar missing from sidebar navigation**
The Content Calendar page exists at `/content-calendar` and works, but there is no link to it in the sidebar (`AppSidebar.tsx`). Users cannot discover or access it without typing the URL.

**2. YouTube Audience page has hardcoded zero metrics**
`YouTubeAudience.tsx` lines 56-58 hardcode "New This Week" as `+0`, "Growth Rate" as `0%`, and "Avg Views/Video" as `0` instead of computing from real data (videos and audience_metrics table).

**3. YouTube Sentiment page lacks AI analysis capability**
`YouTubeSentiment.tsx` only displays raw comment sentiment counts but has no "Analyze Comments" button to trigger AI sentiment analysis (unlike the Instagram Sentiment page which calls `useAnalyzeSentimentApi`). Users can see the page but cannot actually analyze YouTube comments.

**4. Trend detection ignores platform parameter**
`useDetectTrends` in `useAIFeatures.ts` does not pass a `platform` parameter to the `detect-trends` edge function. Both Instagram Trends and YouTube Trends pages call the same function and get the same results, making the YouTube Trends page a duplicate rather than YouTube-specific.

**5. Spam detection not platform-filtered**
`useSpamComments` fetches all spam comments regardless of platform. The Instagram Sentiment page shows YouTube spam comments mixed in and vice versa.

**6. Settings page "coming soon" text is wrong**
Line 280 says "Twitter, Facebook, LinkedIn, and TikTok integrations are in development" but Facebook is already fully supported. This confuses users.

**7. Home page only mentions Instagram**
The landing page feature descriptions only reference Instagram, not the multi-platform (YouTube, Facebook) capabilities that exist.

### Plan

**File: `src/components/navigation/AppSidebar.tsx`**
- Add Content Calendar link under a new "Tools" section (between Platform Breakdown and Account) with Calendar icon.

**File: `src/pages/YouTubeAudience.tsx`**
- Compute "New This Week" from audience_metrics or approximate from videos.
- Compute "Growth Rate" from subscriber data.
- Compute "Avg Views/Video" from total views / video count.

**File: `src/pages/YouTubeSentiment.tsx`**
- Add "Analyze Comments" button that calls `useAnalyzeSentimentApi` with YouTube platform filter.
- Add "Scan for Spam" button similar to Instagram Sentiment page.

**File: `src/hooks/useAIFeatures.ts`**
- Update `useDetectTrends` to accept an optional `platform` parameter and pass it to the edge function body.
- Update `useSpamComments` to accept an optional `platform` parameter and filter by joining through post_id to posts table (or by adding a platform-aware query).

**File: `src/pages/Trends.tsx`**
- Pass `'instagram'` platform to `useDetectTrends`.

**File: `src/pages/YouTubeTrends.tsx`**
- Pass `'youtube'` platform to `useDetectTrends`.

**File: `src/pages/Settings.tsx`**
- Fix "coming soon" text to remove Facebook from the list, keep only "Twitter, LinkedIn, and TikTok".

**File: `src/pages/Home.tsx`**
- Update feature descriptions to mention multi-platform support (Instagram, YouTube, Facebook) instead of Instagram-only.

**File: `supabase/functions/detect-trends/index.ts`**
- Accept optional `platform` parameter from request body and filter posts query by platform when provided.

