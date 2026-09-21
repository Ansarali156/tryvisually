"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  TreeMode,
  TreeOperationType,
  TreeState,
} from "@/core/tree/types";
import {
  createSampleBSTState,
  createSampleBinaryTreeState,
  createEmptyTreeState,
  buildBSTFromValues,
} from "@/core/tree/validation";
import { defaultTreeAdapter } from "@/core/tree/tree-adapter";
import { getTreeSourceCodes } from "@/core/tree/code-snippets";
import { generateTreeTrace } from "@/core/tree/trace-generators";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import { useVisualizationState } from "@/core/visualization/hooks/use-visualization-state";
import { useExecutionView } from "@/core/synchronization/hooks/use-execution-view";
import type { SupportedLanguage } from "@/core/synchronization/types";
import { VisuAlgoShell, type VisuAlgoAction } from "@/components/visualizer/visualgo-shell";
import { TreeCanvas } from "./tree-canvas";
import { TreeTraversalOutput } from "./tree-traversal-output";

export interface TreeVisualizerShellProps {
  initialMode?: TreeMode;
  initialTreeState?: TreeState<number>;
  className?: string;
}

export function TreeVisualizerShell({
  initialMode = "bst",
  initialTreeState,
  className,
}: TreeVisualizerShellProps) {
  // 1. Domain Configuration States
  const [mode, setMode] = React.useState<TreeMode>(initialMode);
  const [treeState, setTreeState] = React.useState<TreeState<number>>(() => {
    if (initialTreeState) return initialTreeState;
    return initialMode === "bst" ? createSampleBSTState() : createSampleBinaryTreeState();
  });
  const [currentOperation, setCurrentOperation] = React.useState<TreeOperationType>("search");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");

  // Operation parameters for deterministic trace generation
  const [currentParams, setCurrentParams] = React.useState<Record<string, unknown>>({
    target: 60,
    value: 45,
  });

  // Inputs
  const [searchTarget, setSearchTarget] = React.useState("60");
  const [insertValue, setInsertValue] = React.useState("45");
  const [deleteValue, setDeleteValue] = React.useState("20");

  // 2. Deterministic Trace Generation based on TreeState & Operation
  const trace = React.useMemo(() => {
    return generateTreeTrace(treeState, currentOperation, currentParams, mode);
  }, [treeState, currentOperation, currentParams, mode]);

  // 3. Authoritative Execution Engine
  const engine = useExecutionEngine<TreeState<number>>(trace, { initialSpeed: 1 });

  // 4. Visualization State Engine derivation
  const { visualizationState, resolvedHighlights } = useVisualizationState<TreeState<number>>({
    adapter: defaultTreeAdapter,
    runtimeState: engine.controller.getRuntimeState(),
  });

  // 5. Multi-language source code snippets
  const sourceCodes = React.useMemo(() => {
    return getTreeSourceCodes(currentOperation);
  }, [currentOperation]);

  // 6. Synchronized Execution View Context
  const executionView = useExecutionView<TreeState<number>>({
    runtimeState: engine.controller.getRuntimeState(),
    language: activeLanguage,
    sourceCodes,
    visualizationState,
  });

  const handleModeChange = (newMode: TreeMode) => {
    setMode(newMode);
    if (newMode === "bst") {
      setTreeState(createSampleBSTState());
      setCurrentOperation("search");
      setCurrentParams({ target: 60 });
    } else {
      setTreeState(createSampleBinaryTreeState());
      setCurrentOperation("search");
      setCurrentParams({ target: 15 });
    }
    engine.reset();
  };

  const executeOp = (op: TreeOperationType, params: Record<string, unknown> = {}) => {
    setCurrentOperation(op);
    setCurrentParams(params);
    engine.reset();
    setTimeout(() => engine.play(), 50);
  };

  const activeStepState = engine.currentStep?.state || treeState;
  const activeHighlights = engine.currentStep?.highlightedElements || [];

  const actions: VisuAlgoAction[] = [
    {
      id: "search",
      label: "Search",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Search Value (v)</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={searchTarget}
              onChange={(e) => setSearchTarget(e.target.value)}
              className="w-20 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
            <button
              onClick={() => {
                executeOp("search", { target: parseInt(searchTarget, 10) || 60 });
              }}
              className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Go
            </button>
          </div>
          <div className="pt-2 border-t border-border/50">
            <div className="text-[11px] text-muted-foreground mb-1">Presets:</div>
            <div className="flex flex-wrap gap-1">
              {[20, 40, 60, 80].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setSearchTarget(val.toString());
                    executeOp("search", { target: val });
                  }}
                  className="px-2 py-0.5 text-[11px] rounded bg-muted hover:bg-primary/20 hover:text-primary transition-colors font-mono"
                >
                  v={val}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "insert",
      label: "Insert",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Insert Value (v)</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={insertValue}
              onChange={(e) => setInsertValue(e.target.value)}
              className="w-20 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
            <button
              onClick={() => {
                executeOp("insert", { value: parseInt(insertValue, 10) || 45 });
              }}
              className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Go
            </button>
          </div>
        </div>
      ),
    },
    ...(mode === "bst"
      ? [
          {
            id: "delete",
            label: "Delete",
            popoverContent: (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-foreground">Delete Value (v)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={deleteValue}
                    onChange={(e) => setDeleteValue(e.target.value)}
                    className="w-20 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
                  />
                  <button
                    onClick={() => {
                      executeOp("delete", { target: parseInt(deleteValue, 10) || 20 });
                    }}
                    className="px-3 py-1 text-xs font-bold bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
                  >
                    Go
                  </button>
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      id: "traversals",
      label: "Traverse",
      popoverContent: (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-foreground">Traversal Order</div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => executeOp("inorder")}
              className="px-2.5 py-1 text-xs font-medium rounded bg-muted hover:bg-primary/20 hover:text-primary transition-colors text-left"
            >
              Inorder
            </button>
            <button
              onClick={() => executeOp("preorder")}
              className="px-2.5 py-1 text-xs font-medium rounded bg-muted hover:bg-primary/20 hover:text-primary transition-colors text-left"
            >
              Preorder
            </button>
            <button
              onClick={() => executeOp("postorder")}
              className="px-2.5 py-1 text-xs font-medium rounded bg-muted hover:bg-primary/20 hover:text-primary transition-colors text-left"
            >
              Postorder
            </button>
            <button
              onClick={() => executeOp("level-order")}
              className="px-2.5 py-1 text-xs font-medium rounded bg-muted hover:bg-primary/20 hover:text-primary transition-colors text-left"
            >
              Level Order
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "random",
      label: "Randomize",
      onClick: () => {
        if (mode === "bst") {
          const pool = [15, 25, 35, 45, 55, 65, 75, 85, 95];
          const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
          const newBST = buildBSTFromValues(shuffled);
          setTreeState(newBST);
          executeOp("search", { target: shuffled[0] });
        } else {
          setTreeState(createSampleBinaryTreeState());
          executeOp("search", { target: 15 });
        }
      },
    },
    {
      id: "reset",
      label: "Reset Sample",
      onClick: () => {
        if (mode === "bst") {
          setTreeState(createSampleBSTState());
          executeOp("search", { target: 60 });
        } else {
          setTreeState(createSampleBinaryTreeState());
          executeOp("search", { target: 15 });
        }
      },
    },
  ];

  return (
    <VisuAlgoShell
      title={mode === "bst" ? "Binary Search Tree" : "Binary Tree Visualizer"}
      category="Data Structures"
      subVariants={[
        { id: "bst", label: "Binary Search Tree (BST)", active: mode === "bst" },
        { id: "binary-tree", label: "General Binary Tree", active: mode === "binary-tree" },
      ]}
      activeSubVariant={mode}
      onSelectSubVariant={(id) => handleModeChange(id as TreeMode)}
      actions={actions}
      statusBadge={
        engine.isPlaying
          ? "Running"
          : currentOperation.toUpperCase()
      }
      statusExplanation={
        executionView.explanation ||
        "Select Search, Insert, or Traverse from the bottom-left dock."
      }
      complexityBadge={
        mode === "bst"
          ? currentOperation === "search" || currentOperation === "insert" || currentOperation === "delete"
            ? "Avg: O(log n) / Worst: O(n)"
            : "O(n)"
          : "O(n)"
      }
      code={executionView.sourceCode}
      activeCodeLines={executionView.activeCodeLines}
      currentStep={engine.currentStepIndex}
      totalSteps={engine.totalSteps}
      isPlaying={engine.isPlaying}
      speed={engine.speed}
      onPlay={engine.play}
      onPause={engine.pause}
      onStepForward={engine.next}
      onStepBackward={engine.previous}
      onGoToStart={engine.jumpToStart}
      onGoToEnd={engine.jumpToEnd}
      onSeek={engine.jumpTo}
      onSpeedChange={(spd) => engine.setSpeed(spd)}
      className={className}
    >
      {/* Full-stage Interactive Stage */}
      <div className="w-full h-full flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
        <TreeCanvas
          treeState={activeStepState}
          highlightedElements={activeHighlights}
          className="w-full h-full min-h-[400px]"
        />

        {/* Traversal Output Bar floating at top center */}
        {activeStepState.traversalOutput && activeStepState.traversalOutput.length > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <TreeTraversalOutput
              treeState={activeStepState}
              currentOperation={currentOperation}
            />
          </div>
        )}
      </div>
    </VisuAlgoShell>
  );
}

export function BinaryTreeVisualizerShell(props: Omit<TreeVisualizerShellProps, "initialMode">) {
  return <TreeVisualizerShell {...props} initialMode="binary-tree" />;
}

export function BstVisualizerShell(props: Omit<TreeVisualizerShellProps, "initialMode">) {
  return <TreeVisualizerShell {...props} initialMode="bst" />;
}
