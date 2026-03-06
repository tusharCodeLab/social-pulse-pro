

## YouTube Content Studio

### Overview
Create a new YouTube Content Studio page with a **4-step flow**:
1. **Format Selection** — Video or Short (new step unique to YouTube)
2. **Topic Selection** — Same category grid + custom input as Instagram
3. **Content Generation** — Two A/B versions with scripts tailored to the chosen format
4. **Strategy & Deep-Dive** — Publishing strategy + topic explanation

### Files to Create/Modify

**1. `src/pages/YouTubeContentStudio.tsx`** (new file)
- Adapted from `InstagramContentStudio.tsx` with these key differences:
  - Step 1 shows two large cards: "YouTube Video" (long-form) and "YouTube Short" (≤60s vertical)
  - Selected format is stored in state and passed to the edge function so AI generates format-appropriate content (full scripts vs punchy short scripts)
  - Step indicator shows 4 steps instead of 3
  - All edge function calls pass `platform: 'youtube'` and include `format: 'video' | 'short'`
  - Header/branding uses YouTube styling

**2. `src/App.tsx`**
- Add route `/youtube-content-studio` → `YouTubeContentStudio`

**3. `src/components/navigation/AppSidebar.tsx`**
- Add "Content Studio" nav item under YouTube section: `{ to: '/youtube-content-studio', icon: Sparkles, label: 'Content Studio' }`

**4. `supabase/functions/ai-content-studio/index.ts`**
- Update the content generation action to accept an optional `format` field (`'video'` or `'short'`)
- Adjust the AI prompt: when format is `'short'`, instruct generation of punchy ≤60s vertical content; when `'video'`, generate full-length video scripts with intro/body/outro structure
- Update publishing-strategy action to incorporate format context

### Flow Detail
```text
Step 1: Format        Step 2: Topic         Step 3: Versions      Step 4: Strategy
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Video │ Short│ --> │ Categories   │ --> │  Version A   │ --> │ Deep-Dive    │
│              │     │ + Custom     │     │  Version B   │     │ Best Times   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### No new edge functions needed
The existing `ai-content-studio` and `ai-trending-topics` functions are reused — only the prompt in `ai-content-studio` is adjusted to be format-aware.

