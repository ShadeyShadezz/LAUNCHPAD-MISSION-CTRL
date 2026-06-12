'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const buttonVariants = cva(
  [
    'btn',
    'inline-flex items-center justify-center gap-2',
    'rounded-md border border-transparent',
    'font-semibold',
    'whitespace-nowrap',
    'no-underline hover:no-underline',
    'tracking-normal',
    'transition-colors duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'active:translate-y-[1px] active:transition-none',
    'disabled:opacity-100 disabled:pointer-events-none disabled:cursor-not-allowed disabled:shadow-none',
    'select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary border-primary/70',
          'text-primary-foreground',
          'hover:bg-brand-600',
          'hover:border-brand-700/60',
        ],
        secondary: [
          'bg-card/80',
          'border border-border/70',
          'text-foreground',
          'hover:bg-muted/70',
          'hover:border-border',
          'hover:text-foreground',
        ],
        outline: [
          'bg-transparent',
          'border border-border',
          'text-foreground',
          'hover:bg-brand-500/8 hover:border-brand-400/65 hover:text-brand-700',
          'dark:text-brand-400',
        ],
        destructive: [
          'btn-destructive-variant border-transparent',
          'text-destructive-foreground',
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
        ],
        warning: [
          'btn-warning-variant',
          'text-warning-foreground',
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
