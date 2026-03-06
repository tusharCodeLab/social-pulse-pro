

## Replace AI Content Suggestions with Category-Based Trending Topics

### What Changes
Replace the current "AI Content Suggestions" (which generates content ideas from user data) with a **category browser** that shows real-world trending topics people are talking about globally.

### Flow
1. User sees a grid of **category cards** (Technology, Health & Fitness, Entertainment, Business, Travel, Food, Fashion, Education, Sports, Finance)
2. Clicking a category calls a new edge function that uses AI to return **10 currently trending real-world topics** in that category
3. Each topic displays as a card with title, brief context, and why it's trending
4. Clicking a topic feeds it into `generateForTopic()` to proceed to Step 2

### New Edge Function: `ai-trending-topics`
- Accepts `{ category: string }` in the body
- Uses Lovable AI gateway (`google/gemini-3-flash-preview`) to generate current trending topics for the given category
- Uses structured output (tool calling) to return an array of topics with: `title`, `context` (1-2 sentences about the topic), `whyTrending` (why it's hot right now)
- No database dependency — purely AI-generated based on current knowledge

### UI Changes in `InstagramContentStudio.tsx` (Step 1)
- Keep the custom topic input at top
- Replace the "AI Content Suggestions" section with:
  - **Category grid**: 10 categories as clickable cards with icons
  - **Selected category state**: When a category is clicked, show a loading state then display trending topic cards below
  - **Topic cards**: Title, context, why trending, and "Create Content" action
  - **Back to categories** button to browse another category
- Keep the "Detected Trends" section below as secondary

### Categories
Technology, Health & Fitness, Entertainment, Business & Finance, Travel, Food & Cooking, Fashion & Beauty, Education, Sports, Science & Environment

### Files Modified
- `supabase/functions/ai-trending-topics/index.ts` — new edge function
- `src/pages/InstagramContentStudio.tsx` — replace AI suggestions with category-based trending topics UI

