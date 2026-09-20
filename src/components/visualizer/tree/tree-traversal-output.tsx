"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TreeState, CallStackFrame } from "@/core/tree/types";
import { Layers, ListOrdered, ArrowRight } from "lucide-react";

export interface TreeTraversalOutputProps {
  treeState: TreeState<number>;
  currentOperation?: string;
  className?: string;
}

export function TreeTraversalOutput({
  treeState,
  currentOperation,
  className,
}: TreeTraversalOutputProps) {
  const { traversalOutput, callStack, queue } = treeState;

  const isTraversal =
    currentOperation === "inorder" ||
    currentOperation === "preorder" ||
    currentOperation === "postorder" ||
    currentOperation === "level-order";

  if (!isTraversal && (!traversalOutput || traversalOutput.length === 0)) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/60 p-4 space-y-4 shadow-sm",
        className
      )}
    >
      {/* 1. Progressive Output Banner */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ListOrdered className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Traversal Output ({currentOperation?.toUpperCase() || "PROGRESS"})
          </span>
        </div>

        {traversalOutput && traversalOutput.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-lg bg-muted/40 border border-border/40 font-mono text-sm">
            {traversalOutput.map((val, idx) => (
              <React.Fragment key={`out-${val}-${idx}`}>
                <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-bold animate-in fade-in zoom-in-95 duration-200">
                  {val}
                </span>
                {idx < traversalOutput.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-xs font-mono text-muted-foreground italic p-2 bg-muted/20 rounded border border-border/30">
            Waiting to visit first node...
          </div>
        )}
      </div>

      {/* 2. Conceptual Call Stack (for recursive Preorder/Inorder/Postorder) */}
      {callStack && callStack.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Call Stack ({callStack.length} active {callStack.length === 1 ? "frame" : "frames"})
            </span>
          </div>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            {callStack.map((frame: CallStackFrame, idx: number) => (
              <div
                key={`frame-${frame.id}-${idx}`}
                className="flex items-center justify-between px-3 py-1.5 rounded bg-muted/30 border border-border/40 text-xs font-mono"
              >
                <span className="text-foreground font-medium">{frame.functionName}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-semibold uppercase">
                  {frame.phase}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Level-Order Queue State */}
      {queue && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Auxiliary FIFO Queue ({queue.length} elements)
            </span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/30 border border-border/40 font-mono text-xs overflow-x-auto">
            <span className="text-muted-foreground text-[11px] mr-1">Front →</span>
            {queue.length > 0 ? (
              queue.map((nodeId, idx) => {
                const node = treeState.nodes[nodeId];
                return (
                  <span
                    key={`q-${nodeId}-${idx}`}
                    className="px-2 py-0.5 rounded bg-card border border-border font-bold text-foreground"
                  >
                    {node ? node.value : nodeId}
                  </span>
                );
              })
            ) : (
              <span className="text-muted-foreground italic text-xs">[empty]</span>
            )}
            <span className="text-muted-foreground text-[11px] ml-1">← Rear</span>
          </div>
        </div>
      )}
    </div>
  );
}
