'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const buttonVariants = cva(
  [
    'btn',
    'inline-flex items-center justify-center gap-2',
    'rounded-lg border border-transparent',
    'font-semibold',
    'whitespace-nowrap',
    'no-underline hover:no-underline',
    'tracking-[0.01em]',
    'transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'active:translate-y-[1px] active:transition-none',
    'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:shadow-none',
    'select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary border-primary/70',
          'text-primary-foreground',
          'shadow-[0_10px_28px_-16px_rgb(var(--brand-800)/0.5)]',
          'hover:bg-brand-600',
          'hover:border-brand-700/60',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_14px_30px_-16px_rgb(var(--brand-800)/0.65)]',
        ],
        secondary: [
          'bg-card/80',
          'border border-border/70',
          'text-foreground',
          'hover:bg-muted/70',
          'hover:border-border',
          'hover:text-foreground',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_10px_24px_-16px_rgb(var(--text-primary)/0.22)]',
        ],
        outline: [
          'bg-transparent',
          'border border-border',
          'text-foreground',
          'hover:bg-brand-500/8 hover:border-brand-400/65 hover:text-brand-700',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_8px_20px_-14px_rgb(var(--brand-500)/0.4)]',
          'dark:text-brand-400',
        ],
        destructive: [
          'btn-destructive-variant border-transparent',
          'text-destructive-foreground',
          'shadow-[0_10px_24px_-16px_rgba(239,68,68,0.66)]',
          'hover:-translate-y-[1px]',
          'hover:shadow-[0_12px_26px_-15px_rgba(239,68,68,0.52)]',
        ],
        ghost: [
          'bg-transparent border-transparent',
          'border border-transparent',
          'text-muted-foreground',
          'hover:bg-muted/60',
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
        sm: 'h-9 px-3 text-xs min-w-[2.5rem]',
        md: 'h-10 px-3.5 text-sm min-w-[2.75rem]',
        lg: 'h-11 px-4 text-sm min-w-[3rem]',
        xl: 'px-5 py-3 text-base min-w-[3.25rem]',
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
