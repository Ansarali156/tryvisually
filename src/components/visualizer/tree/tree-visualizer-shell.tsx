"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type {
  TreeMode,
  TreeOperationType,
  TreeState,
} from "@/core/tree/types";
import {
  createSampleBSTState,
  createSampleBinaryTreeState,
  createEmptyTreeState,
  buildBSTFromValues,
} from "@/core/tree/validation";
import { defaultTreeAdapter } from "@/core/tree/tree-adapter";
import { getTreeSourceCodes } from "@/core/tree/code-snippets";
import { generateTreeTrace } from "@/core/tree/trace-generators";
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
import { TreeCanvas } from "./tree-canvas";
import { TreeTraversalOutput } from "./tree-traversal-output";
import { TreeOperationBar } from "./tree-operation-bar";
import { TreeComplexityCard } from "./tree-complexity-card";
import { ArrowLeft, PlaySquare, Code, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface TreeVisualizerShellProps {
  initialMode?: TreeMode;
  initialTreeState?: TreeState<number>;
  className?: string;
}

export function TreeVisualizerShell({
  initialMode = "bst",
  initialTreeState,
  className,
}: TreeVisualizerShellProps) {
  const router = useRouter();

  // 1. Domain Configuration States
  const [mode, setMode] = React.useState<TreeMode>(initialMode);
  const [treeState, setTreeState] = React.useState<TreeState<number>>(() => {
    if (initialTreeState) return initialTreeState;
    return initialMode === "bst" ? createSampleBSTState() : createSampleBinaryTreeState();
  });
  const [currentOperation, setCurrentOperation] = React.useState<TreeOperationType>("search");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");
  const [mobileTab, setMobileTab] = React.useState<"visualizer" | "code">("visualizer");

  // Operation parameters for deterministic trace generation
  const [currentParams, setCurrentParams] = React.useState<Record<string, unknown>>({
    target: 60,
    value: 45,
  });

  // 2. Deterministic Trace Generation based on TreeState & Operation
  const trace = React.useMemo(() => {
    return generateTreeTrace(treeState, currentOperation, currentParams, mode);
  }, [treeState, currentOperation, currentParams, mode]);

  // 3. Authoritative Execution Engine
  const engine = useExecutionEngine<TreeState<number>>(trace, { initialSpeed: 1 });

  // 4. Visualization State Engine derivation
  const { visualizationState, resolvedHighlights } = useVisualizationState<TreeState<number>>({
    adapter: defaultTreeAdapter,
    runtimeState: engine.controller.getRuntimeState(),
  });

  // 5. Multi-language source code snippets
  const sourceCodes = React.useMemo(() => {
    return getTreeSourceCodes(currentOperation);
  }, [currentOperation]);

  // 6. Synchronized Execution View Context
  const executionView = useExecutionView<TreeState<number>>({
    runtimeState: engine.controller.getRuntimeState(),
    language: activeLanguage,
    sourceCodes,
    visualizationState,
  });

  // Handlers
  const handleModeChange = (newMode: TreeMode) => {
    setMode(newMode);
    if (newMode === "bst") {
      setTreeState(createSampleBSTState());
      setCurrentOperation("search");
      setCurrentParams({ target: 60 });
    } else {
      setTreeState(createSampleBinaryTreeState());
      setCurrentOperation("search");
      setCurrentParams({ target: 15 });
    }
  };

  const handleOperationChange = (op: TreeOperationType, params: Record<string, unknown>) => {
    setCurrentOperation(op);
    setCurrentParams(params);
  };

  const handleRandomTree = () => {
    if (mode === "bst") {
      // Deterministic random distinct values for BST
      const pool = [15, 25, 35, 45, 55, 65, 75, 85, 95];
      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
      const newBST = buildBSTFromValues(shuffled);
      setTreeState(newBST);
      setCurrentOperation("search");
      setCurrentParams({ target: shuffled[0] });
    } else {
      setTreeState(createSampleBinaryTreeState());
    }
  };

  const handleResetSample = () => {
    if (mode === "bst") {
      setTreeState(createSampleBSTState());
      setCurrentOperation("search");
      setCurrentParams({ target: 60 });
    } else {
      setTreeState(createSampleBinaryTreeState());
      setCurrentOperation("search");
      setCurrentParams({ target: 15 });
    }
  };

  const handleClear = () => {
    setTreeState(createEmptyTreeState());
    setCurrentOperation("clear");
    setCurrentParams({});
  };

  // State snapshot at current playback step
  const activeStepState = engine.currentStep?.state || treeState;
  const activeHighlights = engine.currentStep?.highlightedElements || [];

  return (
    <div className={cn("min-h-screen bg-background text-foreground flex flex-col", className)}>
      {/* Compact Horizontal Topic Bar */}
      <TopicBar currentSlug={mode === "bst" ? "bst" : "binary-tree"} />

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
          {/* Tree Mode Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-card/60 border border-border/50 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-foreground">
                {mode === "bst" ? "Binary Search Tree (BST)" : "General Binary Tree"} Visualizer
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                {mode === "bst" ? "Ordered" : "Hierarchical"}
              </span>
            </div>
          </div>

          {/* Operations & Interactive Toolbar */}
          <TreeOperationBar
            mode={mode}
            onModeChange={handleModeChange}
            currentOperation={currentOperation}
            onOperationChange={handleOperationChange}
            treeState={treeState}
            onRandomTree={handleRandomTree}
            onResetSample={handleResetSample}
            onClear={handleClear}
          />

          {/* Graphical Tree Canvas */}
          <TreeCanvas
            treeState={activeStepState}
            highlightedElements={activeHighlights}
            currentOperation={currentOperation}
          />

          {/* Progressive Traversal Output Banner */}
          <TreeTraversalOutput
            treeState={activeStepState}
            currentOperation={currentOperation}
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
              variables={executionView.variables}
              variableDiffs={executionView.variableDiffs}
              title="Runtime Variables"
            />
          </div>

          {/* Live Complexity & Invariants Card */}
          <TreeComplexityCard treeState={activeStepState} mode={mode} />
        </section>
      </main>
    </div>
  );
}

export function BinaryTreeVisualizerShell(props: Omit<TreeVisualizerShellProps, "initialMode">) {
  return <TreeVisualizerShell {...props} initialMode="binary-tree" />;
}

export function BstVisualizerShell(props: Omit<TreeVisualizerShellProps, "initialMode">) {
  return <TreeVisualizerShell {...props} initialMode="bst" />;
}
