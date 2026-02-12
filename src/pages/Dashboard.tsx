import { motion } from 'framer-motion';
import {
  Users, Heart, Eye, FileText, Sparkles, RefreshCw, Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Button } from '@/components/ui/button';
import { PremiumSkeleton } from '@/components/ui/premium-skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useDashboardSummaryApi } from '@/hooks/useSocialApi';
import { useQueryClient } from '@tanstack/react-query';

import { PostsSection } from '@/components/dashboard/sections/PostsSection';
import { AudienceSection } from '@/components/dashboard/sections/AudienceSection';
import { SentimentSection } from '@/components/dashboard/sections/SentimentSection';
import { AIToolsSection } from '@/components/dashboard/sections/AIToolsSection';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: summary, isLoading } = useDashboardSummaryApi();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <motion.h1
              className="text-3xl lg:text-4xl font-bold text-foreground mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Welcome back, <span className="gradient-text">{user?.email?.split('@')[0] || 'Analyst'}</span>
            </motion.h1>
            <motion.p
              className="text-muted-foreground flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Calendar className="h-4 w-4" />
              {currentDate}
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                queryClient.invalidateQueries();
                toast({ title: 'Refreshing data', description: 'Fetching latest analytics...' });
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {isLoading ? (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <motion.div key={i} variants={staggerItem}><PremiumSkeleton variant="metric" /></motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PremiumSkeleton variant="chart" />
            <PremiumSkeleton variant="chart" />
          </div>
        </motion.div>
      ) : (
        <div className="space-y-12">
          {/* Overview Metrics */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <MetricCard title="Followers" value={summary?.totalFollowers.toLocaleString() || '0'} icon={Users} delay={0.1} />
              <MetricCard title="Engagement" value={summary?.totalEngagement.toLocaleString() || '0'} icon={Heart} delay={0.15} />
              <MetricCard
                title="Reach"
                value={summary?.totalReach >= 1000 ? `${(summary.totalReach / 1000).toFixed(1)}K` : summary?.totalReach?.toString() || '0'}
                icon={Eye} delay={0.2}
              />
              <MetricCard title="Posts" value={summary?.totalPosts.toString() || '0'} icon={FileText} delay={0.25} />
              <MetricCard title="Sentiment" value={`${Math.round(summary?.positiveSentimentPercent || 0)}% positive`} icon={Sparkles} delay={0.3} />
            </div>
          </motion.section>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Posts Section */}
          <PostsSection />

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Audience Section */}
          <AudienceSection />

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Sentiment Section */}
          <SentimentSection />

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* AI Tools Section */}
          <AIToolsSection />
        </div>
      )}
    </DashboardLayout>
  );
}
