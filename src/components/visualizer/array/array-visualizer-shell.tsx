"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ArrayOperationType, ArrayState } from "@/core/array/types";
import { DEFAULT_INITIAL_ARRAY } from "@/core/array/random";
import { createArrayState } from "@/core/array/validation";
import { defaultArrayAdapter } from "@/core/array/array-adapter";
import { getArrayOperationSourceCodes } from "@/core/array/code-snippets";
import {
  createAccessTrace,
  createUpdateTrace,
  createInsertTrace,
  createDeleteTrace,
  createLinearSearchTrace,
  createCompareTrace,
  createSwapTrace,
  createBubbleSortTrace,
} from "@/core/array/trace-generators";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import { useVisualizationState } from "@/core/visualization/hooks/use-visualization-state";
import { useExecutionView } from "@/core/synchronization/hooks/use-execution-view";
import type { SupportedLanguage } from "@/core/synchronization/types";
import type { PlaybackSpeed as TimelinePlaybackSpeed } from "@/core/engine/types";
import type { PlaybackSpeed as ExecutionPlaybackSpeed } from "@/core/execution/types";
import { TimelineControls } from "@/components/ui/timeline-controls";
import { CodeViewer } from "@/components/code/code-viewer";
import { VariablesPanel } from "@/components/execution/variables-panel";
import { ExplanationPanel } from "@/components/execution/explanation-panel";
import { TopicBar } from "@/components/visualizer/topic-bar";
import { ArrayRenderer } from "./array-renderer";
import { ArrayOperationBar } from "./array-operation-bar";
import { ArrayComplexityCard } from "./array-complexity-card";
import { Code2, Layers, BookOpen } from "lucide-react";

export interface ArrayVisualizerShellProps {
  initialValues?: readonly number[];
  className?: string;
}

export function ArrayVisualizerShell({
  initialValues = DEFAULT_INITIAL_ARRAY,
  className,
}: ArrayVisualizerShellProps) {
  // 1. Array State & Operation Selection
  const [arrayValues, setArrayValues] = React.useState<readonly number[]>(initialValues);
  const [currentOperation, setCurrentOperation] = React.useState<ArrayOperationType>("bubble-sort");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");
  const [executionTab, setExecutionTab] = React.useState<"code" | "variables" | "explanation">("code");

  // Track operation parameters for re-generating on array change
  const [currentParams, setCurrentParams] = React.useState<Record<string, number>>({});

  // 2. Canonical ArrayState creation
  const arrayState = React.useMemo(() => {
    return createArrayState(arrayValues);
  }, [arrayValues]);

  // 3. Deterministic trace generation based on operation
  const trace = React.useMemo(() => {
    switch (currentOperation) {
      case "access": {
        const idx = currentParams.index ?? 0;
        return createAccessTrace(arrayState, idx);
      }
      case "update": {
        const idx = currentParams.index ?? 0;
        const val = currentParams.value ?? 99;
        return createUpdateTrace(arrayState, idx, val);
      }
      case "insert": {
        const idx = currentParams.index ?? arrayState.items.length;
        const val = currentParams.value ?? 42;
        return createInsertTrace(arrayState, idx, val);
      }
      case "delete": {
        const idx = currentParams.index ?? 0;
        return createDeleteTrace(arrayState, idx);
      }
      case "linear-search": {
        const target = currentParams.target ?? (arrayValues[3] ?? 23);
        return createLinearSearchTrace(arrayState, target);
      }
      case "compare": {
        return createCompareTrace(arrayState, 0, Math.min(1, arrayState.items.length - 1));
      }
      case "swap": {
        return createSwapTrace(arrayState, 0, Math.min(1, arrayState.items.length - 1));
      }
      case "bubble-sort":
      default:
        return createBubbleSortTrace(arrayState);
    }
  }, [currentOperation, arrayState, currentParams, arrayValues]);

  // 4. Authoritative Execution Engine
  const engine = useExecutionEngine<ArrayState>(trace, { initialSpeed: 1 });

  // 5. Visualization State Engine derivation
  const { visualizationState, resolvedHighlights } = useVisualizationState<ArrayState>({
    adapter: defaultArrayAdapter,
    runtimeState: engine.controller.getRuntimeState(),
  });

  // 6. Source code snippets for synchronization
  const sourceCodes = React.useMemo(() => {
    return getArrayOperationSourceCodes(currentOperation);
  }, [currentOperation]);

  // 7. Synchronized Execution View Context
  const executionView = useExecutionView<ArrayState>({
    runtimeState: engine.controller.getRuntimeState(),
    language: activeLanguage,
    sourceCodes,
    visualizationState,
  });

  // Handlers
  const handleApplyCustomArray = (newValues: number[]) => {
    setArrayValues(newValues);
    engine.reset();
  };

  const handleSelectOperation = (op: ArrayOperationType) => {
    setCurrentOperation(op);
    setCurrentParams({});
    engine.reset();
  };

  const handleExecuteOperation = (params: Record<string, number>) => {
    setCurrentParams(params);
    engine.reset();
  };

  return (
    <div className={cn("flex flex-col min-h-screen bg-surface-50 dark:bg-surface-950", className)}>
      {/* Compact Topic Navigation Area */}
      <TopicBar currentSlug="arrays" basePath="/visualise" />

      {/* Main Dominant Workspace */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto flex flex-col gap-6">
        
        {/* ============================================================== */}
        {/* DOMINANT VISUALIZATION WORKSPACE                               */}
        {/* ============================================================== */}
        <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-surface-900 shadow-sm overflow-hidden flex flex-col">
          {/* Canvas Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-surface-50/80 dark:bg-surface-950/60">
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                Array Visualizer
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Explore how arrays store and manipulate elements.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              Step {engine.currentStepIndex + 1} of {engine.totalSteps}
            </span>
          </div>

          {/* Main Dominant Canvas Stage */}
          <div className="min-h-[280px] sm:min-h-[340px] flex items-center justify-center p-6 bg-radial-pattern">
            <ArrayRenderer
              visualizationState={visualizationState}
              resolvedHighlights={resolvedHighlights}
              speed={engine.speed}
            />
          </div>

          {/* Compact Controls Directly Below Visualization */}
          <div className="border-t border-slate-200 dark:border-slate-800 bg-surface-50/70 dark:bg-surface-950/50 p-4 flex flex-col gap-3">
            {/* Row 1: Operation Selector, Input Parameters & Run */}
            <ArrayOperationBar
              currentOperation={currentOperation}
              onSelectOperation={handleSelectOperation}
              onApplyCustomArray={handleApplyCustomArray}
              onExecuteOperation={handleExecuteOperation}
              arrayLength={arrayValues.length}
            />

            {/* Row 2: Playback Timeline Controls */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
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
        </div>

        {/* ============================================================== */}
        {/* COMPACT LEARNING / EXECUTION SECTION                           */}
        {/* ============================================================== */}
        <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-surface-900 shadow-sm overflow-hidden flex flex-col">
          {/* Section Header with Tabs: [Code] [Variables] [Explanation] */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-surface-50/80 dark:bg-surface-950/60">
            <div className="flex items-center gap-1 rounded-lg bg-surface-200/80 dark:bg-surface-800 p-1">
              <button
                onClick={() => setExecutionTab("code")}
                className={cn(
                  "px-4 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors",
                  executionTab === "code"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-surface-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Code</span>
              </button>

              <button
                onClick={() => setExecutionTab("variables")}
                className={cn(
                  "px-4 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors",
                  executionTab === "variables"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-surface-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Variables</span>
              </button>

              <button
                onClick={() => setExecutionTab("explanation")}
                className={cn(
                  "px-4 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors",
                  executionTab === "explanation"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-surface-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Explanation</span>
              </button>
            </div>

            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Active: {currentOperation}
            </span>
          </div>

          {/* Tab Content Display */}
          <div className="p-4 sm:p-5">
            {/* 1. Code Tab */}
            <div className={cn(executionTab !== "code" && "hidden")}>
              <CodeViewer
                sourceCode={executionView.sourceCode}
                activeLines={executionView.activeCodeLines}
                primaryLine={executionView.primaryCodeLine}
                language={activeLanguage}
                onLanguageChange={setActiveLanguage}
                availableLanguages={["python", "typescript"]}
                title="Synchronized Implementation"
                className="border-0 shadow-none"
              />
            </div>

            {/* 2. Variables Tab */}
            <div className={cn(executionTab !== "variables" && "hidden")}>
              <VariablesPanel
                variables={executionView.variables}
                variableDiffs={executionView.variableDiffs}
                title="Runtime Variables"
              />
            </div>

            {/* 3. Explanation Tab */}
            <div className={cn(executionTab !== "explanation" && "hidden", "space-y-4")}>
              <ExplanationPanel
                explanation={executionView.explanation}
                operation={executionView.operation}
                codeLine={executionView.primaryCodeLine}
                stepIndex={executionView.stepIndex}
                totalSteps={executionView.totalSteps}
              />

              <ArrayComplexityCard operation={currentOperation} />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
