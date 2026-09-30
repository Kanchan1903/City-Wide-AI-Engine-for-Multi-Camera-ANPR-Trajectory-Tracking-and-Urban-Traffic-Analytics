import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
 size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
 children, 
 className, 
 variant = 'primary', 
 size = 'md', 
 ...props 
}: ButtonProps) {
 return (
 <button
 className={cn(
 "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
 {
 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_4px_12px_rgba(6,182,212,0.15)] hover:shadow-[0_6px_16px_rgba(6,182,212,0.25)]': variant === 'primary',
 'bg-[#0a1f3d]/80 hover:bg-[#1e3a5f]/80 text-cyan-50 border border-[#1e3a5f]': variant === 'secondary',
 'bg-transparent border border-[#1e3a5f] hover:bg-[#0a1f3d] hover:border-cyan-800 text-slate-300 hover:text-white': variant === 'outline',
 'bg-transparent hover:bg-[#091a33] text-slate-400 hover:text-white': variant === 'ghost',
 'bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_10px_rgba(239,68,68,0.3)]': variant === 'danger',
 'h-8 px-3 text-sm': size === 'sm',
 'h-10 px-4 py-2': size === 'md',
 'h-12 px-8 text-lg': size === 'lg',
 },
 className
 )}
 {...props}
 >
 {children}
 </button>
 );
}
