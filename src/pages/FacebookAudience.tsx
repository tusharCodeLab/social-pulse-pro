import { motion } from 'framer-motion';
import { Users, TrendingUp, Facebook } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFacebookAccount } from '@/hooks/useFacebookData';

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export default function FacebookAudience() {
  const { data: account } = useFacebookAccount();

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#1877F2]/10"><Facebook className="h-6 w-6 text-[#1877F2]" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Facebook Audience</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Page follower metrics and audience overview</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs border-[#1877F2]/30 text-[#1877F2]">
          <Facebook className="h-3 w-3" /> Facebook
        </Badge>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center gap-2 mb-4"><Users className="h-5 w-5 text-[#1877F2]" /><h3 className="text-lg font-semibold text-foreground">Page Followers</h3></div>
          {account ? (
            <div className="space-y-4">
              <div>
                <p className="text-4xl font-bold text-foreground">{formatNum(account.followers_count || 0)}</p>
                <p className="text-sm text-muted-foreground mt-1">Total followers on {account.account_name}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-chart-sentiment-positive" />
                <span>Following count: {formatNum(account.following_count || 0)}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Facebook className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Connect your Facebook Page to see audience data</p>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-chart-reach" /><h3 className="text-lg font-semibold text-foreground">Page Info</h3></div>
          {account ? (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Page Name</span>
                <span className="text-sm font-medium text-foreground">{account.account_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Page ID</span>
                <span className="text-sm font-mono text-foreground">{account.account_handle}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={account.is_connected ? "default" : "secondary"}>{account.is_connected ? 'Connected' : 'Disconnected'}</Badge>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Facebook className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No page connected</p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
