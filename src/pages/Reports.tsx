import { motion } from 'framer-motion';
import {
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

const upcomingFeatures = [
  {
    icon: TrendingUp,
    name: 'Engagement Reports',
    description: 'Comprehensive analysis of likes, comments, shares, and saves across all platforms.',
  },
  {
    icon: Users,
    name: 'Audience Reports',
    description: 'Demographic breakdown including age, gender, location, and growth trends.',
  },
  {
    icon: BarChart3,
    name: 'Content Performance',
    description: 'Analysis of top-performing content with recommendations for optimization.',
  },
  {
    icon: PieChart,
    name: 'Sentiment Reports',
    description: 'AI-powered sentiment analysis with topic breakdown and trend detection.',
  },
  {
    icon: Clock,
    name: 'Scheduled Reports',
    description: 'Automated report delivery on your preferred schedule.',
  },
  {
    icon: FileText,
    name: 'Custom Reports',
    description: 'Create custom reports with specific metrics and date ranges.',
  },
];

export default function Reports() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Reports</h1>
          <p className="text-muted-foreground">
            Generate comprehensive analytics reports and schedule automated deliveries.
          </p>
        </motion.div>
      </div>

      {/* Coming Soon Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center py-16 px-8 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-chart-reach/5 border border-border mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 mb-6"
        >
          <Sparkles className="h-10 w-10 text-primary" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl lg:text-3xl font-bold text-foreground mb-3"
        >
          Reports Coming Soon
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground max-w-lg mx-auto mb-6"
        >
          We're building powerful reporting features to help you generate insights, 
          track performance, and share results with your team.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">In Development</span>
        </motion.div>
      </motion.div>

      {/* Upcoming Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingFeatures.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              className="p-5 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <feature.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">{feature.name}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
