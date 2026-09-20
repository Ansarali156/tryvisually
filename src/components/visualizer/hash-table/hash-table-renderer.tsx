"use client";

import * as React from "react";
import type {
  VisualizationState,
  VisualizationHighlight,
} from "@/core/visualization/types";
import type { PlaybackSpeed } from "@/core/execution/types";
import type { HashTableState } from "@/core/hash-table/types";
import { useVisualizationAnimation } from "@/core/animation/hooks/use-visualization-animation";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Database,
  Search,
  AlertTriangle,
  CheckCircle2,
  Skull,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface HashTableRendererProps {
  /** Authoritative visualization state derived from current ExecutionStep */
  visualizationState: VisualizationState<HashTableState> | null;

  /** Pre-resolved winning highlights for each element */
  resolvedHighlights?: ReadonlyMap<string, VisualizationHighlight>;

  /** Playback speed for transition timing */
  speed?: PlaybackSpeed;

  /** Additional styling classes */
  className?: string;
}

export function HashTableRenderer({
  visualizationState,
  resolvedHighlights,
  speed = 1,
  className,
}: HashTableRendererProps) {
  const { interpolatedTransforms } = useVisualizationAnimation({
    visualizationState,
    speed,
    baseDurationMs: 350,
  });

  const state = visualizationState?.sourceState;

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl min-h-[300px]">
        <Database className="h-8 w-8 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
        <span className="text-xs font-mono font-medium">No Hash Table Initialized</span>
      </div>
    );
  }

  const isChaining = state.collisionStrategy === "chaining";
  const probeSequence = state.probeSequence || [];

  return (
    <div
      className={cn(
        "relative w-full overflow-x-auto py-6 px-4 flex flex-col items-center justify-center min-h-[340px]",
        className
      )}
      role="region"
      aria-label="Hash Table Visualization Viewport"
    >
      {/* 1. SEPARATE CHAINING VIEW */}
      {isChaining && state.buckets && (
        <div className="w-full max-w-2xl flex flex-col gap-2.5" role="list" aria-label="Hash Buckets">
          {state.buckets.map((bucket) => {
            const bucketHighlight = resolvedHighlights?.get(`bucket-${bucket.index}`);
            const hasCollision = bucket.entries.length > 1;

            return (
              <div
                key={`bucket-row-${bucket.index}`}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-xl border transition-all duration-200",
                  bucketHighlight
                    ? "bg-brand-50/70 dark:bg-brand-950/40 border-brand-400 dark:border-brand-600 shadow-xs"
                    : "bg-surface-50 dark:bg-surface-950/50 border-slate-200/80 dark:border-slate-800"
                )}
                role="listitem"
                aria-label={`Bucket ${bucket.index}, ${bucket.entries.length} entries`}
              >
                {/* Bucket Header / Index Badge */}
                <div className="flex items-center gap-2 min-w-[75px] shrink-0">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shadow-2xs",
                      bucketHighlight
                        ? "bg-brand-600 text-white"
                        : "bg-slate-200 text-slate-700 dark:bg-surface-800 dark:text-slate-300"
                    )}
                  >
                    {bucket.index}
                  </div>
                  {hasCollision && (
                    <span
                      title="Collision: Multiple entries chained in this bucket"
                      className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center"
                    >
                      <AlertTriangle className="h-3 w-3" />
                    </span>
                  )}
                </div>

                {/* Horizontal Chained Entries */}
                <div className="flex items-center gap-2 overflow-x-auto py-0.5 flex-1 min-h-[36px]">
                  {bucket.entries.length === 0 ? (
                    <span className="text-xs font-mono text-slate-400 italic">null / empty</span>
                  ) : (
                    bucket.entries.map((entry, idx) => {
                      const entryHighlight = resolvedHighlights?.get(entry.id);

                      const getEntryStyles = () => {
                        if (!entryHighlight) {
                          return "bg-white dark:bg-surface-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs";
                        }
                        switch (entryHighlight.type) {
                          case "found":
                            return "bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400 font-bold scale-105";
                          case "compare":
                            return "bg-sky-100 dark:bg-sky-950 border-sky-500 text-sky-900 dark:text-sky-200 ring-2 ring-sky-400 font-bold";
                          case "inserted":
                            return "bg-teal-100 dark:bg-teal-950 border-teal-500 text-teal-900 dark:text-teal-200 ring-2 ring-teal-400 font-bold scale-105";
                          case "deleted":
                            return "bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-900 dark:text-rose-200 line-through opacity-70";
                          case "active":
                          default:
                            return "bg-amber-100 dark:bg-amber-950 border-amber-500 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400 font-bold";
                        }
                      };

                      return (
                        <React.Fragment key={entry.id}>
                          {idx > 0 && (
                            <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          )}
                          <div
                            className={cn(
                              "px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-mono text-xs select-none transition-all duration-200 shrink-0",
                              getEntryStyles()
                            )}
                            data-entry-id={entry.id}
                          >
                            <span className="font-semibold">{entry.key}:</span>
                            <span className="text-brand-600 dark:text-brand-400 font-bold">
                              {entry.value}
                            </span>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. OPEN ADDRESSING VIEW (Linear & Quadratic Probing) */}
      {!isChaining && state.slots && (
        <div className="w-full flex flex-col items-center gap-4">
          {/* Slot Track */}
          <div
            className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap max-w-full p-2"
            role="list"
            aria-label="Hash Table Slots"
          >
            {state.slots.map((slot) => {
              const slotHighlight = resolvedHighlights?.get(`slot-${slot.index}`);
              const entryHighlight = slot.entry ? resolvedHighlights?.get(slot.entry.id) : undefined;
              const activeHighlight = entryHighlight || slotHighlight;

              const getSlotStyles = () => {
                if (activeHighlight) {
                  switch (activeHighlight.type) {
                    case "found":
                      return "bg-emerald-100 dark:bg-emerald-950 border-emerald-500 ring-2 ring-emerald-400";
                    case "inserted":
                      return "bg-teal-100 dark:bg-teal-950 border-teal-500 ring-2 ring-teal-400";
                    case "compare":
                      return "bg-sky-100 dark:bg-sky-950 border-sky-500 ring-2 ring-sky-400";
                    case "deleted":
                      return "bg-rose-100 dark:bg-rose-950 border-rose-500 line-through opacity-75";
                    default:
                      return "bg-amber-100 dark:bg-amber-950 border-amber-500 ring-2 ring-amber-400";
                  }
                }

                switch (slot.status) {
                  case "occupied":
                    return "bg-white dark:bg-surface-900 border-slate-200 dark:border-slate-700 shadow-xs";
                  case "deleted":
                    return "bg-rose-50/50 dark:bg-rose-950/20 border-dashed border-rose-300 dark:border-rose-900/60";
                  case "empty":
                  default:
                    return "bg-surface-50 dark:bg-surface-950/40 border-dashed border-slate-200 dark:border-slate-800 text-slate-400";
                }
              };

              return (
                <div
                  key={`slot-${slot.index}`}
                  className={cn(
                    "w-28 sm:w-32 min-h-[95px] p-2.5 rounded-xl border flex flex-col justify-between select-none transition-all duration-200",
                    getSlotStyles()
                  )}
                  role="listitem"
                  aria-label={`Slot ${slot.index}, status ${slot.status}${
                    slot.entry ? `, key ${slot.entry.key}, value ${slot.entry.value}` : ""
                  }`}
                  data-slot-id={`slot-${slot.index}`}
                >
                  {/* Top Bar: Slot Index & Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      [{slot.index}]
                    </span>

                    {slot.status === "occupied" && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold">
                        OCCUPIED
                      </span>
                    )}

                    {slot.status === "deleted" && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold flex items-center gap-0.5">
                        <Skull className="h-2.5 w-2.5" />
                        TOMB
                      </span>
                    )}

                    {slot.status === "empty" && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 dark:bg-surface-800 font-medium">
                        EMPTY
                      </span>
                    )}
                  </div>

                  {/* Body: Key-Value Payload or Empty Placeholder */}
                  <div className="my-1 flex flex-col justify-center">
                    {slot.status === "occupied" && slot.entry ? (
                      <div className="font-mono text-xs">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {slot.entry.key}
                        </div>
                        <div className="text-brand-600 dark:text-brand-400 text-[11px] font-semibold truncate">
                          ↳ {slot.entry.value}
                        </div>
                      </div>
                    ) : slot.status === "deleted" ? (
                      <div className="text-[11px] font-mono text-rose-500 dark:text-rose-400 italic">
                        Deleted
                      </div>
                    ) : (
                      <div className="text-[11px] font-mono text-slate-400 italic">
                        Empty
                      </div>
                    )}
                  </div>

                  {/* Bottom: Probed marker if part of sequence */}
                  <div className="h-3 flex items-center justify-end">
                    {probeSequence.includes(slot.index) && (
                      <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                        Probe #{probeSequence.indexOf(slot.index)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Probe Trail Banner */}
          {probeSequence.length > 0 && (
            <div className="flex items-center gap-2 p-2 px-3 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs font-mono text-amber-800 dark:text-amber-300 shadow-2xs">
              <span className="font-bold uppercase tracking-wider text-[10px]">Probe Trail:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {probeSequence.map((idx, step) => (
                  <React.Fragment key={`probe-step-${step}-${idx}`}>
                    {step > 0 && <span className="text-amber-400">→</span>}
                    <span className="px-1.5 py-0.5 rounded bg-white dark:bg-surface-900 font-semibold">
                      [{idx}]
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
