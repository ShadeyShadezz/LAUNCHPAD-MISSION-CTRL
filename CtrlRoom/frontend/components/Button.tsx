'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded font-medium transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow',
        secondary: 'bg-muted text-foreground hover:bg-muted/80 border border-border',
        outline: 'border border-primary text-primary hover:bg-primary/5',
        destructive: 'bg-destructive text-white hover:bg-destructive/90 shadow-sm hover:shadow',
        ghost: 'text-foreground hover:bg-muted/50',
        success: 'bg-success text-white hover:bg-success/90 shadow-sm hover:shadow',
        warning: 'bg-warning text-white hover:bg-warning/90 shadow-sm hover:shadow',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
        xl: 'px-6 py-3 text-base',
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
      className={clsx(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  )
);

Button.displayName = 'Button';

export { Button, buttonVariants };
export type { ButtonProps };
