

## Fix Instagram Sentiment Analysis

### Root Cause

**Missing foreign key**: `post_comments.post_id` has no foreign key to `posts.id`. The Supabase JS client's `posts!inner(platform)` join syntax requires a declared FK relationship. Without it, all queries that filter comments by platform silently fail — meaning sentiment stats, comment lists, and sentiment trends return errors or empty data on the Instagram Sentiment page.

**No platform filtering on analyze**: `analyzeSentiment()` fetches ALL unanalyzed comments across all platforms (395 total, 370 unanalyzed) without filtering by platform.

### Plan

**1. Database migration — Add foreign key**
```sql
ALTER TABLE post_comments 
  ADD CONSTRAINT post_comments_post_id_fkey 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
```
This enables all `posts!inner(platform)` joins to work correctly for sentiment stats, comment listing, and trend queries across all platform pages.

**2. `src/services/api/socialApi.ts` — Platform-aware analyze**
- Update `analyzeSentiment(platform?: SocialPlatform)` to accept optional platform
- When platform provided, join through `posts!inner(platform)` to fetch only unanalyzed comments for that platform
- Pass platform to edge function body for logging

**3. `src/hooks/useSocialApi.ts` — Pass platform through**
- Update `useAnalyzeSentimentApi()` to accept optional platform parameter
- Pass it to `socialApi.comments.analyzeSentiment(platform)`

**4. `src/pages/Sentiment.tsx` — Pass 'instagram'**
- Call `useAnalyzeSentimentApi('instagram')` and pass platform to `mutateAsync`

**5. Similarly update YouTube and Facebook sentiment pages**
- `YouTubeSentiment.tsx` passes `'youtube'`
- `FacebookSentiment.tsx` passes `'facebook'`
- `SentimentSection.tsx` (dashboard) works without platform (all comments)

