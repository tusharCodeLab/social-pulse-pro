import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatFn?: (value: number) => string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1, 
  className,
  formatFn = (v) => v.toLocaleString()
}: AnimatedCounterProps) {
  const spring = useSpring(0, { 
    duration: duration * 1000, 
    bounce: 0 
  });
  
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(formatFn(Math.round(latest)));
    });
    return unsubscribe;
  }, [spring, formatFn]);

  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {displayValue}
    </motion.span>
  );
}
