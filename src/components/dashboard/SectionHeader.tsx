import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  delay?: number;
  accentClass?: string;
}

export function SectionHeader({ icon: Icon, title, subtitle, action, delay = 0, accentClass = 'text-primary' }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5"
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg bg-primary/10 border border-primary/20', accentClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action}
    </motion.div>
  );
}
