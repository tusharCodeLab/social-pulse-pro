import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
}

export function GlowCard({ 
  children, 
  className,
  glowColor = 'hsl(var(--primary))',
  delay = 0
}: GlowCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative rounded-xl border border-border bg-card overflow-hidden',
        'transition-all duration-300',
        className
      )}
      style={{
        boxShadow: isHovered 
          ? `0 0 40px -10px ${glowColor}` 
          : '0 4px 24px -4px hsl(222 47% 4% / 0.5)'
      }}
    >
      {/* Gradient border effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${glowColor}20, transparent 50%, ${glowColor}10)`,
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
