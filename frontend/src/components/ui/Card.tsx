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
 'bg-slate-800 border-slate-700 shadow-md': variant === 'default',
 'bg-slate-800 border-slate-700 shadow-sm': variant === 'glass',
 'bg-slate-800 border-cyan-500/30 shadow-[0_4px_12px_rgba(53,183,176,0.1)]': variant === 'glow',
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
