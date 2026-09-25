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
          'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)]': variant === 'primary',
          'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700': variant === 'secondary',
          'bg-transparent border border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-300': variant === 'outline',
          'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white': variant === 'ghost',
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
