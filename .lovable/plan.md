

## Add Missing Facebook Sub-Pages (Sentiment + Trends)

Instagram has 4 sub-pages: Posts Analysis, Audience Insights, Sentiment, Trend Intelligence.
YouTube already matches this (plus an Overview page).
Facebook is missing **Sentiment** and **Trend Intelligence**.

### Changes

**1. Create `src/pages/FacebookSentiment.tsx`**
- Mirror the YouTube Sentiment page structure but for Facebook data
- Use `useFacebookComments()` from `useFacebookData.ts`
- Include "Analyze Comments" button (calls `useAnalyzeSentimentApi`)
- Include "Scan for Spam" button (calls `useDetectSpam`)
- Show sentiment metrics (Positive %, Neutral %, Negative %, Total Comments)
- Show spam filter section and recent comments list
- Facebook blue branding (#1877F2)

**2. Create `src/pages/FacebookTrends.tsx`**
- Mirror the YouTube Trends page structure but for Facebook data
- Use `usePersonalTrends('facebook')` and `useDetectTrends()` with `'facebook'` platform
- Include "Detect Trends" button
- Show trend cards with direction, confidence, type
- Include AI Content Strategy section
- Facebook blue branding

**3. Update `src/App.tsx`**
- Add routes: `/facebook-sentiment` and `/facebook-trends`

**4. Update `src/components/navigation/AppSidebar.tsx`**
- Add Sentiment (`Heart`) and Trend Intelligence (`Activity`) sub-items to the Facebook platform group

**5. Update `src/hooks/useFacebookData.ts`**
- The `useFacebookComments` hook already exists and works. No changes needed.

