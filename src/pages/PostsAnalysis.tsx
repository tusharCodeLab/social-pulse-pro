import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { PlatformBadge } from '@/components/dashboard/PlatformBadge';
import { SentimentBadge } from '@/components/dashboard/SentimentBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { postsData, engagementData } from '@/lib/demoData';

const COLORS = {
  engagement: 'hsl(173, 80%, 45%)',
  reach: 'hsl(262, 83%, 58%)',
  impressions: 'hsl(38, 92%, 50%)',
};

export default function PostsAnalysis() {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const filteredPosts = postsData
    .filter((post) => {
      if (platformFilter !== 'all' && post.platform !== platformFilter) return false;
      if (searchQuery && !post.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'engagement') return b.engagement - a.engagement;
      if (sortBy === 'reach') return b.reach - a.reach;
      return 0;
    });

  const topPerformingData = postsData
    .slice()
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 5)
    .map((post) => ({
      name: post.content.substring(0, 20) + '...',
      engagement: post.engagement,
      reach: post.reach / 1000,
    }));

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Posts Analysis</h1>
          <p className="text-muted-foreground">
            Analyze the performance of your social media posts across all platforms.
          </p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Over Time */}
        <ChartCard
          title="Performance Trend"
          subtitle="Engagement metrics over time"
          delay={0.1}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 10%)',
                    border: '1px solid hsl(222, 30%, 15%)',
                    borderRadius: '8px',
                    color: 'hsl(210, 40%, 98%)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="likes"
                  stroke={COLORS.engagement}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="shares"
                  stroke={COLORS.reach}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Top Performing Posts */}
        <ChartCard
          title="Top Performing Posts"
          subtitle="Engagement rate comparison"
          delay={0.15}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPerformingData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(215, 20%, 55%)" fontSize={10} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 10%)',
                    border: '1px solid hsl(222, 30%, 15%)',
                    borderRadius: '8px',
                    color: 'hsl(210, 40%, 98%)',
                  }}
                />
                <Bar dataKey="engagement" fill={COLORS.engagement} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-4 mb-6"
      >
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[140px] bg-card border-border">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px] bg-card border-border">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="reach">Reach</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Posts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="chart-container overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Post</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Platform</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-4 w-4" /> Reach
                  </div>
                </th>
                <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Heart className="h-4 w-4" /> Likes
                  </div>
                </th>
                <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <MessageCircle className="h-4 w-4" /> Comments
                  </div>
                </th>
                <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-4 w-4" /> Eng. Rate
                  </div>
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post, index) => (
                <motion.tr
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <p className="text-sm text-foreground max-w-xs truncate">{post.content}</p>
                  </td>
                  <td className="py-4 px-4">
                    <PlatformBadge platform={post.platform} />
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{post.date}</td>
                  <td className="py-4 px-4 text-center text-sm font-medium text-foreground">
                    {post.reach.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center text-sm font-medium text-foreground">
                    {post.likes.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center text-sm font-medium text-foreground">
                    {post.comments.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-sm font-bold text-primary">{post.engagement}%</span>
                  </td>
                  <td className="py-4 px-4">
                    <SentimentBadge sentiment={post.sentiment} score={post.sentimentScore} showScore />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
