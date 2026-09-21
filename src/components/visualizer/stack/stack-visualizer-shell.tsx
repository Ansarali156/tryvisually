"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { StackOperationType, StackState } from "@/core/stack/types";
import { DEFAULT_STACK_VALUES, createStackState } from "@/core/stack/validation";
import { defaultStackAdapter } from "@/core/stack/stack-adapter";
import { getStackOperationSourceCodes } from "@/core/stack/code-snippets";
import { generateStackTrace } from "@/core/stack/trace-generators";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import { useVisualizationState } from "@/core/visualization/hooks/use-visualization-state";
import { useExecutionView } from "@/core/synchronization/hooks/use-execution-view";
import type { SupportedLanguage } from "@/core/synchronization/types";
import { VisuAlgoShell, type VisuAlgoAction } from "@/components/visualizer/visualgo-shell";
import { StackRenderer } from "./stack-renderer";

export interface StackVisualizerShellProps {
  initialValues?: readonly number[];
  className?: string;
}

export function StackVisualizerShell({
  initialValues = DEFAULT_STACK_VALUES,
  className,
}: StackVisualizerShellProps) {
  // 1. Stack State & Operation Selection
  const [stackValues, setStackValues] = React.useState<readonly number[]>(initialValues);
  const [currentOperation, setCurrentOperation] = React.useState<StackOperationType>("push");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");
  const [currentParams, setCurrentParams] = React.useState<Record<string, number>>({});

  // Input states
  const [pushVal, setPushVal] = React.useState("42");
  const [customInput, setCustomInput] = React.useState("");

  // 2. Base Stack State with stable IDs
  const stackState: StackState = React.useMemo(() => {
    return createStackState(stackValues);
  }, [stackValues]);

  // 3. Deterministic Trace Generation based on Operation & Parameters
  const trace = React.useMemo(() => {
    return generateStackTrace(stackState, currentOperation, currentParams);
  }, [stackState, currentOperation, currentParams]);

  // 4. Authoritative Execution Engine
  const engine = useExecutionEngine<StackState>(trace, { initialSpeed: 1 });

  // 5. Visualization State Engine derivation
  const { visualizationState, resolvedHighlights } = useVisualizationState<StackState>({
    adapter: defaultStackAdapter,
    runtimeState: engine.controller.getRuntimeState(),
  });

  // 6. Source code snippets for synchronization
  const sourceCodes = React.useMemo(() => {
    return getStackOperationSourceCodes(currentOperation);
  }, [currentOperation]);

  // 7. Synchronized Execution View Context
  const executionView = useExecutionView<StackState>({
    runtimeState: engine.controller.getRuntimeState(),
    language: activeLanguage,
    sourceCodes,
    visualizationState,
  });

  const executeOp = (op: StackOperationType, params: Record<string, number> = {}) => {
    setCurrentOperation(op);
    setCurrentParams(params);
    engine.reset();
    setTimeout(() => engine.play(), 50);
  };

  const actions: VisuAlgoAction[] = [
    {
      id: "push",
      label: "Push",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Push Value (v)</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={pushVal}
              onChange={(e) => setPushVal(e.target.value)}
              className="w-20 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
            <button
              onClick={() => {
                executeOp("push", { value: parseInt(pushVal, 10) || 42 });
              }}
              className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Go
            </button>
          </div>
          <div className="pt-2 border-t border-border/50">
            <div className="text-[11px] text-muted-foreground mb-1">Presets:</div>
            <div className="flex flex-wrap gap-1">
              {[25, 42, 67, 88].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setPushVal(val.toString());
                    executeOp("push", { value: val });
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
      id: "pop",
      label: "Pop",
      onClick: () => executeOp("pop"),
    },
    {
      id: "peek",
      label: "Peek",
      onClick: () => executeOp("peek"),
    },
    {
      id: "isEmpty",
      label: "isEmpty",
      onClick: () => executeOp("isEmpty"),
    },
    {
      id: "create",
      label: "Create",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Stack Values (Bottom to Top)</div>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="e.g. 10, 20, 30"
            className="w-full px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
          />
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => {
                const len = Math.floor(Math.random() * 4) + 3;
                const randomVals = Array.from({ length: len }, () => Math.floor(Math.random() * 90) + 10);
                setStackValues(randomVals);
                engine.reset();
              }}
              className="px-2.5 py-1 text-xs font-medium rounded bg-muted hover:bg-primary/20 text-foreground transition-colors"
            >
              Random
            </button>
            <button
              onClick={() => {
                const parsed = customInput
                  .split(",")
                  .map((s) => parseInt(s.trim(), 10))
                  .filter((n) => !isNaN(n));
                if (parsed.length > 0) {
                  setStackValues(parsed);
                  setCustomInput("");
                  engine.reset();
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
      title="Stack Visualizer"
      category="Data Structures"
      actions={actions}
      statusBadge={
        engine.isPlaying
          ? "Running"
          : currentOperation.toUpperCase()
      }
      statusExplanation={
        executionView.explanation ||
        "Select Push, Pop, or Peek from the bottom-left dock to manipulate the stack."
      }
      complexityBadge="O(1)"
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
      <div className="w-full h-full flex flex-col items-center justify-center p-6 select-none overflow-y-auto">
        <StackRenderer
          visualizationState={visualizationState}
          resolvedHighlights={resolvedHighlights}
          speed={engine.speed}
        />
      </div>
    </VisuAlgoShell>
  );
}
