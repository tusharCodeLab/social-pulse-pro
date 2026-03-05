import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  Heart,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  TrendingUp,
  LogOut,
  Zap,
  Plus,
  Sun,
  Moon,
} from 'lucide-react';
import { InstagramIcon, YouTubeIcon, FacebookIcon } from '@/components/icons/PlatformIcons';
import { SidebarNavLink } from './SidebarNavLink';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSettingsStore } from '@/stores/settingsStore';

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
}

interface PlatformGroup {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  items: NavItem[];
}

const overviewItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
];

const platformGroups: PlatformGroup[] = [
  {
    key: 'instagram',
    icon: InstagramIcon,
    label: 'Instagram',
    color: '',
    items: [
      { to: '/instagram-overview', icon: LayoutDashboard, label: 'Instagram Overview' },
      { to: '/posts', icon: FileText, label: 'Posts Analysis' },
      { to: '/audience', icon: Users, label: 'Audience Insights' },
      { to: '/sentiment', icon: Heart, label: 'Sentiment' },
      { to: '/trends', icon: Activity, label: 'Trend Intelligence' },
    ],
  },
  {
    key: 'youtube',
    icon: YouTubeIcon,
    label: 'YouTube',
    color: '',
    items: [
      { to: '/youtube-analytics', icon: LayoutDashboard, label: 'YouTube Overview' },
      { to: '/youtube-posts', icon: FileText, label: 'Posts Analysis' },
      { to: '/youtube-audience', icon: Users, label: 'Audience Insights' },
      { to: '/youtube-sentiment', icon: Heart, label: 'Sentiment' },
      { to: '/youtube-trends', icon: Activity, label: 'Trend Intelligence' },
    ],
  },
  {
    key: 'facebook',
    icon: FacebookIcon,
    label: 'Facebook',
    color: '',
    items: [
      { to: '/facebook-analytics', icon: LayoutDashboard, label: 'Page Overview' },
      { to: '/facebook-posts', icon: FileText, label: 'Posts Analysis' },
      { to: '/facebook-audience', icon: Users, label: 'Audience' },
      { to: '/facebook-sentiment', icon: Heart, label: 'Sentiment' },
      { to: '/facebook-trends', icon: Activity, label: 'Trend Intelligence' },
    ],
  },
];

const aiToolsItems: NavItem[] = [];

const accountItems: NavItem[] = [
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Record<string, boolean>>({ instagram: true, youtube: true, facebook: true });
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useSettingsStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const togglePlatform = (key: string) => {
    setExpandedPlatforms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isPlatformActive = (group: PlatformGroup) =>
    group.items.some(item => location.pathname === item.to);

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
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="relative p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ boxShadow: '0 4px 20px -4px hsl(var(--primary) / 0.5)' }}
          >
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
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
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {/* GENERAL OVERVIEW */}
        <SidebarSection label="General Overview" collapsed={collapsed}>
          {overviewItems.map(item => (
            <SidebarNavLink key={item.to} to={item.to} icon={item.icon} label={item.label} collapsed={collapsed} />
          ))}
        </SidebarSection>

        {/* PLATFORM BREAKDOWN */}
        <SidebarSection label="Platform Breakdown" collapsed={collapsed}>
          {platformGroups.map(group => (
            <div key={group.key}>
              {/* Platform header */}
              <motion.button
                whileHover={{ x: collapsed ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !collapsed && togglePlatform(group.key)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent',
                  isPlatformActive(group) && 'text-foreground',
                  collapsed && 'justify-center'
                )}
              >
                <group.icon className={cn('h-5 w-5 flex-shrink-0', group.color)} />
                {!collapsed && (
                  <>
                    <span className="text-sm font-semibold flex-1 text-left">{group.label}</span>
                    <motion.div
                      animate={{ rotate: expandedPlatforms[group.key] ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </>
                )}
              </motion.button>

              {/* Sub-items */}
              <AnimatePresence initial={false}>
                {!collapsed && expandedPlatforms[group.key] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 mt-0.5 space-y-0.5 border-l-2 border-border/40 ml-5">
                      {group.items.map(item => (
                        <SidebarNavLink key={item.to} to={item.to} icon={item.icon} label={item.label} collapsed={collapsed} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* + Other Platforms */}
          <SidebarNavLink
            to="/settings"
            icon={Plus}
            label="Other Platforms"
            collapsed={collapsed}
          />
        </SidebarSection>




        {/* ACCOUNT */}
        <SidebarSection label="Account" collapsed={collapsed}>
          {accountItems.map(item => (
            <SidebarNavLink key={item.to} to={item.to} icon={item.icon} label={item.label} collapsed={collapsed} />
          ))}
        </SidebarSection>
      </nav>

      {/* User & Logout */}
      <div className="relative p-4 border-t border-sidebar-border space-y-2">
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
                  <p className="text-xs font-medium text-foreground truncate">{user.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
            'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent',
            'transition-all duration-200',
            collapsed && 'justify-center'
          )}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {!collapsed && <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </motion.button>

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
          {collapsed ? <ChevronRight className="h-5 w-5" /> : (
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

/* Small helper for section labels */
function SidebarSection({ label, collapsed, children }: { label: string; collapsed: boolean; children: React.ReactNode }) {
  return (
    <div>
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60"
          >
            {label}
          </motion.p>
        )}
      </AnimatePresence>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
