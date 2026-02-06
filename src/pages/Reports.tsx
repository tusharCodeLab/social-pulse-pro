import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileText,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: typeof BarChart3;
  metrics: string[];
  lastGenerated?: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'engagement',
    name: 'Engagement Report',
    description: 'Comprehensive analysis of likes, comments, shares, and saves across all platforms.',
    icon: TrendingUp,
    metrics: ['Likes', 'Comments', 'Shares', 'Saves', 'Engagement Rate'],
    lastGenerated: '2 days ago',
  },
  {
    id: 'audience',
    name: 'Audience Report',
    description: 'Demographic breakdown including age, gender, location, and growth trends.',
    icon: Users,
    metrics: ['Demographics', 'Growth Rate', 'Active Hours', 'Top Locations'],
    lastGenerated: '1 week ago',
  },
  {
    id: 'content',
    name: 'Content Performance',
    description: 'Analysis of top-performing content with recommendations for optimization.',
    icon: BarChart3,
    metrics: ['Top Posts', 'Best Times', 'Content Types', 'Platform Comparison'],
    lastGenerated: '3 days ago',
  },
  {
    id: 'sentiment',
    name: 'Sentiment Report',
    description: 'AI-powered sentiment analysis with topic breakdown and trend detection.',
    icon: PieChart,
    metrics: ['Sentiment Score', 'Topic Analysis', 'Trend Detection', 'Keywords'],
    lastGenerated: 'Never',
  },
];

const scheduledReports = [
  { id: '1', name: 'Weekly Engagement Summary', frequency: 'Weekly', nextRun: 'Jan 20, 2024' },
  { id: '2', name: 'Monthly Performance Report', frequency: 'Monthly', nextRun: 'Feb 1, 2024' },
  { id: '3', name: 'Daily Sentiment Digest', frequency: 'Daily', nextRun: 'Tomorrow' },
];

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const handleGenerateReport = (templateId: string) => {
    console.log(`Generating ${templateId} report for ${selectedPeriod} in ${selectedFormat} format`);
  };

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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4 mb-8"
      >
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedFormat} onValueChange={setSelectedFormat}>
          <SelectTrigger className="w-[140px] bg-card border-border">
            <FileText className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="excel">Excel</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Report Templates */}
      <div className="mb-8">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-lg font-semibold text-foreground mb-4"
        >
          Report Templates
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ y: -4 }}
              className="metric-card rounded-xl p-6 border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <template.icon className="h-5 w-5 text-primary" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleGenerateReport(template.id)}
                >
                  <Download className="h-4 w-4" />
                  Generate
                </Button>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {template.metrics.map((metric) => (
                  <span
                    key={metric}
                    className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                  >
                    {metric}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Last generated: {template.lastGenerated}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scheduled Reports */}
      <ChartCard
        title="Scheduled Reports"
        subtitle="Automated report delivery schedule"
        delay={0.4}
        action={
          <Button variant="outline" size="sm" className="gap-2">
            <Clock className="h-4 w-4" />
            Schedule New
          </Button>
        }
      >
        <div className="space-y-3 mt-4">
          {scheduledReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{report.name}</h4>
                  <p className="text-sm text-muted-foreground">{report.frequency}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Next run</p>
                  <p className="text-sm font-medium text-foreground">{report.nextRun}</p>
                </div>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </ChartCard>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 p-6 rounded-xl border border-dashed border-border bg-muted/20"
      >
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Need a Custom Report?
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Create a custom report with specific metrics, date ranges, and visualization preferences.
          </p>
          <Button className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Create Custom Report
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
