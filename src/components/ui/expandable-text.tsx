import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableTextProps {
  children: React.ReactNode;
  maxHeight?: number;
  className?: string;
}

export function ExpandableText({ children, maxHeight = 120, className }: ExpandableTextProps) {
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
        style={{ maxHeight: expanded || !needsExpand ? 'none' : `${maxHeight}px` }}
      >
        {children}
      </div>
      {needsExpand && !expanded && (
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
      )}
      {needsExpand && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1.5 pt-1"
        >
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', expanded && 'rotate-180')} />
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}
