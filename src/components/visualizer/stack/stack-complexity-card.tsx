"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { StackOperationType } from "@/core/stack/types";
import { STACK_OPERATIONS } from "@/core/stack/types";
import { Clock, BookOpen, CheckCircle, ArrowDownUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface StackComplexityCardProps {
  operation: StackOperationType;
  className?: string;
}

export function StackComplexityCard({ operation, className }: StackComplexityCardProps) {
  const opMeta =
    STACK_OPERATIONS.find((op) => op.id === operation) || STACK_OPERATIONS[0];

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
                {opMeta.name} Complexity
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">{opMeta.description}</p>
            </div>
          </div>
          <Badge variant="brand" size="sm">
            {opMeta.category}
          </Badge>
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
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
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

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* 2. Educational Section: What is a Stack? */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <BookOpen className="h-3.5 w-3.5" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">
            What is a Stack?
          </h4>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
          A Stack is a linear data structure that operates under the <strong>LIFO (Last In, First Out)</strong> principle.
          All insertions (push) and deletions (pop) occur exclusively at one end called the <strong>TOP</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 font-sans">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-950">
            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                O(1) Constant Time
              </span>
              <span>Push and pop take O(1) time because the TOP index is directly tracked.</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-950">
            <ArrowDownUp className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Stack vs Queue
              </span>
              <span>Stack is LIFO (one-ended: TOP); Queue is FIFO (two-ended: FRONT and REAR).</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
