import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  direction?: 'up' | 'down';
  className?: string;
}

export function AnimatedCounter({ value, direction = 'up', className }: AnimatedCounterProps) {
  const spring = useSpring(0, {
    mass: 1,
    stiffness: 75,
    damping: 15,
  });
  
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
}
