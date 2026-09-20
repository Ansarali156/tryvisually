"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TreeState, TreeNode } from "@/core/tree/types";
import { computeTreeLayout, NODE_RADIUS } from "@/core/tree/layout";

export interface TreeCanvasProps {
  treeState: TreeState<number>;
  highlightedElements?: readonly string[];
  currentOperation?: string;
  className?: string;
}

export function TreeCanvas({
  treeState,
  highlightedElements = [],
  currentOperation,
  className,
}: TreeCanvasProps) {
  const layout = React.useMemo(() => {
    return computeTreeLayout(treeState);
  }, [treeState]);

  const highlightedSet = React.useMemo(() => {
    return new Set(highlightedElements);
  }, [highlightedElements]);

  if (!treeState.rootId || Object.keys(treeState.nodes).length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center min-h-[320px] rounded-xl border border-dashed border-border/70 bg-card/40 p-8 text-center",
          className
        )}
      >
        <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3 text-lg font-mono">
          ∅
        </div>
        <h3 className="font-semibold text-foreground">Tree is empty</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Insert a new value or load a sample tree to visualize nodes, edges, and operations.
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
      <svg
        viewBox={boundingBox.viewBox}
        className="w-full h-auto min-h-[360px] max-h-[560px] select-none transition-all duration-300"
        aria-label="Tree visual execution graph"
        role="img"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 6 3, 0 6" className="fill-muted-foreground/60" />
          </marker>
          <filter id="glow-primary" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="hsl(var(--primary))" floodOpacity="0.6" />
          </filter>
          <filter id="glow-success" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* 1. Render Connections (Edges) */}
        <g className="edges-layer">
          {Object.values(treeState.nodes).map((node: TreeNode<number>) => {
            const parentPos = positions[node.id];
            if (!parentPos) return null;

            const edges: React.ReactNode[] = [];

            // Left Child Edge
            if (node.leftId && positions[node.leftId]) {
              const childPos = positions[node.leftId];
              const isHighlighted =
                highlightedSet.has(node.id) && highlightedSet.has(node.leftId);

              // Calculate connection points at node circumference
              const angle = Math.atan2(childPos.y - parentPos.y, childPos.x - parentPos.x);
              const startX = parentPos.x + NODE_RADIUS * Math.cos(angle);
              const startY = parentPos.y + NODE_RADIUS * Math.sin(angle);
              const endX = childPos.x - NODE_RADIUS * Math.cos(angle);
              const endY = childPos.y - NODE_RADIUS * Math.sin(angle);

              edges.push(
                <g key={`edge-${node.id}-${node.leftId}`}>
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    className={cn(
                      "transition-all duration-300 stroke-2",
                      isHighlighted
                        ? "stroke-primary stroke-[3]"
                        : "stroke-border hover:stroke-muted-foreground/80"
                    )}
                    markerEnd="url(#arrowhead)"
                  />
                  {/* Branch label */}
                  <text
                    x={(startX + endX) / 2 - 10}
                    y={(startY + endY) / 2}
                    className="text-[10px] fill-muted-foreground font-mono font-medium"
                  >
                    L
                  </text>
                </g>
              );
            }

            // Right Child Edge
            if (node.rightId && positions[node.rightId]) {
              const childPos = positions[node.rightId];
              const isHighlighted =
                highlightedSet.has(node.id) && highlightedSet.has(node.rightId);

              const angle = Math.atan2(childPos.y - parentPos.y, childPos.x - parentPos.x);
              const startX = parentPos.x + NODE_RADIUS * Math.cos(angle);
              const startY = parentPos.y + NODE_RADIUS * Math.sin(angle);
              const endX = childPos.x - NODE_RADIUS * Math.cos(angle);
              const endY = childPos.y - NODE_RADIUS * Math.sin(angle);

              edges.push(
                <g key={`edge-${node.id}-${node.rightId}`}>
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    className={cn(
                      "transition-all duration-300 stroke-2",
                      isHighlighted
                        ? "stroke-primary stroke-[3]"
                        : "stroke-border hover:stroke-muted-foreground/80"
                    )}
                    markerEnd="url(#arrowhead)"
                  />
                  {/* Branch label */}
                  <text
                    x={(startX + endX) / 2 + 10}
                    y={(startY + endY) / 2}
                    className="text-[10px] fill-muted-foreground font-mono font-medium"
                  >
                    R
                  </text>
                </g>
              );
            }

            return edges;
          })}
        </g>

        {/* 2. Render Nodes */}
        <g className="nodes-layer">
          {Object.values(treeState.nodes).map((node: TreeNode<number>) => {
            const pos = positions[node.id];
            if (!pos) return null;

            const isHighlighted = highlightedSet.has(node.id);
            const isRoot = node.id === treeState.rootId;
            const isLeaf = !node.leftId && !node.rightId;

            return (
              <g
                key={node.id}
                className="transition-transform duration-300 cursor-pointer"
                role="button"
                aria-label={`Node ${node.value}${isRoot ? ", Root" : ""}${isLeaf ? ", Leaf" : ""}`}
              >
                {/* Highlight Glow Ring */}
                {isHighlighted && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={NODE_RADIUS + 6}
                    className="fill-none stroke-primary/50 stroke-2 animate-pulse"
                    filter="url(#glow-primary)"
                  />
                )}

                {/* Node Circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_RADIUS}
                  className={cn(
                    "transition-colors duration-200 stroke-2",
                    isHighlighted
                      ? "fill-primary text-primary-foreground stroke-primary"
                      : isRoot
                      ? "fill-primary/10 stroke-primary/80"
                      : "fill-card stroke-border hover:stroke-primary/50"
                  )}
                />

                {/* Node Numeric Value */}
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  className={cn(
                    "text-sm font-semibold font-mono pointer-events-none",
                    isHighlighted ? "fill-primary-foreground font-bold" : "fill-foreground"
                  )}
                >
                  {node.value}
                </text>

                {/* Role Badge (ROOT / LEAF) */}
                {isRoot && (
                  <g transform={`translate(${pos.x - 16}, ${pos.y - NODE_RADIUS - 16})`}>
                    <rect
                      width="32"
                      height="14"
                      rx="3"
                      className="fill-primary/20 stroke-primary/40 stroke-[1]"
                    />
                    <text
                      x="16"
                      y="10"
                      textAnchor="middle"
                      className="text-[9px] font-bold font-mono fill-primary"
                    >
                      ROOT
                    </text>
                  </g>
                )}

                {isLeaf && !isRoot && (
                  <g transform={`translate(${pos.x - 14}, ${pos.y + NODE_RADIUS + 4})`}>
                    <rect
                      width="28"
                      height="13"
                      rx="3"
                      className="fill-muted stroke-border/60 stroke-[1]"
                    />
                    <text
                      x="14"
                      y="9.5"
                      textAnchor="middle"
                      className="text-[8px] font-semibold font-mono fill-muted-foreground"
                    >
                      LEAF
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
