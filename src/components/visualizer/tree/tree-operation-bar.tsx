"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  TreeMode,
  TreeOperationType,
  TreeState,
} from "@/core/tree/types";
import {
  BST_OPERATIONS,
  BINARY_TREE_OPERATIONS,
} from "@/core/tree/types";
import { validateNodeValue } from "@/core/tree/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, RotateCcw, Trash2, ArrowRight } from "lucide-react";

export interface TreeOperationBarProps {
  mode: TreeMode;
  onModeChange: (newMode: TreeMode) => void;
  currentOperation: TreeOperationType;
  onOperationChange: (op: TreeOperationType, params: Record<string, unknown>) => void;
  treeState: TreeState<number>;
  onRandomTree: () => void;
  onResetSample: () => void;
  onClear: () => void;
  className?: string;
}

export function TreeOperationBar({
  mode,
  onModeChange,
  currentOperation,
  onOperationChange,
  treeState,
  onRandomTree,
  onResetSample,
  onClear,
  className,
}: TreeOperationBarProps) {
  const operations = mode === "bst" ? BST_OPERATIONS : BINARY_TREE_OPERATIONS;
  const currentDef = operations.find((o) => o.id === currentOperation) || operations[0];

  // Controlled Inputs
  const [valInput, setValInput] = React.useState<string>("45");
  const [targetInput, setTargetInput] = React.useState<string>("60");
  const [parentId, setParentId] = React.useState<string>(treeState.rootId || "");
  const [direction, setDirection] = React.useState<"left" | "right">("left");
  const [nodeId, setNodeId] = React.useState<string>(treeState.rootId || "");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Keep parent/node ID sync when treeState changes
  React.useEffect(() => {
    if (treeState.rootId && !treeState.nodes[parentId]) {
      setParentId(treeState.rootId);
    }
    if (treeState.rootId && !treeState.nodes[nodeId]) {
      setNodeId(treeState.rootId);
    }
  }, [treeState, parentId, nodeId]);

  const handleExecute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const params: Record<string, unknown> = {};

    if (currentDef.requiresValueInput) {
      const check = validateNodeValue(valInput);
      if (!check.isValid) {
        setErrorMsg(check.error || "Invalid value");
        return;
      }
      params.value = check.parsedValue;
    }

    if (currentDef.requiresTargetInput) {
      const check = validateNodeValue(targetInput);
      if (!check.isValid) {
        setErrorMsg(check.error || "Invalid target");
        return;
      }
      params.target = check.parsedValue;
    }

    if (currentDef.requiresParentInput) {
      if (!parentId) {
        setErrorMsg("Please select a parent node.");
        return;
      }
      params.parentId = parentId;
      params.direction = direction;
    }

    if (currentDef.requiresNodeInput) {
      if (!nodeId) {
        setErrorMsg("Please select a node.");
        return;
      }
      params.nodeId = nodeId;
    }

    onOperationChange(currentDef.id, params);
  };

  const handleSelectOperation = (op: TreeOperationType) => {
    setErrorMsg(null);
    const def = operations.find((o) => o.id === op);
    if (!def) return;

    const params: Record<string, unknown> = {};

    if (def.requiresValueInput) {
      const check = validateNodeValue(valInput);
      if (check.isValid) params.value = check.parsedValue;
    }

    if (def.requiresTargetInput) {
      const check = validateNodeValue(targetInput);
      if (check.isValid) params.target = check.parsedValue;
    }

    if (def.requiresParentInput) {
      params.parentId = parentId;
      params.direction = direction;
    }

    if (def.requiresNodeInput) {
      params.nodeId = nodeId;
    }

    onOperationChange(op, params);
  };

  const nodeEntries = Object.values(treeState.nodes);

  return (
    <div className={cn("space-y-3 rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm", className)}>
      {/* 1. Mode Switcher & Global Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/40">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/60 border border-border/40">
          <button
            type="button"
            onClick={() => onModeChange("bst")}
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-md transition-all",
              mode === "bst"
                ? "bg-card text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Binary Search Tree (BST)
          </button>
          <button
            type="button"
            onClick={() => onModeChange("binary-tree")}
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-md transition-all",
              mode === "binary-tree"
                ? "bg-card text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            General Binary Tree
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRandomTree}
            className="h-8 text-xs gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Random Tree
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetSample}
            className="h-8 text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Sample
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 text-xs gap-1.5 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </Button>
        </div>
      </div>

      {/* 2. Operations Tabs Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {operations.map((op) => {
          const isActive = op.id === currentOperation;
          return (
            <button
              key={op.id}
              type="button"
              onClick={() => handleSelectOperation(op.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all border shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted/30 hover:bg-muted/70 text-foreground border-border/40"
              )}
            >
              {op.label}
            </button>
          );
        })}
      </div>

      {/* 3. Input Controls & Execution Trigger */}
      <form onSubmit={handleExecute} className="flex flex-wrap items-center gap-2.5 pt-1">
        {/* Value Input */}
        {currentDef.requiresValueInput && (
          <div className="flex items-center gap-2">
            <label htmlFor="tree-val-input" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Value:
            </label>
            <Input
              id="tree-val-input"
              value={valInput}
              onChange={(e) => setValInput(e.target.value)}
              className="h-8 w-24 text-xs font-mono"
              placeholder="e.g. 45"
            />
          </div>
        )}

        {/* Target Input */}
        {currentDef.requiresTargetInput && (
          <div className="flex items-center gap-2">
            <label htmlFor="tree-target-input" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Target:
            </label>
            <Input
              id="tree-target-input"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="h-8 w-24 text-xs font-mono"
              placeholder="e.g. 60"
            />
          </div>
        )}

        {/* Parent Selector for General Binary Tree */}
        {currentDef.requiresParentInput && (
          <>
            <div className="flex items-center gap-1.5">
              <label htmlFor="tree-parent-input" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Parent:
              </label>
              <select
                id="tree-parent-input"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="h-8 px-2 text-xs rounded-md border border-border bg-background font-mono"
              >
                {nodeEntries.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.value} ({n.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 p-0.5 rounded-md bg-muted/60 border border-border/40">
              <button
                type="button"
                onClick={() => setDirection("left")}
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded transition-all",
                  direction === "left" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
                )}
              >
                Left
              </button>
              <button
                type="button"
                onClick={() => setDirection("right")}
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded transition-all",
                  direction === "right" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
                )}
              >
                Right
              </button>
            </div>
          </>
        )}

        {/* Node Selector for Update */}
        {currentDef.requiresNodeInput && !currentDef.requiresParentInput && (
          <div className="flex items-center gap-1.5">
            <label htmlFor="tree-node-input" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Node:
            </label>
            <select
              id="tree-node-input"
              value={nodeId}
              onChange={(e) => setNodeId(e.target.value)}
              className="h-8 px-2 text-xs rounded-md border border-border bg-background font-mono"
            >
              {nodeEntries.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.value} ({n.id})
                </option>
              ))}
            </select>
          </div>
        )}

        <Button type="submit" size="sm" className="h-8 text-xs font-medium gap-1.5">
          Execute {currentDef.label}
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </form>

      {errorMsg && (
        <div className="text-xs text-destructive font-medium bg-destructive/10 px-3 py-1.5 rounded-md">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
