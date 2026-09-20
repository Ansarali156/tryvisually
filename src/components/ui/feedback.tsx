import * as React from "react";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { PrimaryButton, SecondaryButton } from "./buttons";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  onClose?: () => void;
}

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className,
  ...props
}: AlertProps) {
  const variantMap = {
    info: {
      bg: "bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/50 dark:border-sky-800 dark:text-sky-200",
      icon: Info,
      iconColor: "text-sky-600 dark:text-sky-400",
    },
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200",
      icon: AlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200",
      icon: AlertCircle,
      iconColor: "text-rose-600 dark:text-rose-400",
    },
  };

  const current = variantMap[variant];
  const Icon = current.icon;

  return (
    <div
      role="alert"
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl border transition-colors",
        current.bg,
        className
      )}
      {...props}
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", current.iconColor)} />
      <div className="flex-1 text-xs leading-relaxed">
        {title && <h5 className="font-semibold text-sm mb-1">{title}</h5>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close alert"
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Sparkles,
  actionText,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-200 bg-surface-50 dark:border-slate-800 dark:bg-surface-900/50",
        className
      )}
    >
      <div className="p-3 rounded-full bg-white dark:bg-surface-800 shadow-xs mb-3 text-brand-600 dark:text-brand-400">
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
        {description}
      </p>
      {actionText && onAction && (
        <PrimaryButton size="sm" onClick={onAction}>
          {actionText}
        </PrimaryButton>
      )}
    </div>
  );
}

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading visualizer state...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <div className="h-7 w-7 rounded-full border-2 border-brand-600 border-t-transparent animate-spin mb-3" />
      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
        {message}
      </span>
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center p-6 text-center rounded-xl border border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/30",
        className
      )}
    >
      <AlertCircle className="h-7 w-7 text-rose-600 dark:text-rose-400 mb-2" />
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-4">
        {message}
      </p>
      {onRetry && (
        <SecondaryButton size="sm" onClick={onRetry}>
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Retry
        </SecondaryButton>
      )}
    </div>
  );
}
