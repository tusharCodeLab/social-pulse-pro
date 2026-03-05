import { motion } from 'framer-motion';
import { Trophy, Heart, MessageCircle, Eye } from 'lucide-react';
import { InstagramIcon, YouTubeIcon, FacebookIcon } from '@/components/icons/PlatformIcons';
import { cn } from '@/lib/utils';

interface TopPost {
  id: string;
  platform: string;
  content: string | null;
  reach: number;
  mediaUrl: string | null;
  publishedAt: string | null;
  engagementRate: number;
  likesCount: number;
  commentsCount: number;
}

const PLATFORM_ICONS: Record<string, any> = {
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  facebook: FacebookIcon,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E4405F',
  youtube: '#FF0000',
  facebook: '#1877F2',
};

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function TopPostsTable({ posts }: { posts: TopPost[] }) {
  const maxReach = Math.max(...posts.map(p => p.reach), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-chart-impressions/10 border border-chart-impressions/20">
            <Trophy className="h-4 w-4 text-chart-impressions" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Top Performing Posts</h3>
            <p className="text-[10px] text-muted-foreground">Ranked by total engagement across platforms</p>
          </div>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-2">
            {posts.map((post, i) => {
              const PIcon = PLATFORM_ICONS[post.platform] || Instagram;
              const pColor = PLATFORM_COLORS[post.platform] || '#888';
              const barWidth = (post.reach / maxReach) * 100;

              return (
                <div key={post.id} className="group flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/50">
                  {/* Rank */}
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                    i === 0 ? 'bg-chart-impressions/20 text-chart-impressions' :
                    i === 1 ? 'bg-muted-foreground/20 text-muted-foreground' :
                    'bg-muted/60 text-muted-foreground'
                  )}>
                    {i + 1}
                  </div>

                  {/* Thumbnail / Platform icon */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted/40 flex items-center justify-center border border-border/30">
                    {post.mediaUrl ? (
                      <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <PIcon className="h-4 w-4" style={{ color: pColor }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <PIcon className="h-3 w-3 flex-shrink-0" style={{ color: pColor }} />
                      <p className="text-xs text-foreground font-medium truncate">
                        {post.content?.slice(0, 60) || `${post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} Post`}
                      </p>
                    </div>
                    {/* Performance bar */}
                    <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, backgroundColor: pColor, opacity: 0.7 }} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      <span className="text-[10px] font-medium">{formatNumber(post.likesCount)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="h-3 w-3" />
                      <span className="text-[10px] font-medium">{formatNumber(post.commentsCount)}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-foreground">{post.engagementRate.toFixed(1)}%</p>
                      <p className="text-[8px] text-muted-foreground">eng.</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Trophy className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No posts yet. Import data to see top performers.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
