"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  HeapType,
  HeapOperationType,
  HeapState,
} from "@/core/heap/types";
import {
  createSampleHeapState,
  createEmptyHeapState,
} from "@/core/heap/validation";
import { HeapAdapter } from "@/core/heap/heap-adapter";
import { getHeapSourceCodes } from "@/core/heap/code-snippets";
import { generateHeapTrace } from "@/core/heap/trace-generators";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import { useVisualizationState } from "@/core/visualization/hooks/use-visualization-state";
import { useExecutionView } from "@/core/synchronization/hooks/use-execution-view";
import type { SupportedLanguage } from "@/core/synchronization/types";
import { VisuAlgoShell, type VisuAlgoAction } from "@/components/visualizer/visualgo-shell";
import { HeapTreeCanvas } from "./heap-tree-canvas";
import { HeapArrayView } from "./heap-array-view";

const defaultHeapAdapter = new HeapAdapter();

export interface HeapVisualizerShellProps {
  initialHeapType?: HeapType;
  initialHeapState?: HeapState<number>;
  className?: string;
}

export function HeapVisualizerShell({
  initialHeapType = "min",
  initialHeapState,
  className,
}: HeapVisualizerShellProps) {
  // 1. Domain Configuration States
  const [heapType, setHeapType] = React.useState<HeapType>(initialHeapType);
  const [heapState, setHeapState] = React.useState<HeapState<number>>(() => {
    if (initialHeapState) return initialHeapState;
    return createSampleHeapState(initialHeapType);
  });
  const [currentOperation, setCurrentOperation] = React.useState<HeapOperationType>("insert");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");

  // Operation parameters for deterministic trace generation
  const [currentParams, setCurrentParams] = React.useState<Record<string, unknown>>({
    value: initialHeapType === "min" ? 5 : 99,
  });

  const [insertVal, setInsertVal] = React.useState(initialHeapType === "min" ? "5" : "99");
  const [buildVal, setBuildVal] = React.useState("45, 12, 89, 34, 23, 7");

  // 2. Deterministic Trace Generation based on HeapState & Operation
  const trace = React.useMemo(() => {
    return generateHeapTrace(currentOperation, heapState, {
      value: typeof currentParams.value === "number" ? currentParams.value : 5,
      index: typeof currentParams.index === "number" ? currentParams.index : 0,
      values: Array.isArray(currentParams.values) ? (currentParams.values as number[]) : [45, 12, 89, 34, 23, 7],
    });
  }, [heapState, currentOperation, currentParams]);

  // 3. Authoritative Execution Engine
  const engine = useExecutionEngine<HeapState<number>>(trace, { initialSpeed: 1 });

  // 4. Visualization State Engine derivation
  const { visualizationState, resolvedHighlights } = useVisualizationState<HeapState<number>>({
    adapter: defaultHeapAdapter,
    runtimeState: engine.controller.getRuntimeState(),
  });

  // 5. Multi-language source code snippets
  const sourceCodes = React.useMemo(() => {
    return getHeapSourceCodes(currentOperation);
  }, [currentOperation]);

  // 6. Synchronized Execution View Context
  const executionView = useExecutionView<HeapState<number>>({
    runtimeState: engine.controller.getRuntimeState(),
    language: activeLanguage,
    sourceCodes,
    visualizationState,
  });

  const handleHeapTypeChange = (newType: HeapType) => {
    setHeapType(newType);
    setHeapState(createSampleHeapState(newType));
    setCurrentOperation("insert");
    const val = newType === "min" ? 5 : 99;
    setInsertVal(val.toString());
    setCurrentParams({ value: val });
    engine.reset();
  };

  const executeOp = (op: HeapOperationType, params: Record<string, unknown> = {}) => {
    setCurrentOperation(op);
    setCurrentParams(params);
    engine.reset();
    setTimeout(() => engine.play(), 50);
  };

  const activeStepState = engine.currentStep?.state || heapState;
  const activeHighlights = engine.currentStep?.highlightedElements || [];

  const actions: VisuAlgoAction[] = [
    {
      id: "insert",
      label: "Insert",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Insert Value (v)</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={insertVal}
              onChange={(e) => setInsertVal(e.target.value)}
              className="w-20 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
            <button
              onClick={() => {
                executeOp("insert", { value: parseInt(insertVal, 10) || 5 });
              }}
              className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Go
            </button>
          </div>
          <div className="pt-2 border-t border-border/50">
            <div className="text-[11px] text-muted-foreground mb-1">Presets:</div>
            <div className="flex flex-wrap gap-1">
              {[3, 8, 25, 77, 99].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setInsertVal(val.toString());
                    executeOp("insert", { value: val });
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
      id: "extract",
      label: heapType === "min" ? "Extract-Min" : "Extract-Max",
      onClick: () => executeOp("extract-root"),
    },
    {
      id: "peek",
      label: "Peek Root",
      onClick: () => executeOp("peek"),
    },
    {
      id: "build",
      label: "Build Heap",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Input Values</div>
          <input
            type="text"
            value={buildVal}
            onChange={(e) => setBuildVal(e.target.value)}
            className="w-full px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
          />
          <button
            onClick={() => {
              const matches = buildVal.match(/-?\d+/g);
              const vals = matches ? matches.map((m) => parseInt(m, 10)).filter((n) => !isNaN(n)) : [];
              if (vals.length > 0) {
                executeOp("build-heap", { values: vals.slice(0, 15) });
              }
            }}
            className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors w-full"
          >
            Build Heap
          </button>
        </div>
      ),
    },
    {
      id: "reset",
      label: "Reset Sample",
      onClick: () => {
        setHeapState(createSampleHeapState(heapType));
        executeOp("insert", { value: heapType === "min" ? 5 : 99 });
      },
    },
  ];

  return (
    <VisuAlgoShell
      title="Binary Heap Visualizer"
      category="Data Structures"
      subVariants={[
        { id: "min", label: "Min-Heap", active: heapType === "min" },
        { id: "max", label: "Max-Heap", active: heapType === "max" },
      ]}
      activeSubVariant={heapType}
      onSelectSubVariant={(id) => handleHeapTypeChange(id as HeapType)}
      manualInput={{
        label: "Heap Items",
        placeholder: "e.g. 45, 12, 89, 34, 23, 7",
        defaultValue: buildVal,
        onSubmit: (val) => {
          setBuildVal(val);
          const matches = val.match(/-?\d+/g);
          const parsed = matches ? matches.map((m) => parseInt(m, 10)).filter((n) => !isNaN(n)) : [];
          if (parsed.length > 0) {
            executeOp("build-heap", { values: parsed.slice(0, 15) });
          }
        },
        presets: [
          { label: "Sample 6", value: "45, 12, 89, 34, 23, 7" },
          { label: "Ascending", value: "10, 20, 30, 40, 50, 60" },
          { label: "Descending", value: "90, 80, 70, 60, 50, 40" },
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
        "Select Insert, Extract, or Build from the bottom-left dock."
      }
      complexityBadge={
        currentOperation === "peek"
          ? "O(1)"
          : currentOperation === "build-heap"
          ? "O(n)"
          : "O(log n)"
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
      <div className="w-full h-full flex flex-col items-center justify-between p-6 select-none relative overflow-hidden">
        {/* Tree Stage */}
        <div className="flex-1 w-full flex items-center justify-center min-h-[300px]">
          <HeapTreeCanvas
            heapState={activeStepState}
            highlightedElements={activeHighlights}
            className="w-full h-full"
          />
        </div>

        {/* Array View Stage at Bottom */}
        <div className="w-full max-w-4xl py-3 border-t border-border/40 bg-card/40 backdrop-blur-xs rounded-xl px-4 flex flex-col items-center">
          <div className="text-[11px] font-semibold text-muted-foreground mb-1">
            Array Representation (indices 0..n-1)
          </div>
          <HeapArrayView
            heapState={activeStepState}
            highlightedElements={activeHighlights}
            className="w-full"
          />
        </div>
      </div>
    </VisuAlgoShell>
  );
}

export function MinHeapVisualizerShell(props: Omit<HeapVisualizerShellProps, "initialHeapType">) {
  return <HeapVisualizerShell {...props} initialHeapType="min" />;
}

export function MaxHeapVisualizerShell(props: Omit<HeapVisualizerShellProps, "initialHeapType">) {
  return <HeapVisualizerShell {...props} initialHeapType="max" />;
}
