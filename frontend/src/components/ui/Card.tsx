import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'glow';
}

export function Card({ children, className, variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        {
          'bg-[#0f172a]/60 backdrop-blur-md border-slate-800/60 shadow-lg': variant === 'default',
          'bg-[#0f172a]/40 backdrop-blur-xl border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)]': variant === 'glass',
          'bg-[#0f172a]/80 backdrop-blur-md border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]': variant === 'glow',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4 border-b border-slate-800/60 bg-transparent", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold tracking-tight text-white", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}
