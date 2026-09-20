"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GraphState, GraphNode, GraphEdge } from "@/core/graph/types";
import { ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface GraphCanvasProps {
  graphState: GraphState;
  highlightedElementIds?: readonly string[];
  selectedNodeId?: string | null;
  selectedEdgeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
  onSelectEdge?: (edgeId: string | null) => void;
  onNodePositionChange?: (nodeId: string, x: number, y: number) => void;
  className?: string;
}

const NODE_RADIUS = 24;

export function GraphCanvas({
  graphState,
  highlightedElementIds = [],
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
  onNodePositionChange,
  className,
}: GraphCanvasProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 });

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = React.useState<string | null>(null);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

  const highlightedSet = React.useMemo(() => {
    const set = new Set<string>();
    for (const id of highlightedElementIds) {
      set.add(id);
      // Also match visual ID format node:node-x or edge:edge-x
      set.add(`node:${id}`);
      set.add(`edge:${id}`);
      if (id.startsWith("node:")) set.add(id.replace("node:", ""));
      if (id.startsWith("edge:")) set.add(id.replace("edge:", ""));
    }
    return set;
  }, [highlightedElementIds]);

  // Fast node lookup
  const nodeMap = React.useMemo(() => {
    const map = new Map<string, GraphNode>();
    for (const node of graphState.nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [graphState.nodes]);

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Node Drag handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    onSelectNode?.(node.id);
    setDraggingNodeId(node.id);

    // Calculate mouse position relative to node center in canvas coordinates
    setDragOffset({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const dx = (e.clientX - dragOffset.x) / zoom;
      const dy = (e.clientY - dragOffset.y) / zoom;
      const currentNode = nodeMap.get(draggingNodeId);

      if (currentNode && onNodePositionChange) {
        onNodePositionChange(
          draggingNodeId,
          Math.round(currentNode.x + dx),
          Math.round(currentNode.y + dy)
        );
      }

      setDragOffset({
        x: e.clientX,
        y: e.clientY,
      });
    } else if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only pan on middle mouse or left click on background
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      onSelectNode?.(null);
      onSelectEdge?.(null);
    }
  };

  // Calculate coordinates for edge line with offset to avoid overlapping node circle
  const getEdgeCoordinates = (source: GraphNode, target: GraphNode) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.hypot(dx, dy) || 1;

    // Unit vector
    const ux = dx / distance;
    const uy = dy / distance;

    // Offset source by radius, and target by radius + arrow padding if directed
    const sourceX = source.x + ux * NODE_RADIUS;
    const sourceY = source.y + uy * NODE_RADIUS;
    const targetOffset = graphState.directed ? NODE_RADIUS + 7 : NODE_RADIUS;
    const targetX = target.x - ux * targetOffset;
    const targetY = target.y - uy * targetOffset;

    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;

    return { sourceX, sourceY, targetX, targetY, midX, midY };
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[460px] md:h-[500px] bg-slate-900/5 dark:bg-surface-950/80 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 select-none",
        isPanning ? "cursor-grabbing" : draggingNodeId ? "cursor-move" : "cursor-default",
        className
      )}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.25] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Floating Canvas Controls (Zoom, Pan, Reset) */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          className="h-7 w-7 p-0"
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          className="h-7 w-7 p-0"
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetView}
          className="h-7 px-1.5 text-[11px] font-medium"
          title="Reset Zoom & Pan"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          {Math.round(zoom * 100)}%
        </Button>
      </div>

      {/* Hint Badge */}
      <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-800">
        <Move className="w-3 h-3 text-brand-500" />
        <span>Drag vertices to reposition • Click to inspect</span>
      </div>

      {/* Main SVG Visualization Canvas */}
      <svg
        className="w-full h-full"
        viewBox="0 0 640 460"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Arrowhead marker for directed edges */}
          <marker
            id="graph-arrow-default"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" className="fill-slate-400 dark:fill-slate-500" />
          </marker>

          <marker
            id="graph-arrow-selected"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" className="fill-brand-500" />
          </marker>

          <marker
            id="graph-arrow-highlighted"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" className="fill-amber-500" />
          </marker>
        </defs>

        {/* Scaled & Panned Group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* 1. Render Edges */}
          <g className="edges-layer">
            {graphState.edges.map((edge) => {
              const source = nodeMap.get(edge.sourceId);
              const target = nodeMap.get(edge.targetId);
              if (!source || !target) return null;

              const isSelected = selectedEdgeId === edge.id;
              const isHighlighted =
                highlightedSet.has(edge.id) ||
                highlightedSet.has(`edge:${edge.id}`) ||
                highlightedSet.has(edge.sourceId) && highlightedSet.has(edge.targetId);

              // 1a. Self-loop edge
              if (edge.sourceId === edge.targetId) {
                const loopRadius = 26;
                const pathD = `M ${source.x - 12} ${source.y - NODE_RADIUS + 4} C ${source.x - 40} ${source.y - NODE_RADIUS - 40}, ${source.x + 40} ${source.y - NODE_RADIUS - 40}, ${source.x + 12} ${source.y - NODE_RADIUS + 4}`;
                const arrowMarker = isSelected
                  ? "url(#graph-arrow-selected)"
                  : isHighlighted
                  ? "url(#graph-arrow-highlighted)"
                  : "url(#graph-arrow-default)";

                return (
                  <g
                    key={edge.id}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEdge?.(edge.id);
                    }}
                  >
                    <path
                      d={pathD}
                      fill="none"
                      className={cn(
                        "transition-colors duration-200 stroke-2",
                        isSelected
                          ? "stroke-brand-500 stroke-[3]"
                          : isHighlighted
                          ? "stroke-amber-500 stroke-[3]"
                          : "stroke-slate-400 dark:stroke-slate-600 group-hover:stroke-slate-500"
                      )}
                      markerEnd={edge.directed ? arrowMarker : undefined}
                    />
                    {graphState.weighted && edge.weight !== undefined && (
                      <g transform={`translate(${source.x}, ${source.y - NODE_RADIUS - 38})`}>
                        <rect
                          x="-14"
                          y="-9"
                          width="28"
                          height="18"
                          rx="9"
                          className="fill-white dark:fill-surface-900 stroke stroke-slate-200 dark:stroke-slate-700 shadow-xs"
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="text-[11px] font-mono font-bold fill-slate-700 dark:fill-slate-200"
                        >
                          {edge.weight}
                        </text>
                      </g>
                    )}
                  </g>
                );
              }

              // 1b. Regular linear edge
              const { sourceX, sourceY, targetX, targetY, midX, midY } =
                getEdgeCoordinates(source, target);

              const arrowMarker = isSelected
                ? "url(#graph-arrow-selected)"
                : isHighlighted
                ? "url(#graph-arrow-highlighted)"
                : "url(#graph-arrow-default)";

              return (
                <g
                  key={edge.id}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEdge?.(edge.id);
                  }}
                >
                  {/* Invisible wider hit area for easy selection */}
                  <line
                    x1={sourceX}
                    y1={sourceY}
                    x2={targetX}
                    y2={targetY}
                    stroke="transparent"
                    strokeWidth="14"
                  />

                  {/* Visible Edge Line */}
                  <line
                    x1={sourceX}
                    y1={sourceY}
                    x2={targetX}
                    y2={targetY}
                    className={cn(
                      "transition-colors duration-200",
                      isSelected
                        ? "stroke-brand-500 stroke-[3]"
                        : isHighlighted
                        ? "stroke-amber-500 stroke-[3]"
                        : "stroke-slate-400 dark:stroke-slate-600 group-hover:stroke-slate-500 stroke-2"
                    )}
                    markerEnd={edge.directed ? arrowMarker : undefined}
                  />

                  {/* Weight label pill badge */}
                  {graphState.weighted && edge.weight !== undefined && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-14"
                        y="-9"
                        width="28"
                        height="18"
                        rx="9"
                        className={cn(
                          "shadow-xs transition-colors",
                          isSelected
                            ? "fill-brand-50 stroke-brand-500 dark:fill-brand-950"
                            : isHighlighted
                            ? "fill-amber-50 stroke-amber-500 dark:fill-amber-950"
                            : "fill-white dark:fill-surface-900 stroke-slate-300 dark:stroke-slate-700"
                        )}
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={cn(
                          "text-[11px] font-mono font-bold select-none",
                          isSelected
                            ? "fill-brand-600 dark:fill-brand-400"
                            : isHighlighted
                            ? "fill-amber-600 dark:fill-amber-400"
                            : "fill-slate-700 dark:fill-slate-200"
                        )}
                      >
                        {edge.weight}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* 2. Render Vertices / Nodes */}
          <g className="nodes-layer">
            {graphState.nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHighlighted =
                highlightedSet.has(node.id) || highlightedSet.has(`node:${node.id}`);
              const isDragging = draggingNodeId === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer select-none"
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNode?.(node.id);
                  }}
                  role="button"
                  aria-label={`Vertex ${node.label}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelectNode?.(node.id);
                    }
                  }}
                >
                  {/* Selection Outer Glow Ring */}
                  {isSelected && (
                    <circle
                      r={NODE_RADIUS + 5}
                      className="fill-none stroke-brand-500/30 stroke-4 animate-pulse"
                    />
                  )}

                  {/* Main Vertex Circle */}
                  <circle
                    r={NODE_RADIUS}
                    className={cn(
                      "transition-all duration-150 drop-shadow-sm",
                      isSelected
                        ? "fill-brand-600 stroke-brand-700 stroke-2 text-white"
                        : isHighlighted
                        ? "fill-amber-500 stroke-amber-600 stroke-2 text-white"
                        : isDragging
                        ? "fill-brand-500 stroke-brand-600 stroke-2 text-white"
                        : "fill-white dark:fill-surface-900 stroke-slate-300 dark:stroke-slate-700 stroke-2 hover:stroke-brand-500 hover:border-brand-500"
                    )}
                  />

                  {/* Centered Node Label */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={cn(
                      "text-sm font-bold font-mono tracking-tight pointer-events-none select-none",
                      isSelected || isHighlighted || isDragging
                        ? "fill-white"
                        : "fill-slate-800 dark:fill-slate-100"
                    )}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}
