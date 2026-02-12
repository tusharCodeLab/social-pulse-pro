import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  Heart,
  Brain,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  LogOut,
  Zap,
} from 'lucide-react';
import { SidebarNavLink } from './SidebarNavLink';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/posts', icon: FileText, label: 'Posts Analysis' },
  { to: '/audience', icon: Users, label: 'Audience Insights' },
  { to: '/sentiment', icon: Heart, label: 'Sentiment' },
  { to: '/ai-tools', icon: Brain, label: 'AI Tools' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border',
        'flex flex-col z-50 backdrop-blur-xl'
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Logo Section */}
      <div className="relative p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{
              boxShadow: '0 4px 20px -4px hsl(var(--primary) / 0.5)',
            }}
          >
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl" />
          </motion.div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-bold text-foreground text-lg tracking-tight">Analytics</h1>
                <p className="text-xs text-muted-foreground">Social Dashboard</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Badge */}
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative px-5 py-4"
          >
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/15 to-chart-reach/10 border border-primary/20"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
              </motion.div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-primary">AI-Powered</span>
                <p className="text-[10px] text-muted-foreground">Smart analytics enabled</p>
              </div>
              <Zap className="h-3 w-3 text-chart-impressions" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <SidebarNavLink
              to={item.to}
              icon={item.icon}
              label={item.label}
              collapsed={collapsed}
            />
          </motion.div>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="relative p-4 border-t border-sidebar-border space-y-2">
        {/* User Info */}
        <AnimatePresence mode="wait">
          {!collapsed && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 py-2.5 rounded-xl bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-reach flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {user.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
            'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
            'transition-all duration-200',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </motion.button>

        {/* Collapse Toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl',
            'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent',
            'transition-all duration-200 border border-transparent hover:border-border'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}
