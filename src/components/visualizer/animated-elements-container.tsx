"use client";

import * as React from "react";
import type {
  VisualizationState,
  VisualizationHighlight,
} from "@/core/visualization/types";
import type { PlaybackSpeed } from "@/core/execution/types";
import { useVisualizationAnimation } from "@/core/animation/hooks/use-visualization-animation";
import { getElementInterpolatedStyle } from "@/core/animation/renderer/animation-renderer";
import { cn } from "@/lib/utils";
import { Sparkles, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface AnimatedElementsContainerProps {
  visualizationState: VisualizationState<unknown> | null;
  resolvedHighlights?: ReadonlyMap<string, VisualizationHighlight>;
  speed?: PlaybackSpeed;
  className?: string;
}

export function AnimatedElementsContainer({
  visualizationState,
  resolvedHighlights,
  speed = 1,
  className,
}: AnimatedElementsContainerProps) {
  const {
    isAnimating,
    progress,
    interpolatedTransforms,
    transitions,
  } = useVisualizationAnimation({
    visualizationState,
    speed,
    baseDurationMs: 350,
  });

  if (!visualizationState) {
    return null;
  }

  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-surface-50 dark:bg-surface-950/70 border border-slate-100 dark:border-slate-800 space-y-3",
        className
      )}
      role="region"
      aria-label="Animated Visualizer State"
    >
      {/* Container Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-brand-600" />
            Animated State Presentation
          </span>
          {isAnimating ? (
            <Badge variant="brand" size="sm" className="font-mono text-[10px]">
              <Sparkles className="h-2.5 w-2.5 mr-1 animate-spin" />
              Animating ({Math.round(progress * 100)}%)
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
              Settled
            </Badge>
          )}
        </div>

        {transitions.length > 0 && (
          <span className="text-[10px] font-mono text-slate-400">
            {transitions.length} {transitions.length === 1 ? "transition" : "transitions"} ({transitions.map((t) => t.type).join(", ")})
          </span>
        )}
      </div>

      {/* Elements Stage */}
      <div className="relative min-h-[90px] flex items-center justify-center py-2 overflow-x-auto">
        <div className="flex items-center gap-4 relative">
          {visualizationState.elements.map((item) => {
            const resolvedHl = resolvedHighlights?.get(item.id);
            const isHighlighted = !!resolvedHl;
            const interpolated = interpolatedTransforms.get(item.id);
            const dynamicStyle = getElementInterpolatedStyle(interpolated, undefined);

            return (
              <div
                key={item.id}
                style={dynamicStyle}
                className="flex flex-col items-center gap-1 transition-colors duration-150"
              >
                <span className="text-[9px] font-mono text-slate-400">
                  {item.id}
                </span>

                <div
                  className={cn(
                    "w-12 h-12 rounded-xl border-2 flex items-center justify-center font-mono font-bold text-sm shadow-sm transition-all duration-200",
                    isHighlighted
                      ? "border-brand-600 bg-brand-500 text-white shadow-md scale-105"
                      : item.state === "visited"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "border-slate-300 bg-white text-slate-800 dark:border-slate-700 dark:bg-surface-900 dark:text-slate-200"
                  )}
                >
                  {String(item.value)}
                </div>

                <span className="text-[9px] font-mono text-slate-500">
                  {resolvedHl?.type ?? item.state ?? "default"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
