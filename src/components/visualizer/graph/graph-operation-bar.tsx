"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GraphState, GraphOperationType } from "@/core/graph/types";
import { getNextDefaultNodeLabel } from "@/core/graph/validation";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Layers,
} from "lucide-react";

export interface GraphOperationBarProps {
  graphState: GraphState;
  onAddNode: (label: string) => void;
  onAddEdge: (sourceLabel: string, targetLabel: string, weight?: number) => void;
  onDeleteNode: (label: string) => void;
  onDeleteEdge: (sourceLabel: string, targetLabel: string) => void;
  onClearGraph: () => void;
  onLoadPreset: (presetType: "undirected-weighted" | "directed-dag" | "random") => void;
  errorMessage?: string | null;
  className?: string;
}

export function GraphOperationBar({
  graphState,
  onAddNode,
  onAddEdge,
  onDeleteNode,
  onDeleteEdge,
  onClearGraph,
  onLoadPreset,
  errorMessage,
  className,
}: GraphOperationBarProps) {
  const [activeTab, setActiveTab] = React.useState<"add-node" | "add-edge" | "delete" | "presets">("add-node");

  // Add Node State
  const defaultLabel = React.useMemo(() => {
    return getNextDefaultNodeLabel(graphState.nodes);
  }, [graphState.nodes]);
  const [nodeLabel, setNodeLabel] = React.useState(defaultLabel);

  React.useEffect(() => {
    setNodeLabel(defaultLabel);
  }, [defaultLabel]);

  // Add Edge State
  const [edgeSource, setEdgeSource] = React.useState<string>("");
  const [edgeTarget, setEdgeTarget] = React.useState<string>("");
  const [edgeWeight, setEdgeWeight] = React.useState<number>(5);

  // Sync edge source and target defaults when nodes change
  React.useEffect(() => {
    if (graphState.nodes.length >= 2) {
      if (!edgeSource || !graphState.nodes.some((n) => n.label === edgeSource)) {
        setEdgeSource(graphState.nodes[0].label);
      }
      if (!edgeTarget || !graphState.nodes.some((n) => n.label === edgeTarget)) {
        setEdgeTarget(graphState.nodes[1].label);
      }
    } else if (graphState.nodes.length === 1) {
      setEdgeSource(graphState.nodes[0].label);
      setEdgeTarget(graphState.nodes[0].label);
    }
  }, [graphState.nodes, edgeSource, edgeTarget]);

  // Delete State
  const [deleteNodeLabel, setDeleteNodeLabel] = React.useState<string>("");
  React.useEffect(() => {
    if (graphState.selectedNodeId) {
      const selected = graphState.nodes.find((n) => n.id === graphState.selectedNodeId);
      if (selected) setDeleteNodeLabel(selected.label);
    } else if (graphState.nodes.length > 0) {
      setDeleteNodeLabel(graphState.nodes[0].label);
    }
  }, [graphState.selectedNodeId, graphState.nodes]);

  const handleAddNodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeLabel.trim()) return;
    onAddNode(nodeLabel.trim());
  };

  const handleAddEdgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edgeSource || !edgeTarget) return;
    onAddEdge(edgeSource, edgeTarget, graphState.weighted ? edgeWeight : undefined);
  };

  const handleDeleteNodeSubmit = () => {
    if (!deleteNodeLabel) return;
    onDeleteNode(deleteNodeLabel);
  };

  return (
    <div className={cn("flex flex-col gap-2.5 bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs", className)}>
      {/* Top Action Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={activeTab === "add-node" ? "primary" : "ghost"}
            onClick={() => setActiveTab("add-node")}
            className="h-7 text-xs px-2.5 gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Vertex
          </Button>

          <Button
            size="sm"
            variant={activeTab === "add-edge" ? "primary" : "ghost"}
            onClick={() => setActiveTab("add-edge")}
            className="h-7 text-xs px-2.5 gap-1.5"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Add Edge
          </Button>

          <Button
            size="sm"
            variant={activeTab === "delete" ? "primary" : "ghost"}
            onClick={() => setActiveTab("delete")}
            className="h-7 text-xs px-2.5 gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>

          <Button
            size="sm"
            variant={activeTab === "presets" ? "primary" : "ghost"}
            onClick={() => setActiveTab("presets")}
            className="h-7 text-xs px-2.5 gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Presets
          </Button>
        </div>

        {/* Clear graph button */}
        <Button
          size="sm"
          variant="outline"
          onClick={onClearGraph}
          disabled={graphState.nodes.length === 0}
          className="h-7 text-xs px-2 text-slate-500 hover:text-red-600 hover:border-red-300 dark:hover:text-red-400 gap-1"
          title="Clear all vertices and edges"
        >
          <RefreshCw className="w-3 h-3" />
          Clear
        </Button>
      </div>

      {/* Error notification if any */}
      {errorMessage && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Form Controls */}
      <div className="pt-0.5">
        {activeTab === "add-node" && (
          <form onSubmit={handleAddNodeSubmit} className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Vertex Label:
            </label>
            <input
              type="text"
              value={nodeLabel}
              onChange={(e) => setNodeLabel(e.target.value.toUpperCase())}
              maxLength={4}
              placeholder="e.g. A"
              className="w-20 px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-950 text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <Button
              type="submit"
              size="sm"
              variant="primary"
              className="h-7 text-xs px-3"
            >
              Add Vertex
            </Button>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">
              (Unique label, e.g. A, B, 1, 2)
            </span>
          </form>
        )}

        {activeTab === "add-edge" && (
          <form onSubmit={handleAddEdgeSubmit} className="flex items-center gap-2 flex-wrap">
            {graphState.nodes.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Add at least one vertex before connecting edges.
              </p>
            ) : (
              <>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Source:
                </label>
                <select
                  value={edgeSource}
                  onChange={(e) => setEdgeSource(e.target.value)}
                  className="px-2 py-1 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  {graphState.nodes.map((n) => (
                    <option key={n.id} value={n.label}>
                      {n.label}
                    </option>
                  ))}
                </select>

                <span className="text-xs font-bold text-slate-400">
                  {graphState.directed ? "→" : "—"}
                </span>

                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Target:
                </label>
                <select
                  value={edgeTarget}
                  onChange={(e) => setEdgeTarget(e.target.value)}
                  className="px-2 py-1 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  {graphState.nodes.map((n) => (
                    <option key={n.id} value={n.label}>
                      {n.label}
                    </option>
                  ))}
                </select>

                {graphState.weighted && (
                  <div className="flex items-center gap-1.5 ml-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Weight:
                    </label>
                    <input
                      type="number"
                      value={edgeWeight}
                      onChange={(e) => setEdgeWeight(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  className="h-7 text-xs px-3 ml-1"
                >
                  Connect Edge
                </Button>
              </>
            )}
          </form>
        )}

        {activeTab === "delete" && (
          <div className="flex items-center gap-3 flex-wrap">
            {graphState.nodes.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Graph is currently empty.</p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Delete Vertex:
                  </label>
                  <select
                    value={deleteNodeLabel}
                    onChange={(e) => setDeleteNodeLabel(e.target.value)}
                    className="px-2 py-1 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    {graphState.nodes.map((n) => (
                      <option key={n.id} value={n.label}>
                        Vertex {n.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDeleteNodeSubmit}
                    className="h-7 text-xs px-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900"
                  >
                    Delete Vertex & Edges
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "presets" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Load Preset:
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onLoadPreset("undirected-weighted")}
              className="h-7 text-xs px-2.5 font-medium"
            >
              Undirected Weighted (A-B-C-D)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onLoadPreset("directed-dag")}
              className="h-7 text-xs px-2.5 font-medium"
            >
              Directed DAG (A→B, A→C, B→D, C→D)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onLoadPreset("random")}
              className="h-7 text-xs px-2.5 font-medium text-brand-600 dark:text-brand-400"
            >
              Random Graph
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
