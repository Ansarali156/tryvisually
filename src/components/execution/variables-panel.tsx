"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VariableDiff } from "@/core/synchronization/types";
import { formatVariableValue } from "@/core/synchronization/utils/variable-diff";
import { Database, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface VariablesPanelProps {
  /** Map of active variables */
  variables: Readonly<Record<string, unknown>>;

  /** Optional variable change diffs relative to previous step */
  variableDiffs?: Readonly<Record<string, VariableDiff>>;

  /** Title of the variables panel */
  title?: string;

  /** Optional custom CSS classes */
  className?: string;
}

export function VariablesPanel({
  variables = {},
  variableDiffs = {},
  title = "Active Variables",
  className,
}: VariablesPanelProps) {
  const entries = Object.entries(variables || {});

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-surface-900 select-none text-xs font-mono",
        className
      )}
      role="region"
      aria-label="Algorithm Active Variables Panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Database className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200 font-sans">
            {title}
          </span>
        </div>

        <Badge variant="neutral" size="sm">
          {entries.length} {entries.length === 1 ? "var" : "vars"}
        </Badge>
      </div>

      {/* Variables List */}
      {entries.length === 0 ? (
        <div className="text-slate-400 italic text-center py-4 font-sans text-xs">
          No variables initialized in this step.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {entries.map(([name, value]) => {
            const diff = variableDiffs[name];
            const hasChanged = diff?.hasChanged;
            const isNew = diff?.isNew;

            return (
              <div
                key={name}
                className={cn(
                  "p-2.5 rounded-xl border flex flex-col justify-between gap-1 transition-all duration-200",
                  hasChanged
                    ? "border-brand-300 bg-brand-50/50 dark:border-brand-700/60 dark:bg-brand-950/40 shadow-sm"
                    : "border-slate-100 bg-surface-50/70 dark:border-slate-800 dark:bg-surface-950/60"
                )}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {name}
                  </span>

                  {hasChanged && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-900/80 px-1.5 py-0.2 rounded">
                      <Sparkles className="h-2.5 w-2.5" />
                      {isNew ? "new" : "updated"}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between mt-1 text-xs">
                  {hasChanged && !isNew && diff?.previousValue !== undefined ? (
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <span className="line-through">
                        {formatVariableValue(diff.previousValue)}
                      </span>
                      <span>→</span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        {formatVariableValue(value)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      {formatVariableValue(value)}
                    </span>
                  )}

                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">
                    {Array.isArray(value) ? "array" : typeof value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
