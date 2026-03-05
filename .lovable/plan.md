

## Plan: Display Post Images Professionally Across All 3 Platforms

### Current State
All three post analysis pages (Instagram `PostsAnalysis.tsx`, Facebook `FacebookPosts.tsx`, YouTube `YouTubePostsAnalysis.tsx`) display posts as plain text rows in tables. The `media_url` field exists in the database and is mapped to `mediaUrl` in the API layer, but none of the pages render the actual post image/thumbnail.

### Changes

#### 1. Instagram Posts (`src/pages/PostsAnalysis.tsx`)
Update the "Top Performing Posts" table (line ~496-506) to show a thumbnail image next to the post content:
- Add an image thumbnail column (48x48 rounded) before the text content
- Use `post.mediaUrl` with a fallback placeholder icon when no image
- Use `aspect-ratio` for consistent sizing

#### 2. Facebook Posts (`src/pages/FacebookPosts.tsx`)
Redesign from a plain table to a card grid layout matching the premium aesthetic:
- Each post as a card with image thumbnail (if `media_url` exists), content preview, type badge, and metrics row (likes, comments, shares, date)
- Fallback to a platform icon placeholder when no image

#### 3. YouTube Posts (`src/pages/YouTubePostsAnalysis.tsx`)
Update the "Top Performing Videos" table (line ~148-163) to show video thumbnails:
- Add thumbnail column using `media_url` (YouTube stores thumbnail URLs)
- Show a 16:9 aspect ratio thumbnail before video title
- Fallback to a Film icon placeholder

#### Shared Pattern
All three pages will use the same thumbnail rendering approach:
- If `media_url`/`mediaUrl` exists: render `<img>` with `object-cover`, rounded corners, subtle border
- If not: render a styled placeholder with the platform icon
- Images use `loading="lazy"` and `onError` fallback to placeholder

