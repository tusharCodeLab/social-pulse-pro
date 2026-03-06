import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpandableSectionProps {
  children: React.ReactNode;
  maxHeight?: number;
  className?: string;
}

export function ExpandableSection({ children, maxHeight = 150, className }: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setNeedsExpand(contentRef.current.scrollHeight > maxHeight + 20);
    }
  }, [children, maxHeight]);

  return (
    <div className={cn('relative', className)}>
      <div
        ref={contentRef}
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{ maxHeight: expanded || !needsExpand ? contentRef.current?.scrollHeight : maxHeight }}
      >
        {children}
      </div>
      {needsExpand && !expanded && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/95 via-background/60 to-transparent pointer-events-none" />
      )}
      {needsExpand && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'flex items-center gap-1 text-xs font-medium transition-colors mx-auto mt-1',
            'text-muted-foreground hover:text-foreground'
          )}
        >
          <span>{expanded ? 'Show less' : 'Show more'}</span>
          <ChevronDown className={cn('h-3 w-3 transition-transform duration-200', expanded && 'rotate-180')} />
        </button>
      )}
    </div>
  );
}
