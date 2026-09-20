"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { HeapState, HeapType, PriorityQueueState } from "@/core/heap/types";
import { getHeapStatistics, getPriorityQueueStatistics } from "@/core/heap/validation";
import { CheckCircle2, AlertTriangle, Layers, Zap, Scale } from "lucide-react";

export interface HeapComplexityCardProps {
  heapState?: HeapState<number>;
  pqState?: PriorityQueueState;
  className?: string;
}

export function HeapComplexityCard({
  heapState,
  pqState,
  className,
}: HeapComplexityCardProps) {
  const heapStats = React.useMemo(() => {
    return heapState ? getHeapStatistics(heapState) : null;
  }, [heapState]);

  const pqStats = React.useMemo(() => {
    return pqState ? getPriorityQueueStatistics(pqState) : null;
  }, [pqState]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* 1. Live Statistics Card */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              {heapState ? `${heapState.heapType.toUpperCase()} Heap Metrics` : "Priority Queue Metrics"}
            </h4>
          </div>

          {heapStats && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                heapStats.isComplete
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              )}
            >
              {heapStats.isComplete ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Complete Tree
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Incomplete
                </>
              )}
            </span>
          )}

          {pqStats && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              Mode: {pqStats.mode.toUpperCase()}
            </span>
          )}
        </div>

        {heapStats && (
          <div className="grid grid-cols-4 gap-2 mt-3 text-center">
            <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Size (N)</div>
              <div className="text-base font-bold font-mono text-foreground">{heapStats.size}</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Height</div>
              <div className="text-base font-bold font-mono text-foreground">{heapStats.height}</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Root</div>
              <div className="text-base font-bold font-mono text-foreground">
                {heapStats.min !== null ? heapStats.min : "—"}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Leaves</div>
              <div className="text-base font-bold font-mono text-foreground">{heapStats.leaves}</div>
            </div>
          </div>
        )}

        {pqStats && (
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Total Tasks</div>
              <div className="text-base font-bold font-mono text-foreground">{pqStats.size}</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/40 border border-border/40 col-span-2">
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Highest Priority Task</div>
              <div className="text-xs font-bold font-mono text-foreground truncate px-1 mt-1">
                {pqStats.highestPriorityTask
                  ? `"${pqStats.highestPriorityTask.value}" (Pri: ${pqStats.highestPriorityTask.priority})`
                  : "None"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Asymptotic Complexity Table */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
          <Zap className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-semibold text-foreground">Time & Space Complexity</h4>
        </div>

        <div className="mt-2 text-xs divide-y divide-border/40 font-mono">
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground font-sans">Insert (Sift Up)</span>
            <span className="font-semibold text-emerald-500">O(log n)</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground font-sans">Extract Root (Sift Down)</span>
            <span className="font-semibold text-emerald-500">O(log n)</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground font-sans">Peek Root</span>
            <span className="font-semibold text-emerald-500">O(1)</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground font-sans">Build Heap (Bottom-up)</span>
            <span className="font-semibold text-purple-500">O(n)</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground font-sans">Search / Arbitrary Delete</span>
            <span className="font-semibold text-amber-500">O(n) / O(log n)</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground font-sans">Space Complexity</span>
            <span className="font-semibold text-sky-500">O(n)</span>
          </div>
        </div>
      </div>

      {/* 3. Heap vs BST Comparison */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
          <Scale className="w-4 h-4 text-purple-500" />
          <h4 className="text-sm font-semibold text-foreground">Heap vs BST</h4>
        </div>
        <div className="mt-2 text-xs text-muted-foreground space-y-1.5">
          <p>
            • <strong className="text-foreground">Heap</strong> provides <span className="text-emerald-500 font-mono">O(1)</span> peek and guarantees complete shape stored compactly in an array.
          </p>
          <p>
            • <strong className="text-foreground">BST</strong> maintains total sorted order allowing <span className="text-sky-500 font-mono">O(log n)</span> arbitrary search, whereas Heaps only partially order parent/child.
          </p>
        </div>
      </div>
    </div>
  );
}
