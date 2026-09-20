"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import type { PlaybackSpeed as TimelinePlaybackSpeed } from "@/core/engine/types";
import type { PlaybackSpeed as ExecutionPlaybackSpeed } from "@/core/execution/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TimelineControls } from "@/components/ui/timeline-controls";
import { CodeViewer } from "@/components/code/code-viewer";
import { VariablesPanel } from "@/components/execution/variables-panel";
import { ExplanationPanel } from "@/components/execution/explanation-panel";
import { TopicBar } from "@/components/visualizer/topic-bar";
import { StackRenderer } from "./stack-renderer";
import { StackOperationBar } from "./stack-operation-bar";
import { StackComplexityCard } from "./stack-complexity-card";
import { ArrowLeft, PlaySquare, Code, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface StackVisualizerShellProps {
  initialValues?: readonly number[];
  className?: string;
}

export function StackVisualizerShell({
  initialValues = DEFAULT_STACK_VALUES,
  className,
}: StackVisualizerShellProps) {
  const router = useRouter();

  // 1. Stack State & Operation Selection
  const [stackValues, setStackValues] = React.useState<readonly number[]>(initialValues);
  const [currentOperation, setCurrentOperation] = React.useState<StackOperationType>("push");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");
  const [mobileTab, setMobileTab] = React.useState<"visualizer" | "code">("visualizer");

  // Track operation parameters for re-generating on stack change
  const [currentParams, setCurrentParams] = React.useState<Record<string, number>>({});

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

  // Handlers
  const handleApplyCustomStack = (newValues: number[]) => {
    setStackValues(newValues);
    engine.reset();
  };

  const handleSelectOperation = (op: StackOperationType) => {
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
      <TopicBar currentSlug="stack" />

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
                    Stack Visualizer
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    Master LIFO principles, push/pop mechanics, and top-pointer tracking.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400">
                  Step {engine.currentStepIndex + 1} of {engine.totalSteps}
                </span>
              </div>

              {/* Main Stack Stage Render */}
              <div className="flex-1 min-h-[280px] flex items-center justify-center bg-radial-pattern">
                <StackRenderer
                  visualizationState={visualizationState}
                  resolvedHighlights={resolvedHighlights}
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
            <StackOperationBar
              currentOperation={currentOperation}
              onSelectOperation={handleSelectOperation}
              onApplyCustomStack={handleApplyCustomStack}
              onExecuteOperation={handleExecuteOperation}
              stackLength={stackValues.length}
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

          {/* Right Column: Code, Variables & Complexity (5 cols desktop, 4 on xl) */}
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
            <StackComplexityCard operation={currentOperation} />
          </div>
        </div>
      </main>
    </div>
  );
}
