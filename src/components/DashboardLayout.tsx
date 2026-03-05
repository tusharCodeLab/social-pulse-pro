import { Outlet } from 'react-router-dom';
import { AppSidebar } from './navigation/AppSidebar';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      
      <AppSidebar />
      <main className="ml-[280px] min-h-screen transition-all duration-300 relative">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
