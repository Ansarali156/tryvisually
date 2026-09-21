"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  PriorityQueueOperationType,
  PriorityQueueState,
  HeapState,
} from "@/core/heap/types";
import {
  createSamplePriorityQueueState,
} from "@/core/heap/validation";
import { getPriorityQueueSourceCodes } from "@/core/heap/code-snippets";
import { generatePriorityQueueTrace } from "@/core/heap/trace-generators";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import { useExecutionView } from "@/core/synchronization/hooks/use-execution-view";
import type { SupportedLanguage } from "@/core/synchronization/types";
import { VisuAlgoShell, type VisuAlgoAction } from "@/components/visualizer/visualgo-shell";
import { HeapTreeCanvas } from "./heap-tree-canvas";

export interface PriorityQueueVisualizerShellProps {
  initialMode?: "min" | "max";
  initialState?: PriorityQueueState;
  className?: string;
}

export function PriorityQueueVisualizerShell({
  initialMode = "min",
  initialState,
  className,
}: PriorityQueueVisualizerShellProps) {
  // 1. Domain Configuration States
  const [mode, setMode] = React.useState<"min" | "max">(initialMode);
  const [pqState, setPqState] = React.useState<PriorityQueueState>(() => {
    if (initialState) return initialState;
    return createSamplePriorityQueueState(initialMode);
  });
  const [currentOperation, setCurrentOperation] = React.useState<PriorityQueueOperationType>("enqueue");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");

  // Operation parameters
  const [currentParams, setCurrentParams] = React.useState<Record<string, unknown>>({
    task: "Render Frame",
    priority: mode === "min" ? 1 : 9,
  });

  const [taskInput, setTaskInput] = React.useState("Render Frame");
  const [priorityInput, setPriorityInput] = React.useState(mode === "min" ? "1" : "9");

  // 2. Deterministic Trace Generation based on PQ State & Operation
  const trace = React.useMemo(() => {
    return generatePriorityQueueTrace(currentOperation, pqState, {
      task: typeof currentParams.task === "string" ? currentParams.task : "Render Frame",
      priority: typeof currentParams.priority === "number" ? currentParams.priority : 2,
      elementId: typeof currentParams.elementId === "string" ? currentParams.elementId : pqState.items[0]?.id || "",
    });
  }, [pqState, currentOperation, currentParams]);

  // 3. Authoritative Execution Engine
  const engine = useExecutionEngine<PriorityQueueState>(trace, { initialSpeed: 1 });

  // 4. Transform PQ items to HeapState items for tree rendering
  const activeStepState = engine.currentStep?.state || pqState;
  const activeHighlights = engine.currentStep?.highlightedElements || [];

  const treeEquivalentHeapState: HeapState<number> = React.useMemo(() => {
    return {
      heapType: activeStepState.mode === "min" ? "min" : "max",
      items: activeStepState.items.map((it) => ({
        id: it.id,
        value: it.priority,
      })),
    };
  }, [activeStepState]);

  // 5. Multi-language source code snippets
  const sourceCodes = React.useMemo(() => {
    return getPriorityQueueSourceCodes(currentOperation);
  }, [currentOperation]);

  // 6. Synchronized Execution View Context
  const executionView = useExecutionView<PriorityQueueState>({
    runtimeState: engine.controller.getRuntimeState(),
    language: activeLanguage,
    sourceCodes,
  });

  const handleModeChange = (newMode: "min" | "max") => {
    setMode(newMode);
    setPqState(createSamplePriorityQueueState(newMode));
    setCurrentOperation("enqueue");
    const prio = newMode === "min" ? 1 : 9;
    setPriorityInput(prio.toString());
    setCurrentParams({ task: "New Task", priority: prio });
    engine.reset();
  };

  const executeOp = (op: PriorityQueueOperationType, params: Record<string, unknown> = {}) => {
    setCurrentOperation(op);
    setCurrentParams(params);
    engine.reset();
    setTimeout(() => engine.play(), 50);
  };

  const actions: VisuAlgoAction[] = [
    {
      id: "enqueue",
      label: "Enqueue",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Enqueue Element</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-14">Task:</span>
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                className="flex-1 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-14">Priority:</span>
              <input
                type="number"
                value={priorityInput}
                onChange={(e) => setPriorityInput(e.target.value)}
                className="w-20 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
              />
              <button
                onClick={() => {
                  executeOp("enqueue", {
                    task: taskInput || "Task",
                    priority: parseInt(priorityInput, 10) || 1,
                  });
                }}
                className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors ml-auto"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "dequeue",
      label: "Dequeue",
      onClick: () => executeOp("dequeue"),
    },
    {
      id: "peek",
      label: "Peek",
      onClick: () => executeOp("peek"),
    },
    {
      id: "reset",
      label: "Reset Sample",
      onClick: () => {
        setPqState(createSamplePriorityQueueState(mode));
        executeOp("enqueue", { task: "Sample Task", priority: mode === "min" ? 1 : 9 });
      },
    },
  ];

  return (
    <VisuAlgoShell
      title="Priority Queue Visualizer"
      category="Data Structures"
      subVariants={[
        { id: "min", label: "Min-Priority Queue", active: mode === "min" },
        { id: "max", label: "Max-Priority Queue", active: mode === "max" },
      ]}
      activeSubVariant={mode}
      onSelectSubVariant={(id) => handleModeChange(id as "min" | "max")}
      actions={actions}
      statusBadge={
        engine.isPlaying
          ? "Running"
          : currentOperation.toUpperCase()
      }
      statusExplanation={
        executionView.explanation ||
        "Select Enqueue, Dequeue, or Peek from the bottom-left dock."
      }
      complexityBadge={currentOperation === "peek" ? "O(1)" : "O(log n)"}
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
      <div className="w-full h-full flex flex-col items-center justify-between p-6 select-none relative overflow-hidden">
        {/* Tree Stage */}
        <div className="flex-1 w-full flex items-center justify-center min-h-[320px]">
          <HeapTreeCanvas
            heapState={treeEquivalentHeapState}
            highlightedElements={activeHighlights}
            className="w-full h-full"
          />
        </div>

        {/* Priority Queue Queue List View at Bottom */}
        <div className="w-full max-w-4xl py-3 border-t border-border/40 bg-card/40 backdrop-blur-xs rounded-xl px-4 flex flex-col items-center">
          <div className="text-[11px] font-semibold text-muted-foreground mb-2">
            Priority Queue Tasks (by binary heap order)
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {activeStepState.items.map((item, idx) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium shadow-xs transition-all",
                  activeHighlights.includes(item.id)
                    ? "bg-primary text-primary-foreground border-primary scale-105"
                    : "bg-muted/60 border-border text-foreground"
                )}
              >
                <span className="font-bold text-[10px] px-1 py-0.2 rounded bg-background/80 text-foreground">
                  P:{item.priority}
                </span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisuAlgoShell>
  );
}
