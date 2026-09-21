"use client";

import * as React from "react";
import type {
  VisualizationState,
  VisualizationHighlight,
} from "@/core/visualization/types";
import type { PlaybackSpeed } from "@/core/execution/types";
import type { QueueState, QueueVariant } from "@/core/queue/types";
import { useVisualizationAnimation } from "@/core/animation/hooks/use-visualization-animation";
import { getElementFlowStyle } from "@/core/animation/renderer/animation-renderer";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, CornerDownLeft, Layers } from "lucide-react";

export interface QueueRendererProps {
  /** Authoritative visualization state derived from current ExecutionStep */
  visualizationState: VisualizationState<QueueState> | null;

  /** Pre-resolved winning highlights for each element */
  resolvedHighlights?: ReadonlyMap<string, VisualizationHighlight>;

  /** Optional explicit queue variant override */
  variant?: QueueVariant;

  /** Playback speed for transition timing */
  speed?: PlaybackSpeed;

  /** Additional styling classes */
  className?: string;
}

export function QueueRenderer({
  visualizationState,
  resolvedHighlights,
  variant: _variant,
  speed = 1,
  className,
}: QueueRendererProps) {
  const { interpolatedTransforms } = useVisualizationAnimation({
    visualizationState,
    speed,
    baseDurationMs: 350,
  });

  if (!visualizationState || visualizationState.elements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl min-h-[260px]">
        <Layers className="h-8 w-8 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
        <span className="text-xs font-mono font-medium">Empty Queue: FRONT and REAR are NULL</span>
        <span className="text-[11px] text-slate-400 mt-1">Enqueue an element to begin.</span>
      </div>
    );
  }

  const isCircular =
    visualizationState.sourceState?.variant === "circular" ||
    visualizationState.elements[0]?.metadata?.variant === "circular";

  const frontAnnotation = visualizationState.annotations.find((a) => a.text === "FRONT");
  const rearAnnotation = visualizationState.annotations.find((a) => a.text === "REAR");

  const frontId = frontAnnotation?.targetId;
  const rearId = rearAnnotation?.targetId;

  // Detect circular wrap-around if rear is before front
  const sourceState = visualizationState.sourceState;
  const isWrapped =
    isCircular &&
    sourceState &&
    sourceState.size > 1 &&
    sourceState.rearIndex < sourceState.frontIndex;

  return (
    <div
      className={cn(
        "relative w-full overflow-x-auto py-8 px-6 flex flex-col items-center justify-center min-h-[280px]",
        className
      )}
      role="region"
      aria-label="Queue Visualization Viewport"
    >
      {/* Horizontal Queue Lane */}
      <div
        className="flex items-center justify-center gap-2 sm:gap-3 min-w-max p-4"
        role="list"
        aria-label="Queue Elements"
      >
        {visualizationState.elements.map((element, index) => {
          const isOccupied = element.metadata?.isOccupied !== false;
          const isFront = element.id === frontId || (element.metadata?.isFront as boolean);
          const isRear = element.id === rearId || (element.metadata?.isRear as boolean);
          const slotIndex = (element.metadata?.slotIndex as number) ?? index;
          const highlight = resolvedHighlights?.get(element.id);
          const interpolated = interpolatedTransforms.get(element.id);
          const dynamicStyle = getElementFlowStyle(interpolated, element.position);

          const getElementStyles = () => {
            if (!isOccupied) {
              return "bg-slate-50 dark:bg-surface-950 border-dashed border-slate-300 dark:border-slate-800 text-slate-400 opacity-60";
            }

            if (!highlight) {
              return "bg-white dark:bg-surface-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-xs";
            }

            switch (highlight.type) {
              case "inserted":
                return "bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400 scale-105";
              case "deleted":
                return "bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-800 dark:text-rose-200 line-through opacity-70 scale-95";
              case "active":
              default:
                return "bg-brand-600 border-brand-700 text-white font-bold ring-4 ring-brand-200/60 dark:ring-brand-900/40 shadow-md scale-105";
            }
          };

          return (
            <div
              key={element.id} // CRITICAL: stable key based on element ID
              style={dynamicStyle}
              className="flex flex-col items-center select-none"
              role="listitem"
              aria-label={`Queue slot ${slotIndex}, value ${element.label}${
                isFront ? ", FRONT" : ""
              }${isRear ? ", REAR" : ""}`}
            >
              {/* Top: FRONT Marker */}
              <div className="h-8 flex items-end justify-center mb-1">
                {isFront && (
                  <div className="flex flex-col items-center animate-bounce duration-500">
                    <span className="bg-blue-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs uppercase">
                      FRONT
                    </span>
                    <ArrowDown className="h-3 w-3 text-blue-600 dark:text-blue-400 -mt-0.5" />
                  </div>
                )}
              </div>

              {/* Center: Element Box */}
              <div
                className={cn(
                  "w-14 h-14 rounded-xl border-2 flex items-center justify-center font-mono font-bold text-base transition-all duration-200",
                  getElementStyles()
                )}
                data-element-id={element.id}
                data-slot-index={slotIndex}
              >
                {element.label}
              </div>

              {/* Bottom: REAR Marker or Slot Index */}
              <div className="h-8 flex flex-col items-center justify-start mt-1">
                {isRear && (
                  <div className="flex flex-col items-center animate-bounce duration-500">
                    <ArrowUp className="h-3 w-3 text-purple-600 dark:text-purple-400 -mb-0.5" />
                    <span className="bg-purple-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs uppercase">
                      REAR
                    </span>
                  </div>
                )}
                {!isRear && isCircular && (
                  <span className="text-[10px] font-mono text-slate-400">
                    [{slotIndex}]
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Circular Wrap-around Notice */}
      {isWrapped && (
        <div className="w-full flex items-center justify-center mt-2 px-8">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 px-3 py-1 rounded-full shadow-xs">
            <CornerDownLeft className="h-3.5 w-3.5" />
            <span>Wrap-Around: REAR is at slot [{sourceState?.rearIndex}], before FRONT at slot [{sourceState?.frontIndex}]</span>
          </div>
        </div>
      )}
    </div>
  );
}
