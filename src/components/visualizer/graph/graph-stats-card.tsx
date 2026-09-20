"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GraphState, NodeDegreeInfo } from "@/core/graph/types";
import { calculateNodeDegrees } from "@/core/graph/validation";
import { Info, Network, Hash, Compass, ArrowRight } from "lucide-react";

export interface GraphStatsCardProps {
  graphState: GraphState;
  className?: string;
}

export function GraphStatsCard({ graphState, className }: GraphStatsCardProps) {
  const selectedNode = React.useMemo(() => {
    if (!graphState.selectedNodeId) return null;
    return graphState.nodes.find((n) => n.id === graphState.selectedNodeId) ?? null;
  }, [graphState.selectedNodeId, graphState.nodes]);

  const selectedEdge = React.useMemo(() => {
    if (!graphState.selectedEdgeId) return null;
    return graphState.edges.find((e) => e.id === graphState.selectedEdgeId) ?? null;
  }, [graphState.selectedEdgeId, graphState.edges]);

  const nodeDegreeInfo: NodeDegreeInfo | null = React.useMemo(() => {
    if (!selectedNode) return null;
    return calculateNodeDegrees(graphState, selectedNode.id);
  }, [selectedNode, graphState]);

  const nodeMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const n of graphState.nodes) map.set(n.id, n.label);
    return map;
  }, [graphState.nodes]);

  return (
    <div className={cn("flex flex-col gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-900 shadow-xs", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
          <Network className="w-4 h-4 text-brand-500" />
          <span>Graph Metrics & Inspection</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
            {graphState.directed ? "Directed" : "Undirected"}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            {graphState.weighted ? "Weighted" : "Unweighted"}
          </span>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col p-2.5 rounded-lg bg-surface-50 dark:bg-surface-950/40 border border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] text-slate-500 font-medium">Total Vertices (|V|)</span>
          <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
            {graphState.nodes.length}
          </span>
        </div>
        <div className="flex flex-col p-2.5 rounded-lg bg-surface-50 dark:bg-surface-950/40 border border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] text-slate-500 font-medium">Total Edges (|E|)</span>
          <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
            {graphState.edges.length}
          </span>
        </div>
      </div>

      {/* Selected Element Context Inspector */}
      <div className="mt-1 pt-2.5 border-t border-slate-100 dark:border-slate-800">
        {selectedNode && nodeDegreeInfo ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Selected Vertex:
              </span>
              <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-brand-600 text-white shadow-xs">
                Vertex {selectedNode.label}
              </span>
            </div>

            {graphState.directed ? (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-md bg-surface-50 dark:bg-surface-950/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-sans">In-Degree:</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {nodeDegreeInfo.inDegree}
                  </span>
                </div>
                <div className="p-2 rounded-md bg-surface-50 dark:bg-surface-950/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-sans">Out-Degree:</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {nodeDegreeInfo.outDegree}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-md bg-surface-50 dark:bg-surface-950/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 font-sans">Degree:</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {nodeDegreeInfo.degree}
                </span>
              </div>
            )}
          </div>
        ) : selectedEdge ? (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Selected Edge:
            </span>
            <div className="flex items-center justify-between p-2 rounded-md bg-surface-50 dark:bg-surface-950/50 border border-slate-100 dark:border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-1.5 font-bold">
                <span>{nodeMap.get(selectedEdge.sourceId)}</span>
                <span>{selectedEdge.directed ? "→" : "—"}</span>
                <span>{nodeMap.get(selectedEdge.targetId)}</span>
              </div>
              {graphState.weighted && (
                <span className="text-brand-600 dark:text-brand-400 font-bold">
                  Weight: {selectedEdge.weight ?? "N/A"}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic py-1">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Click any vertex or edge on the canvas to inspect details.</span>
          </div>
        )}
      </div>
    </div>
  );
}
