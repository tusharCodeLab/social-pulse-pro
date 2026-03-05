

# Sidebar Restructure and Cleanup

## What Changes

### 1. Remove Non-Working Features
- **Remove the Reports page** (`/reports` route, `Reports.tsx`) -- it's a "Coming Soon" placeholder with no functionality
- **Remove the Reports entry** from the sidebar navigation

### 2. Reorganize Sidebar into Grouped Sections
Instead of a flat list of 7 items, organize into logical groups with section labels:

```text
+-------------------------------+
|  [Logo] Analytics             |
|          Social Dashboard     |
+-------------------------------+
|  [AI-Powered badge]           |
+-------------------------------+
|                               |
|  OVERVIEW                     |
|    Dashboard                  |
|                               |
|  ANALYTICS                    |
|    Posts Analysis              |
|    Audience Insights           |
|    Sentiment                   |
|                               |
|  AI & TOOLS                   |
|    AI Tools                    |
|                               |
|  ACCOUNT                      |
|    Settings                    |
|                               |
+-------------------------------+
|  [User info]                  |
|  [Sign Out]                   |
|  [Collapse]                   |
+-------------------------------+
```

### 3. Files to Modify
- **`src/components/navigation/AppSidebar.tsx`** -- Replace flat `navItems` array with grouped sections; add section labels that hide when collapsed
- **`src/App.tsx`** -- Remove the `/reports` route
- **`src/pages/Reports.tsx`** -- Delete this file

### 4. Files Unchanged
- `SidebarNavLink.tsx` -- Works as-is, no changes needed
- `DashboardLayout.tsx` -- No changes needed
- All other pages remain intact

## Technical Details

**AppSidebar.tsx changes:**
- Replace the single `navItems` array with a grouped structure:
  ```ts
  const navGroups = [
    { label: 'Overview', items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }] },
    { label: 'Analytics', items: [
      { to: '/posts', icon: FileText, label: 'Posts Analysis' },
      { to: '/audience', icon: Users, label: 'Audience Insights' },
      { to: '/sentiment', icon: Heart, label: 'Sentiment' },
    ]},
    { label: 'AI & Tools', items: [{ to: '/ai-tools', icon: Brain, label: 'AI Tools' }] },
    { label: 'Account', items: [{ to: '/settings', icon: Settings, label: 'Settings' }] },
  ];
  ```
- Render each group with a small uppercase label (hidden when sidebar is collapsed) and its nav items below
- Remove `BarChart3` import (was for Reports)

**App.tsx changes:**
- Remove `import Reports` and the `/reports` route

**Reports.tsx:**
- Delete the file entirely
