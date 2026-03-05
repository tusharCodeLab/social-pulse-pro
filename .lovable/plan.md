

## Plan: Final Professional Polish Pass

After reviewing all 16+ pages, the core analytics pages (Overview, Posts, Audience, Sentiment, Trends) are already at a strong professional level with EnhancedMetricCards, sparklines, animations, and AI features. The remaining gaps are in the **Home**, **Auth**, **Settings**, and **Content Calendar** pages, plus a few cross-cutting enhancements.

### What Still Needs Upgrading

**1. Home Page (`src/pages/Home.tsx`)**
- Add animated stats counters in the hero section (e.g., "10K+ Users", "3 Platforms", "AI-Powered")
- Add a platform logo strip (Instagram, YouTube, Facebook icons in a row with subtle animation)
- Add a dashboard preview mockup section (glass-card with fake chart/metric previews)
- Add a testimonial/social proof strip
- Add a "How It Works" 3-step section with numbered steps and icons

**2. Auth Page (`src/pages/Auth.tsx`)**
- Add animated stat counters on the right visual panel instead of static cards
- Add a subtle animated gradient background (CSS animation, not framer)
- Add social proof text ("Join 10,000+ marketers")
- Add a password strength indicator for signup

**3. Settings Page (`src/pages/Settings.tsx`)**
- Add a Profile section showing current user email and name
- Add a "Data Management" section with export/clear data options
- Add a "Notification Preferences" section (toggle notifications for milestones, weekly digest)
- Add an "Account" section with sign-out and delete account options
- Add sync status indicators (last synced time per platform)
- Upgrade layout with proper section dividers and icons

**4. Content Calendar (`src/pages/ContentCalendar.tsx`)**
- Add month view toggle (week/month switch)
- Add a posting frequency heatmap strip above the calendar
- Add platform filter buttons to show/hide specific platform items
- Add a "This Week's Summary" bar showing content type breakdown

### Cross-Cutting Enhancements

**5. Premium Loading States**
- Create a shared `DashboardSkeleton` component with shimmer cards matching the metric card layout
- Replace all `<Loader2 className="animate-spin" />` full-page loaders with skeleton layouts in overview pages

**6. Data Export Buttons**
- Add "Export CSV" button to all Posts Analysis and Audience pages (client-side CSV generation from existing data)

### Files Changed
- `src/pages/Home.tsx` -- hero upgrade + new sections
- `src/pages/Auth.tsx` -- visual enhancements + password strength
- `src/pages/Settings.tsx` -- full rewrite with profile, data mgmt, notifications sections
- `src/pages/ContentCalendar.tsx` -- month view + frequency heatmap + platform filter
- `src/components/dashboard/DashboardSkeleton.tsx` -- new shared skeleton component
- `src/pages/PostsAnalysis.tsx` -- add CSV export button
- `src/pages/AudienceInsights.tsx` -- add CSV export button

No database changes needed.

