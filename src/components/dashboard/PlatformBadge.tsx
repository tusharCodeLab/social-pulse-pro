import { motion } from 'framer-motion';
import { Twitter, Instagram, Facebook, Linkedin, Video, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

type Platform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube';

interface PlatformBadgeProps {
  platform: Platform;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const platformConfig: Record<Platform, { icon: typeof Twitter; label: string; color: string }> = {
  twitter: { icon: Twitter, label: 'Twitter', color: 'bg-[#1DA1F2]/10 text-[#1DA1F2]' },
  instagram: { icon: Instagram, label: 'Instagram', color: 'bg-[#E4405F]/10 text-[#E4405F]' },
  facebook: { icon: Facebook, label: 'Facebook', color: 'bg-[#1877F2]/10 text-[#1877F2]' },
  linkedin: { icon: Linkedin, label: 'LinkedIn', color: 'bg-[#0A66C2]/10 text-[#0A66C2]' },
  tiktok: { icon: Video, label: 'TikTok', color: 'bg-[#000000]/10 text-foreground' },
  youtube: { icon: Youtube, label: 'YouTube', color: 'bg-[#FF0000]/10 text-[#FF0000]' },
};

const sizeConfig = {
  sm: { icon: 'h-3 w-3', padding: 'p-1', text: 'text-xs' },
  md: { icon: 'h-4 w-4', padding: 'p-1.5', text: 'text-sm' },
  lg: { icon: 'h-5 w-5', padding: 'p-2', text: 'text-base' },
};

export function PlatformBadge({ platform, size = 'md', showLabel = false }: PlatformBadgeProps) {
  const config = platformConfig[platform];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg',
        config.color,
        sizeStyles.padding
      )}
    >
      <Icon className={sizeStyles.icon} />
      {showLabel && (
        <span className={cn('font-medium', sizeStyles.text)}>{config.label}</span>
      )}
    </motion.div>
  );
}
