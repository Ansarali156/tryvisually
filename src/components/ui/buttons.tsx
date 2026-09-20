import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonBaseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed";

const sizeStyles = {
  sm: "h-8 px-3 text-xs rounded-md gap-1.5",
  md: "h-9 px-4 text-sm rounded-lg gap-2",
  lg: "h-11 px-6 text-base rounded-lg gap-2.5",
};

export const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonBaseProps>(
  ({ className, size = "md", isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        sizeStyles[size],
        "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm disabled:bg-brand-600/50",
        className
      )}
      {...props}
    >
      {isLoading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
      )}
      {children}
    </button>
  )
);
PrimaryButton.displayName = "PrimaryButton";

export const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonBaseProps>(
  ({ className, size = "md", isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        sizeStyles[size],
        "bg-surface-100 text-slate-800 hover:bg-surface-200 active:bg-slate-300 dark:bg-surface-800 dark:text-slate-200 dark:hover:bg-surface-700 disabled:opacity-50 border border-slate-200 dark:border-slate-700",
        className
      )}
      {...props}
    >
      {isLoading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
      )}
      {children}
    </button>
  )
);
SecondaryButton.displayName = "SecondaryButton";

export const GhostButton = React.forwardRef<HTMLButtonElement, ButtonBaseProps>(
  ({ className, size = "md", isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        sizeStyles[size],
        "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-surface-800 dark:hover:text-white disabled:opacity-40",
        className
      )}
      {...props}
    >
      {isLoading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
      )}
      {children}
    </button>
  )
);
GhostButton.displayName = "GhostButton";

export const DangerButton = React.forwardRef<HTMLButtonElement, ButtonBaseProps>(
  ({ className, size = "md", isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        sizeStyles[size],
        "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-600/50 shadow-sm",
        className
      )}
      {...props}
    >
      {isLoading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
      )}
      {children}
    </button>
  )
);
DangerButton.displayName = "DangerButton";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "secondary" | "outline";
  "aria-label": string; // Explicit accessibility requirement
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      size = "md",
      variant = "ghost",
      disabled,
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const iconSizeStyles = {
      sm: "h-8 w-8 p-0 rounded-md",
      md: "h-9 w-9 p-0 rounded-lg",
      lg: "h-11 w-11 p-0 rounded-lg",
    };

    const variantStyles = {
      ghost:
        "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-surface-800 dark:hover:text-white",
      secondary:
        "bg-surface-100 text-slate-700 hover:bg-surface-200 dark:bg-surface-800 dark:text-slate-300",
      outline:
        "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-surface-800",
    };

    return (
      <button
        ref={ref}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(
          baseStyles,
          iconSizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
