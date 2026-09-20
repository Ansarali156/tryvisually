"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import type { PlaybackSpeed as TimelinePlaybackSpeed } from "@/core/engine/types";
import type { PlaybackSpeed as ExecutionPlaybackSpeed } from "@/core/execution/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TimelineControls } from "@/components/ui/timeline-controls";
import { CodeViewer } from "@/components/code/code-viewer";
import { VariablesPanel } from "@/components/execution/variables-panel";
import { ExplanationPanel } from "@/components/execution/explanation-panel";
import { TopicBar } from "@/components/visualizer/topic-bar";
import { HeapTreeCanvas } from "./heap-tree-canvas";
import { HeapArrayView } from "./heap-array-view";
import { HeapOperationBar } from "./heap-operation-bar";
import { HeapComplexityCard } from "./heap-complexity-card";
import { ArrowLeft, PlaySquare, Code, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const router = useRouter();

  // 1. Domain Configuration States
  const [heapType, setHeapType] = React.useState<HeapType>(initialHeapType);
  const [heapState, setHeapState] = React.useState<HeapState<number>>(() => {
    if (initialHeapState) return initialHeapState;
    return createSampleHeapState(initialHeapType);
  });
  const [currentOperation, setCurrentOperation] = React.useState<HeapOperationType>("insert");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");
  const [mobileTab, setMobileTab] = React.useState<"visualizer" | "code">("visualizer");

  // Operation parameters for deterministic trace generation
  const [currentParams, setCurrentParams] = React.useState<Record<string, unknown>>({
    value: 5,
  });

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

  // Handlers
  const handleHeapTypeChange = (newType: HeapType) => {
    setHeapType(newType);
    setHeapState(createSampleHeapState(newType));
    setCurrentOperation("insert");
    setCurrentParams({ value: newType === "min" ? 5 : 99 });
  };

  const handleOperationChange = (op: HeapOperationType, params?: Record<string, unknown>) => {
    setCurrentOperation(op);
    if (params) {
      setCurrentParams(params);
    }
  };

  // State snapshot at current playback step
  const activeStepState = engine.currentStep?.state || heapState;
  const activeHighlights = engine.currentStep?.highlightedElements || [];

  return (
    <div className={cn("min-h-screen bg-background text-foreground flex flex-col", className)}>
      {/* Compact Horizontal Topic Bar */}
      <TopicBar currentSlug="heap" />

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden border-b border-border bg-card/40 px-4 py-2">
        <Tabs
          value={mobileTab}
          onValueChange={(val) => setMobileTab(val as "visualizer" | "code")}
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="visualizer" className="text-xs gap-1.5">
              <PlaySquare className="w-3.5 h-3.5" />
              Visualization
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs gap-1.5">
              <Code className="w-3.5 h-3.5" />
              Code & Vars
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 2. Main Visualizer Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Center Canvas / Controls */}
        <section
          className={cn(
            "lg:col-span-7 xl:col-span-8 space-y-4",
            mobileTab !== "visualizer" && "hidden lg:block"
          )}
        >
          {/* Heap Type Toggle bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-card/60 border border-border/50 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-foreground">
                Binary Heap Visualizer
              </h1>
              <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400 uppercase">
                {heapType} HEAP
              </span>
            </div>
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50">
              <Button
                size="sm"
                variant={heapType === "min" ? "primary" : "ghost"}
                onClick={() => handleHeapTypeChange("min")}
                className="h-6 text-xs px-2.5 font-medium"
              >
                Min Heap
              </Button>
              <Button
                size="sm"
                variant={heapType === "max" ? "primary" : "ghost"}
                onClick={() => handleHeapTypeChange("max")}
                className="h-6 text-xs px-2.5 font-medium"
              >
                Max Heap
              </Button>
            </div>
          </div>
          {/* Operations & Interactive Toolbar */}
          <HeapOperationBar
            currentOperation={currentOperation}
            heapType={heapType}
            heapSize={activeStepState.items.length}
            onSelectOperation={handleOperationChange}
            disabled={engine.isPlaying}
          />

          {/* Graphical Complete Binary Tree Canvas */}
          <HeapTreeCanvas
            heapState={activeStepState}
            highlightedElements={activeHighlights}
          />

          {/* Synchronized Linear Array View */}
          <HeapArrayView
            heapState={activeStepState}
            highlightedElements={activeHighlights}
            onSelectIndex={(idx) => {
              handleOperationChange("delete", { index: idx });
            }}
          />

          {/* Step Explanation Callout */}
          <ExplanationPanel
            explanation={executionView.explanation}
            operation={executionView.operation}
            codeLine={executionView.primaryCodeLine}
            stepIndex={executionView.stepIndex}
            totalSteps={executionView.totalSteps}
          />

          {/* Timeline Playback Controls */}
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm">
            <TimelineControls
              isPlaying={engine.isPlaying}
              currentStep={engine.currentStepIndex}
              totalSteps={engine.totalSteps}
              speed={
                (engine.speed === 0.5 || engine.speed === 1 || engine.speed === 1.5 || engine.speed === 2
                  ? engine.speed
                  : 1) as TimelinePlaybackSpeed
              }
              onPlay={engine.play}
              onPause={engine.pause}
              onStepForward={engine.next}
              onStepBackward={engine.previous}
              onGoToStart={engine.jumpToStart}
              onGoToEnd={engine.jumpToEnd}
              onSeek={engine.jumpTo}
              onSpeedChange={(s: TimelinePlaybackSpeed) => engine.setSpeed(s as ExecutionPlaybackSpeed)}
            />
          </div>
        </section>

        {/* Right Code Synchronization & Variable Inspector */}
        <section
          className={cn(
            "lg:col-span-5 xl:col-span-4 space-y-4",
            mobileTab !== "code" && "hidden lg:block"
          )}
        >
          {/* Synchronized Code Viewer */}
          <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden shadow-sm">
            <CodeViewer
              sourceCode={executionView.sourceCode}
              activeLines={executionView.activeCodeLines}
              primaryLine={executionView.primaryCodeLine}
              language={activeLanguage}
              onLanguageChange={setActiveLanguage}
              availableLanguages={["python", "javascript", "typescript", "java", "cpp"]}
              title="Synchronized Implementation"
              className="flex-1 min-h-[220px]"
            />
          </div>

          {/* Execution Variables Panel */}
          <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden shadow-sm">
            <VariablesPanel
              variables={executionView.variables || {}}
              variableDiffs={executionView.variableDiffs}
              title="Runtime Variables"
            />
          </div>

          {/* Live Complexity & Invariants Card */}
          <HeapComplexityCard heapState={activeStepState} />
        </section>
      </main>
    </div>
  );
}

export function MinHeapVisualizerShell(props: Omit<HeapVisualizerShellProps, "initialHeapType">) {
  return <HeapVisualizerShell {...props} initialHeapType="min" />;
}

export function MaxHeapVisualizerShell(props: Omit<HeapVisualizerShellProps, "initialHeapType">) {
  return <HeapVisualizerShell {...props} initialHeapType="max" />;
}
