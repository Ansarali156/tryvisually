"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  LinkedListOperationType,
  LinkedListState,
  LinkedListVariant,
} from "@/core/linked-list/types";
import { DEFAULT_LINKED_LIST_VALUES, createLinkedListState } from "@/core/linked-list/validation";
import { defaultLinkedListAdapter } from "@/core/linked-list/linked-list-adapter";
import { getLinkedListOperationSourceCodes } from "@/core/linked-list/code-snippets";
import { generateLinkedListTrace } from "@/core/linked-list/trace-generators";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import { useVisualizationState } from "@/core/visualization/hooks/use-visualization-state";
import { useExecutionView } from "@/core/synchronization/hooks/use-execution-view";
import type { SupportedLanguage } from "@/core/synchronization/types";
import { VisuAlgoShell, type VisuAlgoAction } from "@/components/visualizer/visualgo-shell";
import { LinkedListRenderer } from "./linked-list-renderer";

export interface LinkedListVisualizerShellProps {
  initialValues?: readonly number[];
  initialVariant?: LinkedListVariant;
  className?: string;
}

export function LinkedListVisualizerShell({
  initialValues = DEFAULT_LINKED_LIST_VALUES,
  initialVariant = "singly",
  className,
}: LinkedListVisualizerShellProps) {
  // 1. Variant, List State & Operation Selection
  const [variant, setVariant] = React.useState<LinkedListVariant>(initialVariant);
  const [listValues, setListValues] = React.useState<readonly number[]>(initialValues);
  const [currentOperation, setCurrentOperation] = React.useState<LinkedListOperationType>("traverse");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");

  // Track operation parameters for re-generating on state change
  const [currentParams, setCurrentParams] = React.useState<Record<string, number>>({});

  // Input states for popovers
  const [insertVal, setInsertVal] = React.useState("50");
  const [insertIdx, setInsertIdx] = React.useState("1");
  const [deleteIdx, setDeleteIdx] = React.useState("1");
  const [searchVal, setSearchVal] = React.useState("20");
  const [customInput, setCustomInput] = React.useState("");

  // 2. Base Linked List State with stable IDs
  const linkedListState: LinkedListState = React.useMemo(() => {
    return createLinkedListState(listValues, variant);
  }, [listValues, variant]);

  // 3. Deterministic Trace Generation based on Operation & Parameters
  const trace = React.useMemo(() => {
    return generateLinkedListTrace(linkedListState, currentOperation, currentParams);
  }, [linkedListState, currentOperation, currentParams]);

  // 4. Authoritative Execution Engine
  const engine = useExecutionEngine<LinkedListState>(trace, { initialSpeed: 1 });

  // 5. Visualization State Engine derivation
  const { visualizationState, resolvedHighlights } = useVisualizationState<LinkedListState>({
    adapter: defaultLinkedListAdapter,
    runtimeState: engine.controller.getRuntimeState(),
  });

  // 6. Source code snippets for synchronization
  const sourceCodes = React.useMemo(() => {
    return getLinkedListOperationSourceCodes(currentOperation);
  }, [currentOperation]);

  // 7. Synchronized Execution View Context
  const executionView = useExecutionView<LinkedListState>({
    runtimeState: engine.controller.getRuntimeState(),
    language: activeLanguage,
    sourceCodes,
    visualizationState,
  });

  const handleSelectVariant = (newVariant: LinkedListVariant) => {
    setVariant(newVariant);
    if (newVariant === "circular" && currentOperation === "reverse") {
      setCurrentOperation("traverse");
    }
    engine.reset();
  };

  const executeOp = (op: LinkedListOperationType, params: Record<string, number> = {}) => {
    setCurrentOperation(op);
    setCurrentParams(params);
    engine.reset();
    setTimeout(() => engine.play(), 50);
  };

  // VisuAlgo Actions
  const actions: VisuAlgoAction[] = [
    {
      id: "insert",
      label: "Insert",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Insert Node</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Value:</span>
            <input
              type="number"
              value={insertVal}
              onChange={(e) => setInsertVal(e.target.value)}
              className="w-16 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => executeOp("insert-beginning", { value: parseInt(insertVal, 10) || 50 })}
              className="px-2 py-1 text-xs font-medium rounded bg-muted hover:bg-primary/20 hover:text-primary transition-colors text-left"
            >
              At Head
            </button>
            <button
              onClick={() => executeOp("insert-end", { value: parseInt(insertVal, 10) || 50 })}
              className="px-2 py-1 text-xs font-medium rounded bg-muted hover:bg-primary/20 hover:text-primary transition-colors text-left"
            >
              At Tail
            </button>
          </div>
          <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
            <span className="text-xs text-muted-foreground">Index:</span>
            <input
              type="number"
              value={insertIdx}
              onChange={(e) => setInsertIdx(e.target.value)}
              className="w-12 px-1.5 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
            <button
              onClick={() =>
                executeOp("insert-position", {
                  index: parseInt(insertIdx, 10) || 0,
                  value: parseInt(insertVal, 10) || 50,
                })
              }
              className="px-2.5 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors ml-auto"
            >
              Insert At
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "delete",
      label: "Delete",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Delete Node</div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => executeOp("delete-beginning")}
              className="px-2 py-1 text-xs font-medium rounded bg-muted hover:bg-rose-500/20 hover:text-rose-600 transition-colors text-left"
            >
              Head
            </button>
            <button
              onClick={() => executeOp("delete-end")}
              className="px-2 py-1 text-xs font-medium rounded bg-muted hover:bg-rose-500/20 hover:text-rose-600 transition-colors text-left"
            >
              Tail
            </button>
          </div>
          <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
            <span className="text-xs text-muted-foreground">Index:</span>
            <input
              type="number"
              value={deleteIdx}
              onChange={(e) => setDeleteIdx(e.target.value)}
              className="w-12 px-1.5 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
            <button
              onClick={() => executeOp("delete-position", { index: parseInt(deleteIdx, 10) || 0 })}
              className="px-2.5 py-1 text-xs font-bold bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors ml-auto"
            >
              Delete At
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "search",
      label: "Search",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Search Value (v)</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="e.g. 20"
              className="w-20 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
            <button
              onClick={() => executeOp("search", { value: parseInt(searchVal, 10) || 20 })}
              className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Go
            </button>
          </div>
          <div className="pt-2 border-t border-border/50">
            <div className="text-[11px] text-muted-foreground mb-1">Preset Items:</div>
            <div className="flex flex-wrap gap-1">
              {listValues.slice(0, 4).map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setSearchVal(val.toString());
                    executeOp("search", { value: val });
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
      id: "traverse",
      label: "Traverse",
      onClick: () => executeOp("traverse"),
    },
    ...(variant !== "circular"
      ? [
          {
            id: "reverse",
            label: "Reverse",
            onClick: () => executeOp("reverse"),
          },
        ]
      : []),
    {
      id: "create",
      label: "Create",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">List Values</div>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="e.g. 10, 20, 30, 40"
            className="w-full px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
          />
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => {
                const len = Math.floor(Math.random() * 4) + 4;
                const randomVals = Array.from({ length: len }, () => Math.floor(Math.random() * 90) + 10);
                setListValues(randomVals);
                engine.reset();
              }}
              className="px-2.5 py-1 text-xs font-medium rounded bg-muted hover:bg-primary/20 text-foreground transition-colors"
            >
              Random
            </button>
            <button
              onClick={() => {
                const matches = customInput.match(/-?\d+/g);
                const parsed = matches ? matches.map((m) => parseInt(m, 10)).filter((n) => !isNaN(n)) : [];
                if (parsed.length > 0) {
                  setListValues(parsed.slice(0, 15));
                  setCustomInput("");
                  executeOp("traverse");
                }
              }}
              className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Go
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <VisuAlgoShell
      title="Linked List Visualizer"
      category="Data Structures"
      subVariants={[
        { id: "singly", label: "Singly Linked List", active: variant === "singly" },
        { id: "doubly", label: "Doubly Linked List", active: variant === "doubly" },
        { id: "circular", label: "Circular Linked List", active: variant === "circular" },
      ]}
      activeSubVariant={variant}
      onSelectSubVariant={(id) => handleSelectVariant(id as LinkedListVariant)}
      manualInput={{
        label: "Nodes",
        placeholder: "Enter nodes list (values: 10, 20, 30...)",
        defaultValue: listValues.join(", "),
        onSubmit: (val) => {
          const matches = val.match(/-?\d+/g);
          const parsed = matches ? matches.map((m) => parseInt(m, 10)).filter((n) => !isNaN(n)) : [];
          if (parsed.length > 0) {
            setListValues(parsed.slice(0, 15));
            executeOp("traverse");
          }
        },
        presets: [
          { label: "Default", value: "10, 20, 30, 40" },
          { label: "Random 5", value: Array.from({ length: 5 }, () => Math.floor(Math.random() * 90) + 10).join(", ") },
          { label: "Ascending", value: "5, 15, 25, 35, 45" },
        ],
      }}
      actions={actions}
      statusBadge={
        engine.isPlaying
          ? "Running"
          : currentOperation.toUpperCase()
      }
      statusExplanation={
        executionView.explanation ||
        "Select an operation from the bottom-left dock to manipulate the list."
      }
      complexityBadge={
        currentOperation === "insert-beginning" || currentOperation === "delete-beginning"
          ? "O(1)"
          : currentOperation === "search" || currentOperation === "traverse" || currentOperation === "reverse"
          ? "O(n)"
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
      <div className="w-full h-full flex flex-col items-center justify-center p-6 select-none overflow-x-auto">
        <LinkedListRenderer
          visualizationState={visualizationState}
          resolvedHighlights={resolvedHighlights}
          speed={engine.speed}
        />
      </div>
    </VisuAlgoShell>
  );
}
