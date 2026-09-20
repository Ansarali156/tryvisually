"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { CollisionStrategy, HashTableOperationType } from "@/core/hash-table/types";
import { HASH_TABLE_OPERATIONS } from "@/core/hash-table/types";
import { Clock, BookOpen, CheckCircle, Repeat, Skull, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface HashTableComplexityCardProps {
  operation: HashTableOperationType;
  strategy: CollisionStrategy;
  loadFactor: number;
  className?: string;
}

export function HashTableComplexityCard({
  operation,
  strategy,
  loadFactor,
  className,
}: HashTableComplexityCardProps) {
  const opMeta =
    HASH_TABLE_OPERATIONS.find((op) => op.id === operation) || HASH_TABLE_OPERATIONS[0];

  const strategyLabel =
    strategy === "chaining"
      ? "Separate Chaining"
      : strategy === "linear-probing"
      ? "Linear Probing"
      : "Quadratic Probing";

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-surface-900 space-y-5 select-none",
        className
      )}
    >
      {/* 1. Operation Complexity Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {opMeta.name}
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">{opMeta.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="neutral" size="sm">
              {strategyLabel}
            </Badge>
            <Badge variant="brand" size="sm">
              {opMeta.category}
            </Badge>
          </div>
        </div>

        {/* Complexity Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-950/80 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-semibold">
              Best Time
            </span>
            <span className="font-bold text-brand-600 dark:text-brand-400">
              {opMeta.timeComplexity.best}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-950/80 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-semibold">
              Average Time
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {opMeta.timeComplexity.average}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-950/80 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-semibold">
              Worst Time
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {opMeta.timeComplexity.worst}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-950/80 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-semibold">
              Space (Aux)
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {opMeta.spaceComplexity}
            </span>
          </div>
        </div>
      </div>

      {/* Load Factor Visualizer Bar */}
      <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-950/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Load Factor (α = n / k)
          </span>
          <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
            {loadFactor.toFixed(2)}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-surface-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300 rounded-full",
              loadFactor > 0.75
                ? "bg-rose-500"
                : loadFactor > 0.5
                ? "bg-amber-500"
                : "bg-emerald-500"
            )}
            style={{ width: `${Math.min(100, Math.round(loadFactor * 100))}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500">
          {loadFactor > 0.75
            ? "High load factor! Collisions increase significantly in open addressing."
            : "Optimal load factor for fast O(1) average lookup performance."}
        </p>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* 2. Educational Section: Key Concepts */}
      <div className="space-y-3 font-sans">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <BookOpen className="h-3.5 w-3.5" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Core Hash Table Concepts
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-2 rounded-lg bg-surface-50 dark:bg-surface-950 flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Hash Function
              </span>
              <span>Converts arbitrary string keys into integer bucket indexes modulo table capacity.</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-surface-50 dark:bg-surface-950 flex items-start gap-2">
            <Repeat className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Collision Resolution
              </span>
              <span>Chaining appends to linked lists; Open Addressing probes for empty alternative slots.</span>
            </div>
          </div>

          {strategy !== "chaining" && (
            <div className="p-2 rounded-lg bg-surface-50 dark:bg-surface-950 flex items-start gap-2 col-span-1 sm:col-span-2 border border-amber-200 dark:border-amber-900/40">
              <Skull className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Why Tombstones? (Deleted Slots)
                </span>
                <span>
                  In open addressing, deleting an entry marks its slot as a Tombstone instead of Empty.
                  If it were set to Empty, future searches for keys that collided past this position would prematurely terminate!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
