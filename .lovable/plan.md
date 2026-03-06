

## Make Dashboard Fully Responsive

### Problem
- Sidebar is fixed 280px with hard `ml-[280px]` on main — no mobile/tablet support
- No hamburger menu or slide-in drawer for small screens
- Dashboard header has `flex` row that breaks on mobile (sentiment badge, refresh button overflow)
- Various grid layouts don't adapt below `lg` breakpoint

### Approach
Use existing `useIsMobile` hook and Sheet component for a mobile sidebar drawer. No redesign — only layout adaptability.

### Files to Modify

**1. `src/components/DashboardLayout.tsx`**
- Import `useIsMobile`, `Sheet`, `Menu` icon, and state
- On mobile/tablet (`< 1024px`): hide the fixed sidebar, show a top header bar with hamburger trigger that opens `AppSidebar` inside a `Sheet` (slide from left)
- On desktop: keep current fixed sidebar + `ml-[280px]`
- Main content: `ml-0` on mobile, `ml-[280px]` on desktop (or dynamic based on collapsed state)

**2. `src/components/navigation/AppSidebar.tsx`**
- Accept an optional `onNavigate` callback prop — called after any nav link click so the mobile Sheet can close
- Accept optional `variant` prop (`'fixed' | 'sheet'`) to control positioning — when `'sheet'`, remove `fixed left-0 top-0` classes (Sheet handles positioning)

**3. `src/pages/Dashboard.tsx`**
- Header section: wrap in responsive flex — stack on mobile, row on desktop
- Hide sentiment mini-donut on small screens (`hidden md:flex`)
- Metric cards grid: `grid-cols-2` stays fine for mobile
- Reach chart height: reduce from `h-[300px]` to `h-[200px] md:h-[300px]`
- Period selector buttons: use `flex-wrap` for small screens

**4. `src/pages/InstagramOverview.tsx`**
- Ensure grid layouts use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` pattern
- Charts: responsive heights

**5. `src/pages/Settings.tsx`**
- Platform connection cards: responsive grid
- Form inputs: full width on mobile

**6. Global pattern for all page files**
- Scan for any hardcoded widths or grids that don't have mobile breakpoints
- Add `overflow-x-hidden` where needed to prevent horizontal scroll

### Key Implementation Details
- Use `lg:ml-[280px]` (1024px+) as the sidebar breakpoint — matches typical tablet/desktop split
- Mobile header: sticky top bar with hamburger icon + app logo, ~48px height
- Sheet opens from left with the full `AppSidebar` content inside
- Add `overflow-x-hidden` to the root layout container
- Reduce padding on mobile: `p-4 lg:p-8`

