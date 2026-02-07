import { cn } from "@/lib/utils";

interface PremiumSkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'metric' | 'chart';
}

export function PremiumSkeleton({ className, variant = 'default' }: PremiumSkeletonProps) {
  if (variant === 'metric') {
    return (
      <div className={cn("rounded-xl p-6 border border-border bg-card", className)}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg shimmer" />
          <div className="w-16 h-6 rounded-full shimmer" />
        </div>
        <div className="space-y-2">
          <div className="w-24 h-8 shimmer rounded" />
          <div className="w-20 h-4 shimmer rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={cn("rounded-xl p-6 border border-border bg-card", className)}>
        <div className="space-y-2 mb-6">
          <div className="w-32 h-5 shimmer rounded" />
          <div className="w-48 h-4 shimmer rounded" />
        </div>
        <div className="h-[300px] flex items-end gap-2 pt-4">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="flex-1 shimmer rounded-t"
              style={{ height: `${40 + Math.random() * 50}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn("rounded-xl p-6 border border-border bg-card", className)}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg shimmer" />
          <div className="flex-1 space-y-2">
            <div className="w-3/4 h-4 shimmer rounded" />
            <div className="w-full h-3 shimmer rounded" />
            <div className="w-1/2 h-3 shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("shimmer rounded", className)} />
  );
}
