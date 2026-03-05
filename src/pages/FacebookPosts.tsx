import { motion } from 'framer-motion';
import { ThumbsUp, MessageCircle, Share2, Facebook, Image as ImageIcon } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { useFacebookPosts } from '@/hooks/useFacebookData';
import { format } from 'date-fns';

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function PostThumbnail({ src, fallbackIcon: Icon = Facebook }: { src?: string | null; fallbackIcon?: typeof Facebook }) {
  if (!src) {
    return (
      <div className="w-full aspect-video rounded-lg bg-muted/50 border border-border flex items-center justify-center">
        <Icon className="h-8 w-8 text-muted-foreground/40" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={(e) => {
        const parent = e.currentTarget.parentElement;
        e.currentTarget.remove();
        if (parent) {
          parent.innerHTML = `<div class="w-full aspect-video rounded-lg bg-muted/50 border border-border flex items-center justify-center"><svg class="h-8 w-8 text-muted-foreground/40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>`;
        }
      }}
      className="w-full aspect-video rounded-lg object-cover border border-border"
    />
  );
}

export default function FacebookPosts() {
  const { data: posts = [] } = useFacebookPosts();
  const hasData = posts.length > 0;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#1877F2]/10"><Facebook className="h-6 w-6 text-[#1877F2]" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Facebook Posts Analysis</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Detailed breakdown of all your Facebook Page posts</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs border-[#1877F2]/30 text-[#1877F2]">
          <Facebook className="h-3 w-3" /> Facebook
        </Badge>
      </motion.div>

      {hasData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card overflow-hidden hover:border-[#1877F2]/30 transition-all duration-300"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <PostThumbnail src={p.media_url} />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-[10px]">{p.post_type || 'post'}</Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {p.published_at ? format(new Date(p.published_at), 'MMM d, yyyy') : '—'}
                  </span>
                </div>
                <p className="text-sm text-foreground line-clamp-3 mb-3 min-h-[3.5em]">
                  {p.content || 'No text content'}
                </p>
                <div className="flex items-center gap-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{formatNum(p.likes_count || 0)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{formatNum(p.comments_count || 0)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{formatNum(p.shares_count || 0)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-12" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex flex-col items-center gap-2">
            <Facebook className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No Facebook posts found</p>
            <p className="text-xs text-muted-foreground/60">Go to Settings → Connect Facebook</p>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
