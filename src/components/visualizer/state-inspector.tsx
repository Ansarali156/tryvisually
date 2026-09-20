import * as React from "react";
import { cn } from "@/lib/utils";
import { VariableSnapshot } from "@/core/engine/types";
import { Database, Binary } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface StateInspectorProps {
  variables: VariableSnapshot[];
  title?: string;
  className?: string;
}

export function StateInspector({
  variables,
  title = "Variables / Data / Execution State",
  className,
}: StateInspectorProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-surface-900 shadow-xs overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-surface-50 border-b border-slate-200 dark:bg-surface-950 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {title}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {variables.length} active {variables.length === 1 ? "variable" : "variables"}
        </span>
      </div>

      <div className="p-3">
        {variables.length === 0 ? (
          <div className="text-center py-3 text-xs text-slate-400 italic">
            No active variables tracked in this step.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {variables.map((v) => {
              const formattedValue =
                typeof v.value === "object"
                  ? JSON.stringify(v.value)
                  : String(v.value);

              return (
                <div
                  key={v.name}
                  className={cn(
                    "flex flex-col p-2 rounded-lg border transition-all duration-200",
                    v.changed
                      ? "bg-amber-50/70 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700 ring-1 ring-amber-400/40"
                      : "bg-surface-50/50 border-slate-200 dark:bg-surface-950/40 dark:border-slate-800"
                  )}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 truncate">
                      {v.name}
                    </span>
                    {v.type && (
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        {v.type}
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-brand-700 dark:text-brand-300 font-semibold truncate">
                    {formattedValue}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
