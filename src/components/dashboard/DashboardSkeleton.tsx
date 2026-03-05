import { motion } from 'framer-motion';

function ShimmerCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-border/50 bg-card/50 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          <div className="h-7 w-28 rounded bg-muted animate-pulse" />
        </div>
        <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="flex gap-1 items-end h-8">
        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
          <div key={i} className="flex-1 rounded-sm bg-muted animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <ShimmerCard key={i} />
        ))}
      </div>
      
      {/* Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="h-4 w-32 rounded bg-muted animate-pulse mb-2" />
          <div className="h-3 w-48 rounded bg-muted animate-pulse mb-6" />
          <div className="h-[200px] rounded-lg bg-muted/30 animate-pulse" />
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="h-4 w-32 rounded bg-muted animate-pulse mb-2" />
          <div className="h-3 w-48 rounded bg-muted animate-pulse mb-6" />
          <div className="h-[200px] rounded-lg bg-muted/30 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
