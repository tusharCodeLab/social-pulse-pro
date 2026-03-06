import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, TrendingUp } from 'lucide-react';
import { AppSidebar } from './navigation/AppSidebar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  // Use 1024px as the sidebar breakpoint (lg)
  const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth < 1024 : isMobile;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar variant="fixed" />
      </div>

      {/* Mobile top header */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 h-14 bg-sidebar/95 backdrop-blur-xl border-b border-sidebar-border">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-sidebar-accent text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-sm tracking-tight">Analytics</span>
        </div>
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[280px] border-r border-sidebar-border">
          <VisuallyHidden><SheetTitle>Navigation</SheetTitle></VisuallyHidden>
          <AppSidebar variant="sheet" onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="lg:ml-[280px] min-h-screen transition-all duration-300 relative">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
