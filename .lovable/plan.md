

## Sidebar Navigation Restructure

Based on the reference image, the sidebar should be reorganized into a clear hierarchy with **platform-level grouping** (Instagram, YouTube) that expand to show sub-pages, plus top-level overview and AI tools sections.

### New Navigation Structure

```text
GENERAL OVERVIEW
  └─ Dashboard

PLATFORM BREAKDOWN
  ├─ Instagram          (collapsible ▸)
  │   ├─ Posts Analysis
  │   ├─ Audience Insights
  │   ├─ Sentiment
  │   └─ Trend Intelligence
  ├─ YouTube            (collapsible ▸)
  │   └─ YouTube Analytics
  └─ + Other Platforms  (link to Settings)

AI INTELLIGENCE TOOLS
  ├─ AI Content Calendar
  └─ Content Studio Hub (future placeholder or link)

ACCOUNT
  └─ Settings
```

### Implementation

**1. Refactor `AppSidebar.tsx`**
- Replace flat `navGroups` with a new structure that supports **collapsible platform groups** (Instagram, YouTube).
- Add `useState` for `expandedPlatforms` to track which platform sections are open.
- Instagram icon uses the existing camera/Instagram-style icon; YouTube uses the `Youtube` lucide icon.
- "Other Platforms" item links to `/settings` (where platform connections are managed).
- Clicking a platform header toggles its sub-items with `AnimatePresence` animation.
- When sidebar is collapsed, platform sub-items are hidden; only icons for top-level items show.

**2. Update `SidebarNavLink.tsx`**
- Add support for a new `CollapsibleNavGroup` component (or inline in AppSidebar) that renders a clickable platform header with a chevron, and expands/collapses child nav links with smooth animation.
- Sub-items get a subtle left indent (e.g., `pl-8`) to indicate hierarchy.

**3. No route changes needed** — all existing routes (`/dashboard`, `/posts`, `/audience`, `/sentiment`, `/trends`, `/youtube-analytics`, `/content-calendar`, `/settings`) remain the same. This is purely a sidebar layout restructure.

### Key Details
- Platform headers are **not links** themselves — they just expand/collapse sub-items
- The chevron rotates on expand (like the reference image shows `>` vs `v`)
- Keep the existing premium styling, AI badge, user section, and collapse toggle
- Remove the current flat "Analytics" group and redistribute items under their platform

