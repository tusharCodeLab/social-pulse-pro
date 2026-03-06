

## Add Average View Duration Chart to YouTube Posts Analysis

### Problem
The `posts` table has no `duration_seconds` column, and the `fetch-youtube` edge function already fetches `contentDetails` (which includes ISO 8601 duration like `PT4M13S`) but doesn't store it.

### Plan

#### 1. Database Migration
Add a `duration_seconds` integer column to the `posts` table (nullable, default null). Only YouTube videos will populate this.

```sql
ALTER TABLE public.posts ADD COLUMN duration_seconds integer;
```

#### 2. Update `fetch-youtube` Edge Function
- Parse the ISO 8601 duration from `v.contentDetails.duration` (e.g. `PT4M13S` → 253 seconds)
- Store it in the new `duration_seconds` field during post upsert

#### 3. Add Chart to `src/pages/YouTubePostsAnalysis.tsx`
- Compute average view duration per video from `duration_seconds`
- Add a new `AreaChart` or `BarChart` showing duration per video (formatted as `MM:SS`)
- Place it in the charts grid alongside existing charts
- Include proper empty state handling

### Files Modified
- `posts` table — new column via migration
- `supabase/functions/fetch-youtube/index.ts` — parse & store duration
- `src/pages/YouTubePostsAnalysis.tsx` — new duration chart

