"use client";

import * as React from "react";
import type {
  VisualizationState,
  VisualizationHighlight,
} from "@/core/visualization/types";
import type { PlaybackSpeed } from "@/core/execution/types";
import type { ArrayState } from "@/core/array/types";
import { useVisualizationAnimation } from "@/core/animation/hooks/use-visualization-animation";
import { getElementInterpolatedStyle } from "@/core/animation/renderer/animation-renderer";
import { cn } from "@/lib/utils";
import { ArrowDown, Layers } from "lucide-react";

export interface ArrayRendererProps {
  /** Authoritative visualization state derived from current ExecutionStep */
  visualizationState: VisualizationState<ArrayState> | null;

  /** Pre-resolved winning highlights for each element */
  resolvedHighlights?: ReadonlyMap<string, VisualizationHighlight>;

  /** Playback speed for transition timing */
  speed?: PlaybackSpeed;

  /** Additional styling classes */
  className?: string;
}

export function ArrayRenderer({
  visualizationState,
  resolvedHighlights,
  speed = 1,
  className,
}: ArrayRendererProps) {
  const { interpolatedTransforms } = useVisualizationAnimation({
    visualizationState,
    speed,
    baseDurationMs: 350,
  });

  if (!visualizationState || visualizationState.elements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
        <Layers className="h-8 w-8 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
        <span className="text-xs font-mono">Empty Array: No elements present</span>
      </div>
    );
  }

  // Group annotations by target element ID for rendering educational pointers
  const pointersByElementId = new Map<string, string[]>();
  for (const anno of visualizationState.annotations) {
    if (anno.targetId && anno.type === "pointer") {
      const current = pointersByElementId.get(anno.targetId) || [];
      current.push(anno.text);
      pointersByElementId.set(anno.targetId, current);
    }
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-x-auto py-6 px-4 flex flex-col items-center justify-center min-h-[220px]",
        className
      )}
      role="region"
      aria-label="Array Visualization Viewport"
    >
      <div
        className="flex items-end justify-center gap-3 md:gap-4 min-w-max p-4"
        role="list"
        aria-label="Array Elements List"
      >
        {visualizationState.elements.map((element) => {
          const rawIndex = (element.metadata?.index as number) ?? 0;
          const highlight = resolvedHighlights?.get(element.id);
          const interpolated = interpolatedTransforms.get(element.id);
          const dynamicStyle = getElementInterpolatedStyle(interpolated, element.position);
          const pointers = pointersByElementId.get(element.id) || [];
          const isHighlighted = !!highlight;

          // State-based thematic visual styling
          const getElementStyles = () => {
            if (!highlight) {
              return "bg-white dark:bg-surface-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-xs";
            }

            switch (highlight.type) {
              case "compare":
                return "bg-amber-400 border-amber-500 text-slate-950 font-extrabold ring-4 ring-amber-200/60 dark:ring-amber-900/40 shadow-md scale-105";
              case "swapped":
                return "bg-rose-500 border-rose-600 text-white font-extrabold ring-4 ring-rose-200/60 dark:ring-rose-900/40 shadow-md scale-105";
              case "found":
                return "bg-emerald-500 border-emerald-600 text-white font-extrabold ring-4 ring-emerald-200/60 dark:ring-emerald-900/40 shadow-lg scale-110";
              case "inserted":
                return "bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400";
              case "deleted":
                return "bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-800 dark:text-rose-200 line-through opacity-70";
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
              className="flex flex-col items-center transition-all duration-200 select-none"
              role="listitem"
              aria-label={`Array element at index ${rawIndex}, value ${element.label}${
                highlight ? `, state ${highlight.type}` : ""
              }`}
            >
              {/* Top: Pointer Markers (e.g. i, j, target) */}
              <div className="h-8 flex items-end justify-center mb-1">
                {pointers.length > 0 && (
                  <div className="flex flex-col items-center animate-bounce duration-500">
                    <div className="flex items-center gap-1 bg-brand-700 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs uppercase">
                      {pointers.join(", ")}
                    </div>
                    <ArrowDown className="h-3 w-3 text-brand-700 dark:text-brand-400 -mt-0.5" />
                  </div>
                )}
              </div>

              {/* Center: Array Element Box */}
              <div
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center font-mono font-bold text-base sm:text-lg transition-colors",
                  getElementStyles()
                )}
                data-element-id={element.id}
                data-array-index={rawIndex}
              >
                {element.label}
              </div>

              {/* Bottom: Array Index Indicator */}
              <div className="flex flex-col items-center mt-2">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                  INDEX
                </span>
                <span
                  className={cn(
                    "text-xs font-mono font-bold px-1.5 py-0.5 rounded transition-colors",
                    isHighlighted
                      ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800"
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {rawIndex}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
