"use client";

import * as React from "react";
import type { VisualizationState, VisualizationHighlight } from "@/core/visualization/types";
import { HIGHLIGHT_PRIORITIES } from "@/core/visualization/utils/highlight-priority";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Eye, Code, Layers, GitCommit, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VisualizationInspectorProps {
  visualizationState: VisualizationState<unknown> | null;
  resolvedHighlights?: ReadonlyMap<string, VisualizationHighlight>;
  className?: string;
  defaultExpanded?: boolean;
}

export function VisualizationInspector({
  visualizationState,
  resolvedHighlights,
  className,
  defaultExpanded = false,
}: VisualizationInspectorProps) {
  const [isOpen, setIsOpen] = React.useState(defaultExpanded);
  const [activeTab, setActiveTab] = React.useState<"elements" | "connections" | "highlights" | "annotations" | "json">("elements");

  if (!visualizationState) {
    return null;
  }

  const { elements, connections, highlights, annotations } = visualizationState;

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-surface-900 overflow-hidden text-xs",
        className
      )}
    >
      {/* Header bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-surface-50 dark:bg-surface-950 hover:bg-surface-100 dark:hover:bg-surface-900/80 transition-colors select-none border-b border-slate-100 dark:border-slate-800"
      >
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Eye className="h-3.5 w-3.5" />
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Visualization State Engine Inspector
          </span>
          <Badge variant="brand" size="sm">
            v1.0 Semantic
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">
            {elements.length} elems · {connections.length} conns · {highlights.length} hls
          </span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-3">
          {/* Sub-tabs */}
          <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("elements")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors",
                activeTab === "elements"
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-surface-100 dark:text-slate-400 dark:hover:bg-surface-800"
              )}
            >
              <Layers className="h-3 w-3" />
              Elements ({elements.length})
            </button>
            <button
              onClick={() => setActiveTab("connections")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors",
                activeTab === "connections"
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-surface-100 dark:text-slate-400 dark:hover:bg-surface-800"
              )}
            >
              <GitCommit className="h-3 w-3" />
              Connections ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab("highlights")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors",
                activeTab === "highlights"
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-surface-100 dark:text-slate-400 dark:hover:bg-surface-800"
              )}
            >
              <Sparkles className="h-3 w-3" />
              Highlights ({highlights.length})
            </button>
            <button
              onClick={() => setActiveTab("annotations")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors",
                activeTab === "annotations"
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-surface-100 dark:text-slate-400 dark:hover:bg-surface-800"
              )}
            >
              <MessageSquare className="h-3 w-3" />
              Annotations ({annotations.length})
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors ml-auto",
                activeTab === "json"
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-surface-100 dark:text-slate-400 dark:hover:bg-surface-800"
              )}
            >
              <Code className="h-3 w-3" />
              Raw JSON
            </button>
          </div>

          {/* Elements Panel */}
          {activeTab === "elements" && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {elements.map((el) => {
                  const resolvedHl = resolvedHighlights?.get(el.id);
                  return (
                    <div
                      key={el.id}
                      className={cn(
                        "p-2.5 rounded-xl border bg-surface-50/50 dark:bg-surface-950/50 font-mono transition-all",
                        resolvedHl
                          ? "border-brand-500 bg-brand-50/30 dark:bg-brand-950/30 shadow-sm"
                          : "border-slate-100 dark:border-slate-800"
                      )}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {el.id}
                        </span>
                        <Badge variant="neutral" size="sm">
                          {el.type}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 flex justify-between">
                        <span>val: {String(el.value)}</span>
                        {el.state && <span className="text-brand-600 font-semibold">{el.state}</span>}
                      </div>
                      {resolvedHl && (
                        <div className="mt-1.5 pt-1.5 border-t border-brand-200/50 dark:border-brand-800/50 text-[10px] text-brand-700 dark:text-brand-300 flex items-center justify-between">
                          <span>hl: {resolvedHl.type}</span>
                          <span className="text-[9px] opacity-75">
                            p:{resolvedHl.priority ?? HIGHLIGHT_PRIORITIES[resolvedHl.type] ?? 0}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Connections Panel */}
          {activeTab === "connections" && (
            <div className="space-y-2">
              {connections.length === 0 ? (
                <div className="text-slate-400 italic py-2">No active connections defined in this state.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 font-mono text-[11px]">
                  {connections.map((c) => (
                    <div
                      key={c.id}
                      className="p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-surface-50 dark:bg-surface-950 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{c.sourceId}</span>
                        <span className="text-brand-500 font-bold">{c.directed ? "→" : "—"}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{c.targetId}</span>
                      </div>
                      <Badge variant="brand" size="sm">
                        {c.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Highlights Panel */}
          {activeTab === "highlights" && (
            <div className="space-y-2">
              {highlights.length === 0 ? (
                <div className="text-slate-400 italic py-2">No active highlights in this step.</div>
              ) : (
                <div className="space-y-1.5">
                  {highlights.map((hl, idx) => (
                    <div
                      key={`${hl.elementId}-${hl.type}-${idx}`}
                      className="p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-surface-50 dark:bg-surface-950 flex items-center justify-between font-mono text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {hl.elementId}
                        </span>
                        <span className="text-slate-400">→</span>
                        <Badge variant="brand" size="sm">
                          {hl.type}
                        </Badge>
                      </div>
                      <span className="text-slate-500 text-[11px]">
                        Priority: {hl.priority ?? HIGHLIGHT_PRIORITIES[hl.type] ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Annotations Panel */}
          {activeTab === "annotations" && (
            <div className="space-y-2">
              {annotations.length === 0 ? (
                <div className="text-slate-400 italic py-2">No active annotations in this step.</div>
              ) : (
                <div className="space-y-2">
                  {annotations.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-surface-50 dark:bg-surface-950 flex items-start gap-2"
                    >
                      <Badge variant="neutral" size="sm">
                        {ann.type || "annotation"}
                      </Badge>
                      <div className="flex-1 text-slate-700 dark:text-slate-300">
                        {ann.text}
                        {ann.targetId && (
                          <span className="ml-2 font-mono text-[10px] text-brand-600 dark:text-brand-400">
                            [target: {ann.targetId}]
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Raw JSON Panel */}
          {activeTab === "json" && (
            <div className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-64">
              <pre>{JSON.stringify(visualizationState, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
