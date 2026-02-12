import { motion } from 'framer-motion';
import { ReactNode, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Download, Copy, Maximize2, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  delay?: number;
}

export function ChartCard({ title, subtitle, children, action, className, delay = 0 }: ChartCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleCopyData = () => {
    const textContent = cardRef.current?.innerText || '';
    navigator.clipboard.writeText(textContent).then(() => {
      setCopied(true);
      toast({ title: 'Copied', description: `"${title}" data copied to clipboard.` });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExport = () => {
    const textContent = cardRef.current?.innerText || '';
    const blob = new Blob([`${title}\n${subtitle || ''}\n\n${textContent}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: `"${title}" exported as text file.` });
  };

  const handleFullscreen = () => {
    if (cardRef.current?.requestFullscreen) {
      cardRef.current.requestFullscreen();
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative rounded-xl p-6 border border-border bg-card overflow-hidden',
        'transition-shadow duration-300',
        className
      )}
      style={{
        boxShadow: isHovered 
          ? '0 8px 32px -8px hsl(222 47% 4% / 0.6), 0 0 0 1px hsl(var(--primary) / 0.1)'
          : '0 4px 24px -4px hsl(222 47% 4% / 0.5)',
      }}
    >
      {/* Subtle gradient overlay on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-chart-reach/3 pointer-events-none"
      />

      {/* Top accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-chart-reach to-primary origin-left"
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <motion.h3 
              className="font-semibold text-foreground text-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.1 }}
            >
              {title}
            </motion.h3>
            {subtitle && (
              <motion.p 
                className="text-sm text-muted-foreground mt-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.15 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="flex items-center gap-2"
          >
            {action}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={handleCopyData} className="gap-2 cursor-pointer">
                  {copied ? <Check className="h-4 w-4 text-chart-sentiment-positive" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Data'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport} className="gap-2 cursor-pointer">
                  <Download className="h-4 w-4" />
                  Export as File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleFullscreen} className="gap-2 cursor-pointer">
                  <Maximize2 className="h-4 w-4" />
                  Fullscreen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
        {children}
      </div>
    </motion.div>
  );
}
