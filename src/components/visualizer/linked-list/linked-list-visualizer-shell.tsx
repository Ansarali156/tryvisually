"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import type { PlaybackSpeed as TimelinePlaybackSpeed } from "@/core/engine/types";
import type { PlaybackSpeed as ExecutionPlaybackSpeed } from "@/core/execution/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TimelineControls } from "@/components/ui/timeline-controls";
import { CodeViewer } from "@/components/code/code-viewer";
import { VariablesPanel } from "@/components/execution/variables-panel";
import { ExplanationPanel } from "@/components/execution/explanation-panel";
import { TopicBar } from "@/components/visualizer/topic-bar";
import { LinkedListRenderer } from "./linked-list-renderer";
import { LinkedListOperationBar } from "./linked-list-operation-bar";
import { LinkedListComplexityCard } from "./linked-list-complexity-card";
import { ArrowLeft, PlaySquare, Code, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const router = useRouter();

  // 1. Variant, List State & Operation Selection
  const [variant, setVariant] = React.useState<LinkedListVariant>(initialVariant);
  const [listValues, setListValues] = React.useState<readonly number[]>(initialValues);
  const [currentOperation, setCurrentOperation] = React.useState<LinkedListOperationType>("traverse");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");
  const [mobileTab, setMobileTab] = React.useState<"visualizer" | "code">("visualizer");

  // Track operation parameters for re-generating on state change
  const [currentParams, setCurrentParams] = React.useState<Record<string, number>>({});

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

  // Handlers
  const handleSelectVariant = (newVariant: LinkedListVariant) => {
    setVariant(newVariant);
    if (newVariant === "circular" && currentOperation === "reverse") {
      setCurrentOperation("traverse");
    }
    engine.reset();
  };

  const handleApplyCustomList = (newValues: number[]) => {
    setListValues(newValues);
    engine.reset();
  };

  const handleSelectOperation = (op: LinkedListOperationType) => {
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
      <TopicBar currentSlug="linked-lists" />

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
                    Linked List Visualizer
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    Step through dynamic pointer manipulations across Singly, Doubly, and Circular lists.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400">
                  Step {engine.currentStepIndex + 1} of {engine.totalSteps}
                </span>
              </div>

              {/* Main Linked List Stage Render */}
              <div className="flex-1 min-h-[260px] flex items-center justify-center bg-radial-pattern">
                <LinkedListRenderer
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
            <LinkedListOperationBar
              variant={variant}
              onSelectVariant={handleSelectVariant}
              currentOperation={currentOperation}
              onSelectOperation={handleSelectOperation}
              onApplyCustomList={handleApplyCustomList}
              onExecuteOperation={handleExecuteOperation}
              listLength={listValues.length}
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
            <LinkedListComplexityCard operation={currentOperation} variant={variant} />
          </div>
        </div>
      </main>
    </div>
  );
}
