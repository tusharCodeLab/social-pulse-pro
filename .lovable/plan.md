

## Fix: Clean Up Stale YouTube Data When Switching Channels

### Root Cause

The user's actual channel is `@studywithfun4065` (2 subscribers), but the database contains videos from a previously synced channel (Raj Shamani -- millions of views). This happened because:

1. The `social_accounts` table upserts on `user_id,platform`, so switching channels correctly updates the account record
2. But the `posts` table upserts on `user_id,external_post_id` -- old posts from the previous channel are never deleted, they just accumulate
3. The YouTube Overview page aggregates ALL YouTube posts for the user, so it shows totals from both channels combined

The displayed 30.3M views, 885.2K likes, etc. are from the old Raj Shamani sync, not from the user's actual channel.

### Fix

**`supabase/functions/fetch-youtube/index.ts`** -- Add a cleanup step after upserting the social account but before inserting new posts:

1. After Step 2 (social account upsert), delete all existing YouTube posts for this user that were created before the current sync. This ensures that when a user switches channels, stale data from the previous channel is removed.
2. Also delete associated comments for those posts (cascade should handle this if FK is set, but explicit delete as safety).

Specifically, add between Step 3 and Step 4:
```
// Step 3.5: Clean up old posts from previous channel syncs
await supabase.from('post_comments')
  .delete()
  .eq('user_id', userId)
  .in('post_id', 
    (select post IDs where platform = youtube and user_id = userId)
  );

await supabase.from('posts')
  .delete()
  .eq('user_id', userId)
  .eq('platform', 'youtube');
```

This is a simple delete-before-insert pattern. Since we're about to upsert all current videos anyway, clearing old data first ensures only real data from the currently connected channel exists.

### What This Fixes
- YouTube Overview metrics (views, likes, comments, video count) will only reflect the user's actual connected channel
- Charts and tables will show correct per-video data
- Dashboard cross-platform cards will show accurate YouTube numbers

### No Frontend Changes Needed
The `YouTubeAnalytics.tsx` page and hooks are correct -- they simply aggregate whatever is in the `posts` table. The problem is the data, not the display logic.

