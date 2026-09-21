"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { HeapElement, HeapState } from "@/core/heap/types";
import { computeHeapTreeLayout, HEAP_NODE_RADIUS } from "@/core/heap/layout";
import { getLeftChildIndex, getRightChildIndex } from "@/core/heap/validation";

export interface HeapTreeCanvasProps {
  heapState: HeapState<number>;
  highlightedElements?: readonly string[];
  className?: string;
}

export function HeapTreeCanvas({
  heapState,
  highlightedElements = [],
  className,
}: HeapTreeCanvasProps) {
  const layout = React.useMemo(() => {
    return computeHeapTreeLayout(heapState.items);
  }, [heapState.items]);

  const highlightedSet = React.useMemo(() => {
    return new Set(highlightedElements);
  }, [highlightedElements]);

  if (heapState.items.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center min-h-[280px] rounded-xl border border-dashed border-border/70 bg-card/40 p-8 text-center",
          className
        )}
      >
        <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3 text-lg font-mono">
          ∅
        </div>
        <h3 className="font-semibold text-foreground">Heap is empty</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Insert values or build a heap to visualize tree structure, array mapping, and sift operations.
        </p>
      </div>
    );
  }

  const { positions, boundingBox } = layout;

  return (
    <div
      className={cn(
        "relative w-full overflow-auto rounded-xl border border-border/60 bg-gradient-to-b from-card/60 to-card/30 p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Complete Binary Tree View ({heapState.heapType.toUpperCase()} HEAP)
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          Nodes: {heapState.items.length}
        </span>
      </div>

      <svg
        viewBox={boundingBox.viewBox}
        className="w-full h-auto min-h-[300px] max-h-[500px] select-none transition-all duration-300"
        aria-label="Heap complete binary tree graph"
        role="img"
      >
        <defs>
          <filter id="glow-heap-highlight" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#f59e0b" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Connections (Edges) */}
        <g className="edges-layer">
          {heapState.items.map((item, i) => {
            const parentPos = positions[item.id];
            if (!parentPos) return null;

            const leftIdx = getLeftChildIndex(i);
            const rightIdx = getRightChildIndex(i);

            const edges = [];

            if (leftIdx < heapState.items.length) {
              const leftChild = heapState.items[leftIdx];
              const childPos = positions[leftChild.id];
              if (childPos) {
                const isHighlighted =
                  highlightedSet.has(item.id) && highlightedSet.has(leftChild.id);

                edges.push(
                  <g key={`edge-left-${item.id}-${leftChild.id}`}>
                    <line
                      x1={parentPos.x}
                      y1={parentPos.y}
                      x2={childPos.x}
                      y2={childPos.y}
                      stroke={isHighlighted ? "#f59e0b" : "hsl(var(--border))"}
                      strokeWidth={isHighlighted ? 3 : 2}
                      strokeDasharray={isHighlighted ? "4 2" : undefined}
                      className="transition-all duration-300"
                    />
                    {/* Branch badge */}
                    <circle
                      cx={(parentPos.x * 2 + childPos.x) / 3}
                      cy={(parentPos.y * 2 + childPos.y) / 3}
                      r={7}
                      className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-1"
                    />
                    <text
                      x={(parentPos.x * 2 + childPos.x) / 3}
                      y={(parentPos.y * 2 + childPos.y) / 3 + 3}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-slate-500 select-none"
                    >
                      L
                    </text>
                  </g>
                );
              }
            }

            if (rightIdx < heapState.items.length) {
              const rightChild = heapState.items[rightIdx];
              const childPos = positions[rightChild.id];
              if (childPos) {
                const isHighlighted =
                  highlightedSet.has(item.id) && highlightedSet.has(rightChild.id);

                edges.push(
                  <g key={`edge-right-${item.id}-${rightChild.id}`}>
                    <line
                      x1={parentPos.x}
                      y1={parentPos.y}
                      x2={childPos.x}
                      y2={childPos.y}
                      stroke={isHighlighted ? "#f59e0b" : "hsl(var(--border))"}
                      strokeWidth={isHighlighted ? 3 : 2}
                      strokeDasharray={isHighlighted ? "4 2" : undefined}
                      className="transition-all duration-300"
                    />
                    {/* Branch badge */}
                    <circle
                      cx={(parentPos.x * 2 + childPos.x) / 3}
                      cy={(parentPos.y * 2 + childPos.y) / 3}
                      r={7}
                      className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-1"
                    />
                    <text
                      x={(parentPos.x * 2 + childPos.x) / 3}
                      y={(parentPos.y * 2 + childPos.y) / 3 + 3}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-slate-500 select-none"
                    >
                      R
                    </text>
                  </g>
                );
              }
            }

            return <React.Fragment key={`edges-${item.id}`}>{edges}</React.Fragment>;
          })}
        </g>

        {/* Nodes */}
        <g className="nodes-layer">
          {heapState.items.map((item, index) => {
            const pos = positions[item.id];
            if (!pos) return null;

            const isHighlighted = highlightedSet.has(item.id);
            const isRoot = index === 0;

            return (
              <g
                key={`node-${item.id}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="transition-transform duration-300 cursor-default"
              >
                {/* Outer halo when highlighted */}
                {isHighlighted && (
                  <circle
                    r={HEAP_NODE_RADIUS + 5}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    strokeDasharray="4 2"
                    className="animate-spin-slow"
                  />
                )}

                {/* Node Circle */}
                <circle
                  r={HEAP_NODE_RADIUS}
                  className={cn(
                    "transition-colors duration-300",
                    isHighlighted
                      ? "fill-amber-500 stroke-amber-600"
                      : isRoot
                      ? "fill-white dark:fill-slate-900 stroke-amber-500 stroke-2"
                      : "fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-2 hover:stroke-slate-400"
                  )}
                  filter={isHighlighted ? "url(#glow-heap-highlight)" : undefined}
                />

                {/* Node Value */}
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  className={cn(
                    "text-sm font-semibold select-none transition-colors",
                    isHighlighted ? "fill-slate-950 font-bold" : "fill-slate-900 dark:fill-slate-100 font-mono"
                  )}
                >
                  {item.value}
                </text>

                {/* Array Index Badge below node */}
                <g transform={`translate(0, ${HEAP_NODE_RADIUS + 13})`}>
                  <rect
                    x={-16}
                    y={-8}
                    width={32}
                    height={16}
                    rx={4}
                    className="fill-muted/80 stroke-border/60 stroke-[0.5]"
                  />
                  <text
                    textAnchor="middle"
                    dy="0.3em"
                    className="text-[10px] font-mono font-medium fill-muted-foreground select-none"
                  >
                    [{index}]
                  </text>
                </g>

                {/* Root Pill Tag */}
                {isRoot && (
                  <g transform={`translate(0, ${-HEAP_NODE_RADIUS - 10})`}>
                    <rect
                      x={-18}
                      y={-7}
                      width={36}
                      height={14}
                      rx={7}
                      className="fill-primary/20 stroke-primary/50 stroke-1"
                    />
                    <text
                      textAnchor="middle"
                      dy="0.3em"
                      className="text-[8px] font-mono font-bold fill-primary select-none uppercase tracking-wide"
                    >
                      ROOT
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
