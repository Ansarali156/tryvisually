"use client";

import * as React from "react";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import { createSampleDemoTrace, DemoState } from "@/core/execution/demonstration/sample-trace";
import { PlaybackSpeed } from "@/core/execution/types";
import {
  PrimaryButton,
  SecondaryButton,
  IconButton,
} from "@/components/ui/buttons";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Code2,
  Database,
  Info,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GenericDemoAdapter } from "@/core/visualization/adapters/generic-demo-adapter";
import { useVisualizationState } from "@/core/visualization/hooks/use-visualization-state";
import { VisualizationInspector } from "./visualization-inspector";
import { useExecutionView } from "@/core/synchronization/hooks/use-execution-view";
import {
  DEMO_SOURCE_CODES,
  createDemoCodeMappingRegistry,
} from "@/core/synchronization/demonstration/sample-code";
import type { SupportedLanguage } from "@/core/synchronization/types";
import { CodeViewer } from "@/components/code/code-viewer";
import { VariablesPanel } from "@/components/execution/variables-panel";
import { ExplanationPanel } from "@/components/execution/explanation-panel";
import { AnimatedElementsContainer } from "./animated-elements-container";

export function ExecutionEngineDemo({ className }: { className?: string }) {
  // Memoize demonstration trace
  const demoTrace = React.useMemo(() => createSampleDemoTrace(), []);

  // Connect Execution Engine React Hook
  const {
    currentStep,
    currentState,
    currentStepIndex,
    totalSteps,
    status,
    speed,
    progress,
    isPlaying,
    isCompleted,
    play,
    pause,
    next,
    previous,
    reset,
    replay,
    jumpTo,
    jumpToStart,
    jumpToEnd,
    setSpeed,
  } = useExecutionEngine<DemoState>(demoTrace, { baseDelayMs: 800 });

  const demoAdapter = React.useMemo(() => new GenericDemoAdapter(), []);
  const { visualizationState, resolvedHighlights } = useVisualizationState<DemoState>({
    adapter: demoAdapter,
    state: currentState,
    step: currentStep,
  });

  const [language, setLanguage] = React.useState<SupportedLanguage>("python");
  const mappingRegistry = React.useMemo(() => createDemoCodeMappingRegistry(), []);
  const previousStep = currentStepIndex > 0 ? demoTrace.steps[currentStepIndex - 1] : null;

  const executionView = useExecutionView<DemoState>({
    runtimeState: {
      currentStepIndex,
      currentStep,
      currentState,
      status,
      speed,
      totalSteps,
      progress,
    },
    previousStep,
    language,
    sourceCodes: DEMO_SOURCE_CODES,
    mappingRegistry,
    visualizationState,
  });

  const speeds: PlaybackSpeed[] = [0.5, 1, 2, 4];

  const statusVariant =
    status === "playing"
      ? "brand"
      : status === "completed"
      ? "success"
      : status === "paused"
      ? "warning"
      : "neutral";

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-surface-900 select-none space-y-4",
        className
      )}
    >
      {/* Header & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Core Execution Engine Runtime
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Deterministic Language-Independent Architecture
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={statusVariant} size="sm">
            Status: {status.toUpperCase()}
          </Badge>
          <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
            Step {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>
      </div>

      {/* Animated Elements Presentation */}
      <AnimatedElementsContainer
        visualizationState={visualizationState}
        resolvedHighlights={resolvedHighlights}
        speed={speed}
      />

      {/* Code ↔ Execution Synchronized Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Source Code Viewer (7 cols) */}
        <div className="lg:col-span-7 h-64">
          <CodeViewer
            sourceCode={executionView.sourceCode}
            activeLines={executionView.activeCodeLines}
            primaryLine={executionView.primaryCodeLine}
            language={language}
            onLanguageChange={setLanguage}
            availableLanguages={["python", "typescript", "java", "cpp"]}
            title="Algorithm Implementation"
            className="h-full"
          />
        </div>

        {/* Variables & Explanation Panels (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <ExplanationPanel
            explanation={executionView.explanation}
            operation={executionView.operation}
            codeLine={executionView.primaryCodeLine}
            stepIndex={executionView.stepIndex}
            totalSteps={executionView.totalSteps}
          />
          <VariablesPanel
            variables={executionView.variables}
            variableDiffs={executionView.variableDiffs}
            className="flex-1"
          />
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Execution Progress</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <Progress value={progress * 100} />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Step Actions */}
          <div className="flex items-center gap-1.5">
            <SecondaryButton
              size="sm"
              onClick={jumpToStart}
              disabled={currentStepIndex === 0}
              title="First step"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </SecondaryButton>

            <SecondaryButton
              size="sm"
              onClick={previous}
              disabled={currentStepIndex === 0}
              title="Previous step"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </SecondaryButton>

            {isPlaying ? (
              <PrimaryButton size="sm" onClick={pause} className="w-20">
                <Pause className="h-3.5 w-3.5 fill-current mr-1" />
                Pause
              </PrimaryButton>
            ) : (
              <PrimaryButton size="sm" onClick={play} className="w-20">
                <Play className="h-3.5 w-3.5 fill-current mr-1" />
                Play
              </PrimaryButton>
            )}

            <SecondaryButton
              size="sm"
              onClick={next}
              disabled={isCompleted}
              title="Next step"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </SecondaryButton>

            <SecondaryButton
              size="sm"
              onClick={jumpToEnd}
              disabled={isCompleted}
              title="Last step"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </SecondaryButton>

            <SecondaryButton size="sm" onClick={reset} title="Reset">
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </SecondaryButton>
          </div>

          {/* Speed Selection */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Speed:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-surface-50 dark:border-slate-800 dark:bg-surface-950">
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cn(
                    "px-2 py-0.5 text-xs font-mono rounded transition-colors",
                    speed === s
                      ? "bg-brand-600 text-white font-medium"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Developer State Engine Inspector */}
      <VisualizationInspector
        visualizationState={visualizationState}
        resolvedHighlights={resolvedHighlights}
      />
    </div>
  );
}
