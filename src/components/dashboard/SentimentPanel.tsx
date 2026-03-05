import { motion } from 'framer-motion';
import { SmilePlus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

const COLORS = {
  positive: 'hsl(142, 71%, 45%)',
  neutral: 'hsl(215, 20%, 55%)',
  negative: 'hsl(0, 72%, 51%)',
};

export function SentimentPanel({ sentiment }: { sentiment: SentimentData | undefined }) {
  if (!sentiment || sentiment.total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl border border-border bg-card p-4"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-lg bg-chart-sentiment-positive/10 border border-chart-sentiment-positive/20">
            <SmilePlus className="h-4 w-4 text-chart-sentiment-positive" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Sentiment Overview</h3>
        </div>
        <div className="py-6 text-center">
          <p className="text-xs text-muted-foreground">Analyze comments to see sentiment distribution</p>
        </div>
      </motion.div>
    );
  }

  const pieData = [
    { name: 'Positive', value: sentiment.positive, color: COLORS.positive },
    { name: 'Neutral', value: sentiment.neutral, color: COLORS.neutral },
    { name: 'Negative', value: sentiment.negative, color: COLORS.negative },
  ];

  const positiveRate = Math.round((sentiment.positive / sentiment.total) * 100);
  const neutralRate = Math.round((sentiment.neutral / sentiment.total) * 100);
  const negativeRate = Math.round((sentiment.negative / sentiment.total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-lg bg-chart-sentiment-positive/10 border border-chart-sentiment-positive/20">
            <SmilePlus className="h-4 w-4 text-chart-sentiment-positive" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Sentiment Overview</h3>
            <p className="text-[10px] text-muted-foreground">{sentiment.total} comments analyzed</p>
          </div>
        </div>

        {/* Donut */}
        <div className="relative w-32 h-32 mx-auto my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-chart-sentiment-positive">{positiveRate}%</span>
            <span className="text-[8px] text-muted-foreground">positive</span>
          </div>
        </div>

        {/* Distribution bars */}
        <div className="space-y-2 mt-3">
          {[
            { label: 'Positive', value: sentiment.positive, pct: positiveRate, color: COLORS.positive },
            { label: 'Neutral', value: sentiment.neutral, pct: neutralRate, color: COLORS.neutral },
            { label: 'Negative', value: sentiment.negative, pct: negativeRate, color: COLORS.negative },
          ].map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-[10px] font-semibold text-foreground">{item.pct}% ({item.value})</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
