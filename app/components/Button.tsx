'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const buttonVariants = cva(
  [
    'btn',
    'inline-flex items-center justify-center gap-3',
    'rounded-md border border-transparent',
    'font-bold uppercase',
    'no-underline hover:no-underline',
    'tracking-[0.08em]',
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
          'bg-[#047857]',
          'text-[#ffffff]',
          'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_6px_rgba(0,0,0,0.04),0_10px_24px_-12px_rgba(4,120,87,0.6)]',
          'hover:bg-[#047857]',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_6px_15px_-3px_rgba(4,120,87,0.35),0_12px_32px_-16px_rgba(4,120,87,0.5)]',
        ],
        secondary: [
          'bg-transparent',
          'border border-border/70',
          'text-foreground',
          'hover:bg-brand-500/6',
          'hover:border-brand-400/60',
          'hover:text-brand-700',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_6px_15px_-3px_rgb(var(--brand-500)/0.12)]',
          'dark:hover:border-brand-400/40',
        ],
        outline: [
          'bg-transparent',
          'border-2 border-brand-500/30',
          'text-brand-700',
          'hover:bg-brand-500/8',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_6px_15px_-3px_rgb(var(--brand-500)/0.15)]',
          'dark:text-brand-400',
        ],
        destructive: [
          'btn-destructive-variant',
          'text-destructive-foreground',
          'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_6px_rgba(0,0,0,0.04)]',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_6px_15px_-3px_rgba(239,68,68,0.35)]',
        ],
        ghost: [
          'bg-transparent',
          'border border-transparent',
          'text-muted-foreground',
          'hover:bg-muted/50',
          'hover:text-foreground',
        ],
        success: [
          'btn-success-variant',
          'text-success-foreground',
          'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_6px_rgba(0,0,0,0.04)]',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_6px_15px_-3px_rgb(var(--brand-500)/0.3)]',
        ],
        warning: [
          'btn-warning-variant',
          'text-warning-foreground',
          'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_6px_rgba(0,0,0,0.04)]',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_6px_15px_-3px_rgba(245,158,11,0.3)]',
        ],
      },
      size: {
        sm: 'px-2.5 py-1.5 text-[10px] min-w-[2.25rem]',
        md: 'px-2.5 py-1.5 text-xs min-w-[2.5rem]',
        lg: 'px-2.5 py-1.5 text-sm min-w-[2.75rem]',
        xl: 'px-2.5 py-1.5 text-base min-w-[3rem]',
        icon: 'h-10 w-10 p-0 min-w-0 rounded-md',
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
      aria-busy={isLoading || undefined}
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
