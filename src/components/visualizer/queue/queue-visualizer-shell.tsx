"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import type { PlaybackSpeed as TimelinePlaybackSpeed } from "@/core/engine/types";
import type { PlaybackSpeed as ExecutionPlaybackSpeed } from "@/core/execution/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TimelineControls } from "@/components/ui/timeline-controls";
import { CodeViewer } from "@/components/code/code-viewer";
import { VariablesPanel } from "@/components/execution/variables-panel";
import { ExplanationPanel } from "@/components/execution/explanation-panel";
import { TopicBar } from "@/components/visualizer/topic-bar";
import { QueueRenderer } from "./queue-renderer";
import { QueueOperationBar } from "./queue-operation-bar";
import { QueueComplexityCard } from "./queue-complexity-card";
import { ArrowLeft, PlaySquare, Code, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const router = useRouter();

  // 1. Queue State, Variant & Operation Selection
  const [queueValues, setQueueValues] = React.useState<readonly number[]>(initialValues);
  const [variant, setVariant] = React.useState<QueueVariant>(initialVariant);
  const [capacity, setCapacity] = React.useState<number>(initialCapacity);
  const [currentOperation, setCurrentOperation] = React.useState<QueueOperationType>("enqueue");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");
  const [mobileTab, setMobileTab] = React.useState<"visualizer" | "code">("visualizer");

  // Track operation parameters for re-generating on queue change
  const [currentParams, setCurrentParams] = React.useState<Record<string, number>>({});

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

  // Handlers
  const handleApplyCustomQueue = (newValues: number[], newCapacity?: number) => {
    setQueueValues(newValues);
    if (newCapacity && newCapacity > 0) {
      setCapacity(newCapacity);
    }
    engine.reset();
  };

  const handleChangeVariant = (newVariant: QueueVariant) => {
    setVariant(newVariant);
    if (newVariant === "linear" && currentOperation === "isFull") {
      setCurrentOperation("enqueue");
    }
    setCurrentParams({});
    engine.reset();
  };

  const handleSelectOperation = (op: QueueOperationType) => {
    setCurrentOperation(op);
    setCurrentParams({});
    engine.reset();
  };

  const handleExecuteOperation = (params: Record<string, number>) => {
    setCurrentParams(params);
    engine.reset();
  };

  return (
    <div className={cn("flex flex-col min-h-screen bg-surface-100 dark:bg-surface-950", className)}>
      {/* Compact Horizontal Topic Bar */}
      <TopicBar currentSlug="queue" />

      {/* Mobile Switcher Bar */}
      <div className="lg:hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-surface-900 p-2">
        <Tabs value={mobileTab} onValueChange={(val) => setMobileTab(val as "visualizer" | "code")}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="visualizer" className="gap-1">
              <PlaySquare className="h-3 w-3" />
              <span>Visualization</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-1">
              <Code className="h-3 w-3" />
              <span>Code & State</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Workspace Layout */}
      <main className="flex-1 p-3 md:p-4 max-w-7xl w-full mx-auto flex flex-col gap-4">
        {/* Visualizer Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Visualization Canvas & Operation Bar (7 cols desktop, 8 on xl) */}
          <div
            className={cn(
              "lg:col-span-7 xl:col-span-8 flex flex-col gap-4",
              mobileTab !== "visualizer" && "hidden lg:flex"
            )}
          >
            {/* Visualizer Canvas Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-surface-900 overflow-hidden flex flex-col">
              {/* Canvas Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-surface-50 dark:bg-surface-950/60">
                <div>
                  <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                    {variant === "circular" ? "Circular Queue Visualizer" : "Queue Visualizer"}
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    {variant === "circular"
                      ? "Observe modulo arithmetic and bounded buffer ring reuse."
                      : "Master FIFO principles, enqueue at rear, and dequeue at front."}
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400">
                  Step {engine.currentStepIndex + 1} of {engine.totalSteps}
                </span>
              </div>

              {/* Main Queue Stage Render */}
              <div className="flex-1 min-h-[280px] flex items-center justify-center bg-radial-pattern">
                <QueueRenderer
                  visualizationState={visualizationState}
                  resolvedHighlights={resolvedHighlights}
                  variant={variant}
                  speed={engine.speed}
                />
              </div>

              {/* Authoritative Timeline Controls */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-surface-50 dark:bg-surface-950/40">
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
            </div>

            {/* Custom Input & Operations Selector Bar */}
            <QueueOperationBar
              currentOperation={currentOperation}
              variant={variant}
              onSelectOperation={handleSelectOperation}
              onSelectVariant={handleChangeVariant}
              onApplyCustomQueue={handleApplyCustomQueue}
              onExecuteOperation={handleExecuteOperation}
              queueLength={queueValues.length}
              capacity={capacity}
            />

            {/* Explanation Panel */}
            <ExplanationPanel
              explanation={executionView.explanation}
              operation={executionView.operation}
              codeLine={executionView.primaryCodeLine}
              stepIndex={executionView.stepIndex}
              totalSteps={executionView.totalSteps}
            />
          </div>

          {/* Right Column: Code, Variables & Complexity (3 cols desktop) */}
          <div
            className={cn(
              "lg:col-span-5 xl:col-span-4 flex flex-col gap-4",
              mobileTab !== "code" && "hidden lg:flex"
            )}
          >
            {/* Synchronized Code Viewer */}
            <CodeViewer
              sourceCode={executionView.sourceCode}
              activeLines={executionView.activeCodeLines}
              primaryLine={executionView.primaryCodeLine}
              language={activeLanguage}
              onLanguageChange={setActiveLanguage}
              availableLanguages={["python", "typescript"]}
              title="Synchronized Implementation"
              className="flex-1 min-h-[220px]"
            />

            {/* Variables Inspector */}
            <VariablesPanel
              variables={executionView.variables}
              variableDiffs={executionView.variableDiffs}
              title="Runtime Variables"
            />

            {/* Asymptotic Complexity & Educational Information */}
            <QueueComplexityCard operation={currentOperation} variant={variant} />
          </div>
        </div>
      </main>
    </div>
  );
}
