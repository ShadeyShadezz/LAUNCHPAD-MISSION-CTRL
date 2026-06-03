'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const buttonVariants = cva(
  [
    'btn',
    'inline-flex items-center justify-center gap-2',
    'rounded-xl',
    'font-medium',
    'tracking-[-0.01em]',
    'transition-all duration-200',
    'ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
    'active:translate-y-[1px] active:transition-none',
    'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
    'select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-br from-emerald-500 to-emerald-700',
          'text-primary-foreground',
          'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_6px_rgba(0,0,0,0.04),0_10px_24px_-12px_rgba(6,95,70,0.6)]',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_6px_15px_-3px_rgba(16,185,129,0.35),0_12px_32px_-16px_rgba(6,95,70,0.5)]',
          'dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.4),0_10px_24px_-12px_rgba(6,95,70,0.6)]',
          'dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_6px_15px_-3px_rgba(16,185,129,0.35),0_12px_32px_-16px_rgba(6,95,70,0.5)]',
        ],
        secondary: [
          'bg-transparent',
          'border border-border/70',
          'text-foreground',
          'hover:bg-emerald-500/6',
          'hover:border-emerald-400/60',
          'hover:text-emerald-700',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_6px_15px_-3px_rgba(16,185,129,0.12)]',
          'dark:hover:border-emerald-400/40',
        ],
        outline: [
          'bg-transparent',
          'border-2 border-emerald-500/30',
          'text-emerald-700',
          'hover:bg-emerald-500/8',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_6px_15px_-3px_rgba(16,185,129,0.15)]',
          'dark:text-emerald-400',
        ],
        destructive: [
          'bg-gradient-to-br from-red-500 to-red-600',
          'text-destructive-foreground',
          'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_6px_rgba(0,0,0,0.04)]',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_6px_15px_-3px_rgba(239,68,68,0.35)]',
        ],
        ghost: [
          'bg-transparent',
          'text-muted-foreground',
          'hover:bg-muted/50',
          'hover:text-foreground',
        ],
        success: [
          'bg-gradient-to-br from-emerald-400 to-emerald-600',
          'text-success-foreground',
          'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_6px_rgba(0,0,0,0.04)]',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_6px_15px_-3px_rgba(16,185,129,0.3)]',
        ],
        warning: [
          'bg-gradient-to-br from-amber-400 to-amber-600',
          'text-warning-foreground',
          'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_6px_rgba(0,0,0,0.04)]',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_6px_15px_-3px_rgba(245,158,11,0.3)]',
        ],
      },
      size: {
        sm: 'h-9 px-3 text-xs min-w-[2.25rem]',
        md: 'h-10 px-4 text-sm min-w-[2.5rem]',
        lg: 'h-11 px-5 text-base min-w-[2.75rem]',
        xl: 'h-12 px-6 text-lg min-w-[3rem]',
        icon: 'h-9 w-9 p-0 min-w-0',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, isLoading, icon, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        buttonVariants({ variant, size, fullWidth }),
        isLoading && 'btn-loading',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="opacity-0">{children || 'Loading'}</span>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
);

Button.displayName = 'Button';

export { Button, buttonVariants };
export type { ButtonProps };
