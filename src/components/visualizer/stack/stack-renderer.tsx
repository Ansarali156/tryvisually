"use client";

import * as React from "react";
import type {
  VisualizationState,
  VisualizationHighlight,
} from "@/core/visualization/types";
import type { PlaybackSpeed } from "@/core/execution/types";
import type { StackState } from "@/core/stack/types";
import { useVisualizationAnimation } from "@/core/animation/hooks/use-visualization-animation";
import { getElementInterpolatedStyle } from "@/core/animation/renderer/animation-renderer";
import { cn } from "@/lib/utils";
import { ArrowDown, Layers } from "lucide-react";

export interface StackRendererProps {
  /** Authoritative visualization state derived from current ExecutionStep */
  visualizationState: VisualizationState<StackState> | null;

  /** Pre-resolved winning highlights for each element */
  resolvedHighlights?: ReadonlyMap<string, VisualizationHighlight>;

  /** Playback speed for transition timing */
  speed?: PlaybackSpeed;

  /** Additional styling classes */
  className?: string;
}

export function StackRenderer({
  visualizationState,
  resolvedHighlights,
  speed = 1,
  className,
}: StackRendererProps) {
  const { interpolatedTransforms } = useVisualizationAnimation({
    visualizationState,
    speed,
    baseDurationMs: 350,
  });

  if (!visualizationState || visualizationState.elements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl min-h-[260px]">
        <Layers className="h-8 w-8 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
        <span className="text-xs font-mono font-medium">Empty Stack: TOP is NULL</span>
        <span className="text-[11px] text-slate-400 mt-1">Push an element to begin.</span>
      </div>
    );
  }

  // Find TOP element ID
  const topAnnotation = visualizationState.annotations.find((a) => a.text === "TOP");
  const topElementId = topAnnotation?.targetId || visualizationState.elements[visualizationState.elements.length - 1]?.id;

  return (
    <div
      className={cn(
        "relative w-full overflow-y-auto py-6 px-4 flex flex-col items-center justify-center min-h-[280px]",
        className
      )}
      role="region"
      aria-label="Stack Visualization Viewport"
    >
      {/* Top Indicator Header */}
      <div className="h-9 flex items-end justify-center mb-1">
        <div className="flex flex-col items-center animate-bounce duration-500">
          <span className="bg-brand-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
            TOP
          </span>
          <ArrowDown className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 -mt-0.5" />
        </div>
      </div>

      {/* Visual Stack Bucket Container (open top, bordered left, right, bottom) */}
      <div
        className="flex flex-col items-center border-l-2 border-r-2 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-surface-950/40 p-3 pt-2 rounded-b-2xl min-w-[170px] shadow-inner"
        role="list"
        aria-label="Stack Elements List"
      >
        {/* Render elements in reverse order so top element appears on top */}
        {[...visualizationState.elements].reverse().map((element, displayIndex) => {
          const rawIndex = (element.metadata?.index as number) ?? 0;
          const isTop = element.id === topElementId;
          const highlight = resolvedHighlights?.get(element.id);
          const interpolated = interpolatedTransforms.get(element.id);
          const dynamicStyle = getElementInterpolatedStyle(interpolated, element.position);

          const getElementStyles = () => {
            if (!highlight) {
              return isTop
                ? "bg-white dark:bg-surface-900 border-brand-500 dark:border-brand-500 text-slate-900 dark:text-slate-100 shadow-sm"
                : "bg-white dark:bg-surface-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs";
            }

            switch (highlight.type) {
              case "inserted":
                return "bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400 scale-105";
              case "deleted":
                return "bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-800 dark:text-rose-200 line-through opacity-70 scale-95";
              case "active":
              default:
                return "bg-amber-400 border-amber-500 text-slate-950 font-extrabold ring-4 ring-amber-200/60 dark:ring-amber-900/40 shadow-md scale-105";
            }
          };

          return (
            <div
              key={element.id} // CRITICAL: stable key based on element ID
              style={dynamicStyle}
              className="my-1 w-full flex items-center justify-between px-3 py-2 rounded-xl border-2 font-mono font-bold text-sm select-none transition-all duration-200"
              role="listitem"
              aria-label={`Stack element index ${rawIndex}, value ${element.label}${
                isTop ? ", TOP" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-normal">
                  [{rawIndex}]
                </span>
                <span className={cn(getElementStyles(), "px-2 py-0.5 rounded-lg border")}>
                  {element.label}
                </span>
              </div>

              {isTop && (
                <span className="text-[10px] font-sans font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  TOP
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom base label */}
      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-1.5">
        BOTTOM
      </span>
    </div>
  );
}
