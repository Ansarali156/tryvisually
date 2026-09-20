"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GraphState } from "@/core/graph/types";
import { deriveAdjacencyList, deriveAdjacencyMatrix } from "@/core/graph/representations";
import { Eye, ListOrdered, Grid3X3 } from "lucide-react";

export type RepresentationMode = "visualization" | "adjacency-list" | "adjacency-matrix";

export interface GraphRepresentationViewProps {
  graphState: GraphState;
  mode: RepresentationMode;
  onModeChange: (mode: RepresentationMode) => void;
  children: React.ReactNode;
  className?: string;
}

export function GraphRepresentationView({
  graphState,
  mode,
  onModeChange,
  children,
  className,
}: GraphRepresentationViewProps) {
  const adjList = React.useMemo(() => deriveAdjacencyList(graphState), [graphState]);
  const { labels, matrix } = React.useMemo(() => deriveAdjacencyMatrix(graphState), [graphState]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Representation Mode Switcher Tabs */}
      <div className="flex items-center justify-between bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onModeChange("visualization")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all",
              mode === "visualization"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visualization</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange("adjacency-list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all",
              mode === "adjacency-list"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Adjacency List</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange("adjacency-matrix")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all",
              mode === "adjacency-matrix"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Adjacency Matrix</span>
          </button>
        </div>

        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline pr-2">
          {mode === "visualization"
            ? "Interactive canvas"
            : mode === "adjacency-list"
            ? "O(V + E) space"
            : "O(V²) space"}
        </span>
      </div>

      {/* Main Mode View */}
      {mode === "visualization" && children}

      {mode === "adjacency-list" && (
        <div className="w-full min-h-[460px] bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 overflow-auto flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Derived Adjacency List Representation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Each vertex stores a list of its outgoing adjacent neighbors. Ideal for sparse graphs.
            </p>
          </div>

          {Object.keys(adjList).length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400 italic">
              Graph has no vertices. Add vertices to see the adjacency list.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(adjList).map(([vertexLabel, neighbors]) => (
                <div
                  key={vertexLabel}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-surface-50 dark:bg-surface-950/40"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                    {vertexLabel}
                  </div>
                  <span className="text-slate-400 font-mono font-bold text-sm">→</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {neighbors.length === 0 ? (
                      <span className="text-xs text-slate-400 italic font-mono">null / []</span>
                    ) : (
                      neighbors.map((n, idx) => (
                        <span
                          key={`${n.label}-${idx}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-white dark:bg-surface-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs"
                        >
                          <span>{n.label}</span>
                          {n.weight !== undefined && (
                            <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold">
                              ({n.weight})
                            </span>
                          )}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "adjacency-matrix" && (
        <div className="w-full min-h-[460px] bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 overflow-auto flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Derived Adjacency Matrix Representation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {labels.length} × {labels.length} 2D matrix. Entry [u][v] represents edge connection or weight.
            </p>
          </div>

          {labels.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400 italic">
              Graph has no vertices. Add vertices to see the adjacency matrix.
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <table className="border-collapse text-xs font-mono">
                <thead>
                  <tr>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 bg-surface-100 dark:bg-surface-800 text-slate-500 font-bold">
                      V
                    </th>
                    {labels.map((colLabel) => (
                      <th
                        key={`head-${colLabel}`}
                        className="p-2 min-w-[38px] text-center border border-slate-200 dark:border-slate-800 bg-surface-50 dark:bg-surface-800/60 font-bold text-slate-800 dark:text-slate-200"
                      >
                        {colLabel}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {labels.map((rowLabel, rIdx) => (
                    <tr key={`row-${rowLabel}`}>
                      <th className="p-2 text-center border border-slate-200 dark:border-slate-800 bg-surface-50 dark:bg-surface-800/60 font-bold text-slate-800 dark:text-slate-200">
                        {rowLabel}
                      </th>
                      {matrix[rIdx].map((cellValue, cIdx) => (
                        <td
                          key={`cell-${rIdx}-${cIdx}`}
                          className={cn(
                            "p-2 text-center border border-slate-200 dark:border-slate-800 font-semibold transition-colors",
                            cellValue > 0
                              ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold"
                              : "text-slate-400 dark:text-slate-600"
                          )}
                        >
                          {cellValue}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
