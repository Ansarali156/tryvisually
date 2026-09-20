"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { HeapElement, HeapState, PriorityQueueElement, PriorityQueueState } from "@/core/heap/types";
import { getLeftChildIndex, getRightChildIndex, getParentIndex } from "@/core/heap/validation";

export interface HeapArrayViewProps {
  heapState?: HeapState<number>;
  pqState?: PriorityQueueState;
  highlightedElements?: readonly string[];
  onSelectIndex?: (index: number) => void;
  className?: string;
}

export function HeapArrayView({
  heapState,
  pqState,
  highlightedElements = [],
  onSelectIndex,
  className,
}: HeapArrayViewProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const highlightedSet = React.useMemo(() => {
    return new Set(highlightedElements);
  }, [highlightedElements]);

  const items = React.useMemo(() => {
    if (heapState) {
      return heapState.items.map((it, idx) => ({
        id: it.id,
        index: idx,
        displayVal: String(it.value),
        priority: undefined,
      }));
    }
    if (pqState) {
      return pqState.items.map((it, idx) => ({
        id: it.id,
        index: idx,
        displayVal: it.value,
        priority: it.priority,
      }));
    }
    return [];
  }, [heapState, pqState]);

  // Relations for hovered cell
  const hoveredRelations = React.useMemo(() => {
    if (hoveredIndex === null) return null;
    return {
      parent: hoveredIndex > 0 ? getParentIndex(hoveredIndex) : null,
      left: getLeftChildIndex(hoveredIndex) < items.length ? getLeftChildIndex(hoveredIndex) : null,
      right: getRightChildIndex(hoveredIndex) < items.length ? getRightChildIndex(hoveredIndex) : null,
    };
  }, [hoveredIndex, items.length]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative w-full rounded-xl border border-border/60 bg-gradient-to-b from-card/60 to-card/30 p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Synchronized Array Representation
          </span>
          <span className="text-[11px] text-muted-foreground/80 font-mono">
            (A[i] → Left: 2i+1, Right: 2i+2, Parent: ⌊(i-1)/2⌋)
          </span>
        </div>

        {hoveredRelations && hoveredIndex !== null && (
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono bg-muted/60 px-2.5 py-1 rounded-md border border-border/40">
            <span className="text-primary font-bold">Idx {hoveredIndex}</span>
            {hoveredRelations.parent !== null && (
              <span className="text-muted-foreground">Parent: [{hoveredRelations.parent}]</span>
            )}
            {hoveredRelations.left !== null && (
              <span className="text-muted-foreground">Left: [{hoveredRelations.left}]</span>
            )}
            {hoveredRelations.right !== null && (
              <span className="text-muted-foreground">Right: [{hoveredRelations.right}]</span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {items.map((item) => {
          const isHighlighted = highlightedSet.has(item.id);
          const isHovered = hoveredIndex === item.index;
          const isParentOfHovered = hoveredRelations?.parent === item.index;
          const isLeftOfHovered = hoveredRelations?.left === item.index;
          const isRightOfHovered = hoveredRelations?.right === item.index;

          let ringColor = "";
          if (isParentOfHovered) ringColor = "ring-2 ring-amber-500/80 border-amber-500";
          else if (isLeftOfHovered || isRightOfHovered) ringColor = "ring-2 ring-blue-500/80 border-blue-500";
          else if (isHighlighted) ringColor = "ring-2 ring-primary border-primary";

          return (
            <div
              key={`array-cell-${item.id}`}
              className="flex flex-col items-center flex-shrink-0 group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(item.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSelectIndex?.(item.index)}
            >
              {/* Index label on top */}
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[10px] font-mono font-medium text-muted-foreground">
                  [{item.index}]
                </span>
                {item.index === 0 && (
                  <span className="text-[9px] font-bold text-primary uppercase">R</span>
                )}
              </div>

              {/* Cell Box */}
              <div
                className={cn(
                  "w-14 h-14 rounded-lg border flex flex-col items-center justify-center transition-all duration-200 select-none shadow-sm",
                  isHighlighted
                    ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 scale-105"
                    : "bg-card hover:bg-accent/40 text-foreground border-border",
                  ringColor
                )}
              >
                <span className={cn("text-sm font-semibold truncate px-1", isHighlighted ? "text-primary-foreground" : "")}>
                  {item.displayVal}
                </span>

                {item.priority !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] font-mono px-1 py-0.5 rounded mt-0.5",
                      isHighlighted
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    p:{item.priority}
                  </span>
                )}
              </div>

              {/* Level indicator below */}
              <span className="text-[9px] font-mono text-muted-foreground/60 mt-1">
                L{Math.floor(Math.log2(item.index + 1))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
