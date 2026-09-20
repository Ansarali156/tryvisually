"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type {
  CollisionStrategy,
  HashTableOperationType,
  HashTableState,
} from "@/core/hash-table/types";
import {
  DEFAULT_HASH_ENTRIES,
  DEFAULT_HASH_TABLE_CAPACITY,
  createHashTableState,
} from "@/core/hash-table/validation";
import { defaultHashTableAdapter } from "@/core/hash-table/hash-table-adapter";
import { getHashTableSourceCodes } from "@/core/hash-table/code-snippets";
import { generateHashTableTrace } from "@/core/hash-table/trace-generators";
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
import { HashTableRenderer } from "./hash-table-renderer";
import { HashTableOperationBar } from "./hash-table-operation-bar";
import { HashTableComplexityCard } from "./hash-table-complexity-card";
import { ArrowLeft, PlaySquare, Code, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface HashTableVisualizerShellProps {
  initialPairs?: readonly { key: string; value: string }[];
  initialStrategy?: CollisionStrategy;
  initialCapacity?: number;
  className?: string;
}

export function HashTableVisualizerShell({
  initialPairs = DEFAULT_HASH_ENTRIES,
  initialStrategy = "chaining",
  initialCapacity = DEFAULT_HASH_TABLE_CAPACITY,
  className,
}: HashTableVisualizerShellProps) {
  const router = useRouter();

  // 1. Domain Configuration States
  const [pairs, setPairs] = React.useState<readonly { key: string; value: string }[]>(initialPairs);
  const [strategy, setStrategy] = React.useState<CollisionStrategy>(initialStrategy);
  const [capacity, setCapacity] = React.useState<number>(initialCapacity);
  const [currentOperation, setCurrentOperation] = React.useState<HashTableOperationType>("insert");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");
  const [mobileTab, setMobileTab] = React.useState<"visualizer" | "code">("visualizer");

  // Operation parameters for deterministic trace generation
  const [currentParams, setCurrentParams] = React.useState<Record<string, string | number>>({
    key: "Frank",
    value: "50",
  });

  // 2. Base Hash Table State
  const hashTableState: HashTableState = React.useMemo(() => {
    return createHashTableState(pairs, strategy, capacity);
  }, [pairs, strategy, capacity]);

  // 3. Deterministic Trace Generation based on Operation & Parameters
  const trace = React.useMemo(() => {
    return generateHashTableTrace(hashTableState, currentOperation, currentParams);
  }, [hashTableState, currentOperation, currentParams]);

  // 4. Authoritative Execution Engine
  const engine = useExecutionEngine<HashTableState>(trace, { initialSpeed: 1 });

  // 5. Visualization State Engine derivation
  const { visualizationState, resolvedHighlights } = useVisualizationState<HashTableState>({
    adapter: defaultHashTableAdapter,
    runtimeState: engine.controller.getRuntimeState(),
  });

  // 6. Multi-language source code snippets
  const sourceCodes = React.useMemo(() => {
    return getHashTableSourceCodes(currentOperation, strategy);
  }, [currentOperation, strategy]);

  // 7. Synchronized Execution View Context
  const executionView = useExecutionView<HashTableState>({
    runtimeState: engine.controller.getRuntimeState(),
    language: activeLanguage,
    sourceCodes,
    visualizationState,
  });

  // Handlers
  const handleSelectStrategy = (newStrategy: CollisionStrategy) => {
    setStrategy(newStrategy);
    engine.reset();
  };

  const handleSelectOperation = (op: HashTableOperationType) => {
    setCurrentOperation(op);
    engine.reset();
  };

  const handleExecuteOperation = (params: Record<string, string | number>) => {
    setCurrentParams(params);
    engine.reset();
  };

  const handleResetSample = () => {
    setPairs(DEFAULT_HASH_ENTRIES);
    setCurrentParams({ key: "Frank", value: "50" });
    engine.reset();
  };

  const handleInsertRandom = (key: string, value: string) => {
    setCurrentOperation("insert");
    setCurrentParams({ key, value });
    engine.reset();
  };

  return (
    <div className={cn("flex flex-col min-h-screen bg-surface-100 dark:bg-surface-950", className)}>
      {/* Compact Horizontal Topic Bar */}
      <TopicBar currentSlug="hash-table" />

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
                    Hash Table Visualizer
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    Observe key hashing, bucket indexing, collisions, and open-addressing tombstones.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400">
                  Step {engine.currentStepIndex + 1} of {engine.totalSteps}
                </span>
              </div>

              {/* Main Hash Table Canvas Render */}
              <div className="flex-1 min-h-[300px] flex items-center justify-center bg-radial-pattern">
                <HashTableRenderer
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
            <HashTableOperationBar
              strategy={strategy}
              onSelectStrategy={handleSelectStrategy}
              currentOperation={currentOperation}
              onSelectOperation={handleSelectOperation}
              onExecuteOperation={handleExecuteOperation}
              onResetSample={handleResetSample}
              onInsertRandom={handleInsertRandom}
              size={hashTableState.size}
              capacity={capacity}
              loadFactor={hashTableState.loadFactor}
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
              availableLanguages={["python", "javascript", "typescript", "java", "cpp"]}
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
            <HashTableComplexityCard
              operation={currentOperation}
              strategy={strategy}
              loadFactor={hashTableState.loadFactor}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
