"use client";

import * as React from "react";
import type {
  VisualizationState,
  VisualizationHighlight,
} from "@/core/visualization/types";
import type { PlaybackSpeed } from "@/core/execution/types";
import type { LinkedListState } from "@/core/linked-list/types";
import { useVisualizationAnimation } from "@/core/animation/hooks/use-visualization-animation";
import { getElementInterpolatedStyle } from "@/core/animation/renderer/animation-renderer";
import { cn } from "@/lib/utils";
import { ArrowDown, CornerDownLeft, GitCommit, Layers } from "lucide-react";

export interface LinkedListRendererProps {
  /** Authoritative visualization state derived from current ExecutionStep */
  visualizationState: VisualizationState<LinkedListState> | null;

  /** Pre-resolved winning highlights for each element */
  resolvedHighlights?: ReadonlyMap<string, VisualizationHighlight>;

  /** Playback speed for transition timing */
  speed?: PlaybackSpeed;

  /** Additional styling classes */
  className?: string;
}

export function LinkedListRenderer({
  visualizationState,
  resolvedHighlights,
  speed = 1,
  className,
}: LinkedListRendererProps) {
  const { interpolatedTransforms } = useVisualizationAnimation({
    visualizationState,
    speed,
    baseDurationMs: 350,
  });

  if (!visualizationState || visualizationState.elements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
        <Layers className="h-8 w-8 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
        <span className="text-xs font-mono">Empty List: HEAD → NULL</span>
      </div>
    );
  }

  // Derive variant from sourceState, element metadata, or default to singly
  const variant =
    visualizationState.sourceState?.variant ||
    (visualizationState.elements[0]?.metadata?.variant as string) ||
    "singly";
  const isDoubly = variant === "doubly";
  const isCircular = variant === "circular";

  // Group annotations by target element ID for rendering educational pointers (HEAD, TAIL, curr, etc.)
  const pointersByElementId = new Map<string, string[]>();
  for (const anno of visualizationState.annotations) {
    if (anno.targetId && (anno.type === "pointer" || anno.type === "label")) {
      const current = pointersByElementId.get(anno.targetId) || [];
      if (!current.includes(anno.text)) {
        current.push(anno.text);
      }
      pointersByElementId.set(anno.targetId, current);
    }
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-x-auto py-8 px-6 flex flex-col items-center justify-center min-h-[260px]",
        className
      )}
      role="region"
      aria-label="Linked List Visualization Viewport"
    >
      {/* Node chain container */}
      <div
        className="flex items-center justify-start sm:justify-center gap-0 min-w-max p-4 relative"
        role="list"
        aria-label="Linked List Nodes"
      >
        {visualizationState.elements.map((element, index) => {
          const highlight = resolvedHighlights?.get(element.id);
          const interpolated = interpolatedTransforms.get(element.id);
          const dynamicStyle = getElementInterpolatedStyle(interpolated, element.position);
          const pointers = pointersByElementId.get(element.id) || [];
          const isLast = index === visualizationState.elements.length - 1;

          // State-based node background and border styling
          const getNodeStyles = () => {
            if (!highlight) {
              return "bg-white dark:bg-surface-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-xs";
            }

            switch (highlight.type) {
              case "compare":
                return "bg-amber-400 border-amber-500 text-slate-950 font-extrabold ring-4 ring-amber-200/60 dark:ring-amber-900/40 shadow-md scale-105";
              case "swapped":
                return "bg-purple-500 border-purple-600 text-white font-extrabold ring-4 ring-purple-200/60 dark:ring-purple-900/40 shadow-md scale-105";
              case "found":
                return "bg-emerald-500 border-emerald-600 text-white font-extrabold ring-4 ring-emerald-200/60 dark:ring-emerald-900/40 shadow-lg scale-110";
              case "inserted":
                return "bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400";
              case "deleted":
                return "bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-800 dark:text-rose-200 line-through opacity-60";
              case "visited":
                return "bg-slate-100 dark:bg-surface-800 border-emerald-400 dark:border-emerald-600 text-slate-700 dark:text-slate-200";
              case "active":
              default:
                return "bg-brand-600 border-brand-700 text-white font-bold ring-4 ring-brand-200/60 dark:ring-brand-900/40 shadow-md scale-105";
            }
          };

          return (
            <div
              key={element.id} // CRITICAL: stable key based on element ID, NOT index!
              style={dynamicStyle}
              className="flex items-center select-none"
              role="listitem"
              aria-label={`Node ${element.id}, value ${element.label}${
                highlight ? `, state ${highlight.type}` : ""
              }`}
            >
              {/* Single Node Component */}
              <div className="flex flex-col items-center">
                {/* Top: Pointer Markers (e.g. HEAD, TAIL, curr, prev) */}
                <div className="h-9 flex items-end justify-center mb-1">
                  {pointers.length > 0 && (
                    <div className="flex flex-col items-center animate-bounce duration-500">
                      <div className="flex items-center gap-1">
                        {pointers.map((p) => {
                          const isHead = p === "HEAD";
                          const isTail = p === "TAIL";
                          const isCurr = p === "curr";
                          return (
                            <span
                              key={p}
                              className={cn(
                                "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs uppercase",
                                isHead && "bg-blue-600 text-white",
                                isTail && "bg-purple-600 text-white",
                                isCurr && "bg-amber-500 text-slate-950",
                                !isHead && !isTail && !isCurr && "bg-brand-700 text-white"
                              )}
                            >
                              {p}
                            </span>
                          );
                        })}
                      </div>
                      <ArrowDown className="h-3 w-3 text-brand-600 dark:text-brand-400 -mt-0.5" />
                    </div>
                  )}
                </div>

                {/* Node Box with partitioned ports */}
                <div
                  className={cn(
                    "flex items-stretch rounded-xl border-2 transition-all duration-200 overflow-hidden font-mono",
                    getNodeStyles()
                  )}
                  data-node-id={element.id}
                >
                  {/* Prev pointer partition (Doubly only) */}
                  {isDoubly && (
                    <div
                      className="px-2 py-2.5 bg-slate-100/70 dark:bg-surface-800/70 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-semibold text-slate-500 dark:text-slate-400"
                      title="Previous pointer"
                    >
                      •
                    </div>
                  )}

                  {/* Value partition */}
                  <div className="px-3.5 py-2.5 min-w-[48px] flex items-center justify-center text-base font-bold">
                    {element.label}
                  </div>

                  {/* Next pointer partition */}
                  <div
                    className="px-2 py-2.5 bg-slate-100/70 dark:bg-surface-800/70 border-l border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-semibold text-slate-500 dark:text-slate-400"
                    title="Next pointer"
                  >
                    •
                  </div>
                </div>

                {/* Bottom: Node ID Label */}
                <div className="flex flex-col items-center mt-1.5">
                  <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500">
                    {element.id}
                  </span>
                </div>
              </div>

              {/* Inter-node Connector Arrow */}
              {!isLast ? (
                <div className="flex flex-col items-center justify-center px-1.5">
                  {/* Forward arrow */}
                  <div className="flex items-center text-slate-400 dark:text-slate-500">
                    <div className="w-5 md:w-7 h-[2px] bg-slate-400 dark:bg-slate-500" />
                    <span className="text-slate-400 dark:text-slate-500 -ml-1 text-xs">▶</span>
                  </div>
                  {/* Backward arrow (Doubly only) */}
                  {isDoubly && (
                    <div className="flex items-center text-slate-400 dark:text-slate-500 -mt-1">
                      <span className="text-slate-400 dark:text-slate-500 -mr-1 text-xs">◀</span>
                      <div className="w-5 md:w-7 h-[2px] bg-slate-400 dark:bg-slate-500" />
                    </div>
                  )}
                </div>
              ) : (
                /* Terminal connector for the last node */
                <div className="flex items-center pl-2">
                  {!isCircular ? (
                    /* Linear terminator: points to NULL */
                    <div className="flex items-center">
                      <div className="w-4 h-[2px] bg-slate-400 dark:bg-slate-500" />
                      <span className="text-slate-400 dark:text-slate-500 -ml-1 text-xs">▶</span>
                      <div className="ml-1.5 px-2 py-1 rounded bg-slate-200/70 dark:bg-surface-800/80 border border-slate-300 dark:border-slate-700 font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 select-none">
                        NULL
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Circular loopback indicator when circular list is rendered */}
      {isCircular && visualizationState.elements.length > 0 && (
        <div className="w-full flex items-center justify-center mt-2 px-8">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 px-3 py-1 rounded-full shadow-xs">
            <CornerDownLeft className="h-3.5 w-3.5" />
            <span>TAIL.next → HEAD ({visualizationState.elements[0]?.id})</span>
            <GitCommit className="h-3 w-3" />
          </div>
        </div>
      )}
    </div>
  );
}
