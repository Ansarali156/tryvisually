"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ExecutionOperation } from "@/core/execution/types";
import { Badge } from "@/components/ui/badge";
import { Info, Code2, PlayCircle } from "lucide-react";

export interface ExplanationPanelProps {
  /** Current step explanation text */
  explanation: string;

  /** Active operation category */
  operation?: ExecutionOperation;

  /** Primary active code line number */
  codeLine?: number;

  /** Current step index (0-indexed) */
  stepIndex?: number;

  /** Total steps */
  totalSteps?: number;

  /** Title */
  title?: string;

  /** Custom CSS classes */
  className?: string;
}

export function ExplanationPanel({
  explanation,
  operation,
  codeLine,
  stepIndex,
  totalSteps,
  title = "Step Explanation",
  className,
}: ExplanationPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-surface-900 select-none text-xs",
        className
      )}
      role="region"
      aria-label="Algorithm Step Explanation Panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Info className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {codeLine && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded border border-brand-100 dark:border-brand-900">
              <Code2 className="h-3 w-3" />
              Line #{codeLine}
            </span>
          )}

          {typeof stepIndex === "number" && typeof totalSteps === "number" && (
            <span className="text-[11px] font-mono text-slate-400">
              Step {stepIndex + 1}/{totalSteps}
            </span>
          )}
        </div>
      </div>

      {/* Operation Badge & Explanation Text */}
      <div className="space-y-2">
        {operation && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400">Operation:</span>
            <Badge variant="brand" size="sm" className="uppercase font-mono tracking-wider text-[10px]">
              <PlayCircle className="h-3 w-3 mr-1" />
              {operation}
            </Badge>
          </div>
        )}

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans pt-1">
          {explanation || "Execution idle."}
        </p>
      </div>
    </div>
  );
}
