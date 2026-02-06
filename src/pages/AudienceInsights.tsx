import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import { Users, MapPin, TrendingUp, UserPlus, Globe } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import {
  audienceAgeData,
  audienceGenderData,
  audienceLocationData,
  growthData,
} from '@/lib/demoData';

const COLORS = {
  primary: 'hsl(173, 80%, 45%)',
  secondary: 'hsl(262, 83%, 58%)',
  tertiary: 'hsl(38, 92%, 50%)',
  quaternary: 'hsl(142, 71%, 45%)',
  quinary: 'hsl(0, 72%, 51%)',
};

const genderColors = [COLORS.primary, COLORS.secondary, COLORS.tertiary];

export default function AudienceInsights() {
  const totalAudience = audienceAgeData.reduce((acc, item) => acc + item.count, 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Audience Insights</h1>
          <p className="text-muted-foreground">
            Understand your audience demographics, growth patterns, and geographic distribution.
          </p>
        </motion.div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Audience"
          value={totalAudience.toLocaleString()}
          change={12.5}
          icon={Users}
          delay={0.1}
        />
        <MetricCard
          title="New Followers (Week)"
          value="+2,456"
          change={8.3}
          icon={UserPlus}
          delay={0.15}
        />
        <MetricCard
          title="Top Location"
          value="United States"
          change={2.1}
          icon={MapPin}
          delay={0.2}
        />
        <MetricCard
          title="Growth Rate"
          value="4.2%"
          change={0.8}
          icon={TrendingUp}
          delay={0.25}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Age Distribution */}
        <ChartCard
          title="Age Distribution"
          subtitle="Audience breakdown by age groups"
          delay={0.3}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={audienceAgeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                <XAxis dataKey="ageGroup" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 10%)',
                    border: '1px solid hsl(222, 30%, 15%)',
                    borderRadius: '8px',
                    color: 'hsl(210, 40%, 98%)',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Percentage']}
                />
                <Bar dataKey="percentage" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Gender Distribution */}
        <ChartCard
          title="Gender Distribution"
          subtitle="Audience breakdown by gender"
          delay={0.35}
        >
          <div className="h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={audienceGenderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="percentage"
                >
                  {audienceGenderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={genderColors[index % genderColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 10%)',
                    border: '1px solid hsl(222, 30%, 15%)',
                    borderRadius: '8px',
                    color: 'hsl(210, 40%, 98%)',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Percentage']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {audienceGenderData.map((item, index) => (
              <div key={item.gender} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: genderColors[index] }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.gender} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Follower Growth */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Follower Growth"
            subtitle="Weekly follower trend"
            delay={0.4}
          >
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="followers"
                    stroke={COLORS.primary}
                    fill="url(#colorFollowers)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Top Locations */}
        <ChartCard
          title="Top Locations"
          subtitle="Geographic distribution"
          delay={0.45}
        >
          <div className="space-y-3">
            {audienceLocationData.slice(0, 6).map((location, index) => (
              <motion.div
                key={location.country}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{location.country}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${location.percentage}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground w-12 text-right">
                    {location.percentage}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Audience Activity Times */}
      <ChartCard
        title="Audience Activity"
        subtitle="When your audience is most active"
        delay={0.5}
      >
        <div className="grid grid-cols-7 gap-2 mt-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
            <div key={day} className="text-center">
              <span className="text-xs text-muted-foreground mb-2 block">{day}</span>
              <div className="space-y-1">
                {[6, 9, 12, 15, 18, 21].map((hour, hourIndex) => {
                  const activity = Math.random() * 100;
                  const opacity = activity / 100;
                  return (
                    <motion.div
                      key={hour}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + (dayIndex * 6 + hourIndex) * 0.02 }}
                      className="h-6 rounded-sm cursor-pointer hover:ring-2 ring-primary/50 transition-all"
                      style={{
                        backgroundColor: `hsla(173, 80%, 45%, ${opacity * 0.8 + 0.1})`,
                      }}
                      title={`${day} ${hour}:00 - ${activity.toFixed(0)}% activity`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary/20" />
            <span className="text-xs text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary/50" />
            <span className="text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-xs text-muted-foreground">High</span>
          </div>
        </div>
      </ChartCard>
    </DashboardLayout>
  );
}
