"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { QueueOperationType, QueueState, QueueVariant } from "@/core/queue/types";
import {
  DEFAULT_QUEUE_VALUES,
  DEFAULT_QUEUE_CAPACITY,
  createQueueState,
} from "@/core/queue/validation";
import { defaultQueueAdapter } from "@/core/queue/queue-adapter";
import { getQueueOperationSourceCodes } from "@/core/queue/code-snippets";
import { generateQueueTrace } from "@/core/queue/trace-generators";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import { useVisualizationState } from "@/core/visualization/hooks/use-visualization-state";
import { useExecutionView } from "@/core/synchronization/hooks/use-execution-view";
import type { SupportedLanguage } from "@/core/synchronization/types";
import { VisuAlgoShell, type VisuAlgoAction } from "@/components/visualizer/visualgo-shell";
import { QueueRenderer } from "./queue-renderer";

export interface QueueVisualizerShellProps {
  initialValues?: readonly number[];
  initialVariant?: QueueVariant;
  initialCapacity?: number;
  className?: string;
}

export function QueueVisualizerShell({
  initialValues = DEFAULT_QUEUE_VALUES,
  initialVariant = "linear",
  initialCapacity = DEFAULT_QUEUE_CAPACITY,
  className,
}: QueueVisualizerShellProps) {
  // 1. Queue State, Variant & Operation Selection
  const [queueValues, setQueueValues] = React.useState<readonly number[]>(initialValues);
  const [variant, setVariant] = React.useState<QueueVariant>(initialVariant);
  const [capacity, setCapacity] = React.useState<number>(initialCapacity);
  const [currentOperation, setCurrentOperation] = React.useState<QueueOperationType>("enqueue");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");
  const [currentParams, setCurrentParams] = React.useState<Record<string, number>>({});

  // Input states
  const [enqueueVal, setEnqueueVal] = React.useState("55");
  const [customInput, setCustomInput] = React.useState("");

  // 2. Base Queue State with stable IDs
  const queueState: QueueState = React.useMemo(() => {
    return createQueueState(queueValues, variant, capacity);
  }, [queueValues, variant, capacity]);

  // 3. Deterministic Trace Generation based on Operation & Parameters
  const trace = React.useMemo(() => {
    return generateQueueTrace(queueState, currentOperation, currentParams);
  }, [queueState, currentOperation, currentParams]);

  // 4. Authoritative Execution Engine
  const engine = useExecutionEngine<QueueState>(trace, { initialSpeed: 1 });

  // 5. Visualization State Engine derivation
  const { visualizationState, resolvedHighlights } = useVisualizationState<QueueState>({
    adapter: defaultQueueAdapter,
    runtimeState: engine.controller.getRuntimeState(),
  });

  // 6. Source code snippets for synchronization
  const sourceCodes = React.useMemo(() => {
    return getQueueOperationSourceCodes(currentOperation, variant);
  }, [currentOperation, variant]);

  // 7. Synchronized Execution View Context
  const executionView = useExecutionView<QueueState>({
    runtimeState: engine.controller.getRuntimeState(),
    language: activeLanguage,
    sourceCodes,
    visualizationState,
  });

  const handleChangeVariant = (newVariant: QueueVariant) => {
    setVariant(newVariant);
    if (newVariant === "linear" && currentOperation === "isFull") {
      setCurrentOperation("enqueue");
    }
    setCurrentParams({});
    engine.reset();
  };

  const executeOp = (op: QueueOperationType, params: Record<string, number> = {}) => {
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
          <div className="text-xs font-semibold text-foreground">Enqueue Value (v)</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={enqueueVal}
              onChange={(e) => setEnqueueVal(e.target.value)}
              className="w-20 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
            <button
              onClick={() => {
                executeOp("enqueue", { value: parseInt(enqueueVal, 10) || 55 });
              }}
              className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Go
            </button>
          </div>
          <div className="pt-2 border-t border-border/50">
            <div className="text-[11px] text-muted-foreground mb-1">Presets:</div>
            <div className="flex flex-wrap gap-1">
              {[15, 30, 55, 99].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setEnqueueVal(val.toString());
                    executeOp("enqueue", { value: val });
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
      id: "dequeue",
      label: "Dequeue",
      onClick: () => executeOp("dequeue"),
    },
    {
      id: "peek",
      label: "Peek Front",
      onClick: () => executeOp("front"),
    },
    {
      id: "isEmpty",
      label: "isEmpty",
      onClick: () => executeOp("isEmpty"),
    },
    ...(variant === "circular"
      ? [
          {
            id: "isFull",
            label: "isFull",
            onClick: () => executeOp("isFull"),
          },
        ]
      : []),
    {
      id: "create",
      label: "Create",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Queue Values (Front to Back)</div>
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
                setQueueValues(randomVals);
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
                  setQueueValues(parsed.slice(0, 10));
                  setCustomInput("");
                  executeOp("front");
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
      title="Queue Visualizer"
      category="Data Structures"
      subVariants={[
        { id: "linear", label: "Linear Queue", active: variant === "linear" },
        { id: "circular", label: "Circular Queue", active: variant === "circular" },
      ]}
      activeSubVariant={variant}
      onSelectSubVariant={(id) => handleChangeVariant(id as QueueVariant)}
      manualInput={{
        label: "Queue",
        placeholder: "Enter queue sequence front-to-back (values: 10, 20, 30...)",
        defaultValue: queueValues.join(", "),
        onSubmit: (val) => {
          const matches = val.match(/-?\d+/g);
          const parsed = matches ? matches.map((m) => parseInt(m, 10)).filter((n) => !isNaN(n)) : [];
          if (parsed.length > 0) {
            setQueueValues(parsed.slice(0, 10));
            executeOp("front");
          }
        },
        presets: [
          { label: "Default", value: "10, 20, 30" },
          { label: "Random 4", value: Array.from({ length: 4 }, () => Math.floor(Math.random() * 90) + 10).join(", ") },
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
        "Select Enqueue, Dequeue, or Peek from the bottom-left dock."
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
      <div className="w-full h-full flex flex-col items-center justify-center p-6 select-none overflow-x-auto">
        <QueueRenderer
          visualizationState={visualizationState}
          resolvedHighlights={resolvedHighlights}
          speed={engine.speed}
        />
      </div>
    </VisuAlgoShell>
  );
}
