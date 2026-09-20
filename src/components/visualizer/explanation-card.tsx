import * as React from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, Info, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ExplanationCardProps {
  actionTitle: string;
  explanation: string;
  why?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  className?: string;
}

export function ExplanationCard({
  actionTitle,
  explanation,
  why,
  timeComplexity,
  spaceComplexity,
  className,
}: ExplanationCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-surface-900 shadow-xs p-4",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {actionTitle || "Execution Step Explanation"}
          </h4>
        </div>

        {(timeComplexity || spaceComplexity) && (
          <div className="flex items-center gap-1.5">
            {timeComplexity && (
              <Badge variant="neutral" size="sm">
                Time: {timeComplexity}
              </Badge>
            )}
            {spaceComplexity && (
              <Badge variant="neutral" size="sm">
                Space: {spaceComplexity}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
        <p className="leading-relaxed">{explanation}</p>

        {why && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-brand-50/60 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/60 text-xs">
            <HelpCircle className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-brand-900 dark:text-brand-200">
                Why this step?{" "}
              </span>
              <span className="text-brand-800 dark:text-brand-300">{why}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
