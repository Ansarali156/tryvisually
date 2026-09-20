"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { QueueOperationType, QueueVariant } from "@/core/queue/types";
import { QUEUE_OPERATIONS } from "@/core/queue/types";
import { Clock, BookOpen, CheckCircle, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface QueueComplexityCardProps {
  operation: QueueOperationType;
  variant?: QueueVariant;
  className?: string;
}

export function QueueComplexityCard({
  operation,
  variant = "linear",
  className,
}: QueueComplexityCardProps) {
  const opMeta =
    QUEUE_OPERATIONS.find((op) => op.id === operation) || QUEUE_OPERATIONS[0];

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
          <div className="flex items-center gap-1.5">
            <Badge variant="neutral" size="sm" className="capitalize">
              {variant}
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

      {/* 2. Educational Section: What is a Queue? */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <BookOpen className="h-3.5 w-3.5" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">
            {variant === "circular" ? "What is a Circular Queue?" : "What is a Queue?"}
          </h4>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
          {variant === "circular" ? (
            <>
              A <strong>Circular Queue</strong> (Ring Buffer) connects the last position back to the first using modulo arithmetic: <code>(rear + 1) % capacity</code>. This reuses vacated slots at the front after dequeues, overcoming linear array memory wastage.
            </>
          ) : (
            <>
              A Queue is a linear data structure following the <strong>FIFO (First In, First Out)</strong> principle. Items are inserted at the <strong>REAR</strong> (enqueue) and removed from the <strong>FRONT</strong> (dequeue), exactly like a real-world checkout queue.
            </>
          )}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 font-sans">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-950">
            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                O(1) Enqueue & Dequeue
              </span>
              <span>Front and rear pointers allow constant-time access without shifting elements.</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-950">
            <Repeat className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Modulo Wrap-Around
              </span>
              <span>Circular queues use <code>(index + 1) % capacity</code> for continuous reuse.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
