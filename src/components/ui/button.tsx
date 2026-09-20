import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm disabled:bg-brand-600/50",
      secondary:
        "bg-surface-100 text-slate-800 hover:bg-surface-200 active:bg-slate-300 dark:bg-surface-800 dark:text-slate-200 dark:hover:bg-surface-800/80 disabled:opacity-50",
      outline:
        "border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50",
      ghost:
        "bg-transparent hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-surface-800 disabled:opacity-40",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-600/50",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-md gap-1.5",
      md: "h-9 px-4 text-sm rounded-lg gap-2",
      lg: "h-11 px-6 text-base rounded-lg gap-2.5",
      icon: "h-9 w-9 p-0 rounded-lg justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 select-none disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
