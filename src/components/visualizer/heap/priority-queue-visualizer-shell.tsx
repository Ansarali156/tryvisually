"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type {
  PriorityQueueOperationType,
  PriorityQueueState,
  HeapState,
} from "@/core/heap/types";
import {
  createSamplePriorityQueueState,
} from "@/core/heap/validation";
import { HeapAdapter } from "@/core/heap/heap-adapter";
import { getPriorityQueueSourceCodes } from "@/core/heap/code-snippets";
import { generatePriorityQueueTrace } from "@/core/heap/trace-generators";
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
import { PriorityQueueOperationBar } from "./priority-queue-operation-bar";
import { HeapComplexityCard } from "./heap-complexity-card";
import { ArrowLeft, PlaySquare, Code, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const defaultHeapAdapter = new HeapAdapter();

export interface PriorityQueueVisualizerShellProps {
  initialMode?: "min" | "max";
  initialState?: PriorityQueueState;
  className?: string;
}

export function PriorityQueueVisualizerShell({
  initialMode = "min",
  initialState,
  className,
}: PriorityQueueVisualizerShellProps) {
  const router = useRouter();

  // 1. Domain Configuration States
  const [mode, setMode] = React.useState<"min" | "max">(initialMode);
  const [pqState, setPqState] = React.useState<PriorityQueueState>(() => {
    if (initialState) return initialState;
    return createSamplePriorityQueueState(initialMode);
  });
  const [currentOperation, setCurrentOperation] = React.useState<PriorityQueueOperationType>("enqueue");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");
  const [mobileTab, setMobileTab] = React.useState<"visualizer" | "code">("visualizer");

  // Operation parameters for deterministic trace generation
  const [currentParams, setCurrentParams] = React.useState<Record<string, unknown>>({
    task: "Render Frame",
    priority: 2,
  });

  // 2. Deterministic Trace Generation based on PQ State & Operation
  const trace = React.useMemo(() => {
    return generatePriorityQueueTrace(currentOperation, pqState, {
      task: typeof currentParams.task === "string" ? currentParams.task : "Render Frame",
      priority: typeof currentParams.priority === "number" ? currentParams.priority : 2,
      elementId: typeof currentParams.elementId === "string" ? currentParams.elementId : pqState.items[0]?.id || "",
    });
  }, [pqState, currentOperation, currentParams]);

  // 3. Authoritative Execution Engine
  const engine = useExecutionEngine<PriorityQueueState>(trace, { initialSpeed: 1 });

  // 4. Transform PQ items to HeapState items for tree rendering
  const activeStepState = engine.currentStep?.state || pqState;
  const activeHighlights = engine.currentStep?.highlightedElements || [];

  const treeEquivalentHeapState: HeapState<number> = React.useMemo(() => {
    return {
      heapType: activeStepState.mode === "min" ? "min" : "max",
      items: activeStepState.items.map((it) => ({
        id: it.id,
        value: it.priority,
      })),
    };
  }, [activeStepState]);

  // 5. Multi-language source code snippets
  const sourceCodes = React.useMemo(() => {
    return getPriorityQueueSourceCodes(currentOperation);
  }, [currentOperation]);

  // 6. Synchronized Execution View Context
  const executionView = useExecutionView<PriorityQueueState>({
    runtimeState: engine.controller.getRuntimeState(),
    language: activeLanguage,
    sourceCodes,
  });

  // Handlers
  const handleModeChange = (newMode: "min" | "max") => {
    setMode(newMode);
    setPqState(createSamplePriorityQueueState(newMode));
    setCurrentOperation("enqueue");
    setCurrentParams({ task: "New Task", priority: newMode === "min" ? 1 : 9 });
  };

  const handleOperationChange = (op: PriorityQueueOperationType, params?: Record<string, unknown>) => {
    setCurrentOperation(op);
    if (params) {
      setCurrentParams(params);
    }
  };

  return (
    <div className={cn("min-h-screen bg-background text-foreground flex flex-col", className)}>
      {/* Compact Horizontal Topic Bar */}
      <TopicBar currentSlug="priority-queue" />

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
          {/* Priority Mode Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-card/60 border border-border/50 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-foreground">
                Priority Queue Visualizer
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                Heap Backed
              </span>
              <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400 uppercase">
                {mode} PRIORITY
              </span>
            </div>
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50">
              <Button
                size="sm"
                variant={mode === "min" ? "primary" : "ghost"}
                onClick={() => handleModeChange("min")}
                className="h-6 text-xs px-2.5 font-medium"
              >
                Min Priority
              </Button>
              <Button
                size="sm"
                variant={mode === "max" ? "primary" : "ghost"}
                onClick={() => handleModeChange("max")}
                className="h-6 text-xs px-2.5 font-medium"
              >
                Max Priority
              </Button>
            </div>
          </div>
          {/* Operations Toolbar */}
          <PriorityQueueOperationBar
            currentOperation={currentOperation}
            mode={mode}
            itemCount={activeStepState.items.length}
            onSelectOperation={handleOperationChange}
            disabled={engine.isPlaying}
          />

          {/* Graphical Complete Binary Tree Canvas (displaying priorities) */}
          <HeapTreeCanvas
            heapState={treeEquivalentHeapState}
            highlightedElements={activeHighlights}
          />

          {/* Synchronized Linear Array View (Tasks + Priority tags) */}
          <HeapArrayView
            pqState={activeStepState}
            highlightedElements={activeHighlights}
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

          {/* Live Complexity & Metrics Card */}
          <HeapComplexityCard pqState={activeStepState} />
        </section>
      </main>
    </div>
  );
}
