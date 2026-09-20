"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GraphState, GraphType, EdgeType, GraphOperationType } from "@/core/graph/types";
import {
  createSampleUndirectedWeightedGraph,
  createSampleUndirectedGraph,
  createSampleDirectedGraph,
  generateRandomGraph,
  createEmptyGraphState,
} from "@/core/graph/sample-graphs";
import {
  generateAddNodeTrace,
  generateAddEdgeTrace,
  generateDeleteNodeTrace,
  generateDeleteEdgeTrace,
  generateClearGraphTrace,
  generateSelectNodeTrace,
} from "@/core/graph/trace-generators";
import { GraphAdapter } from "@/core/graph/graph-adapter";
import { getGraphSourceCodes } from "@/core/graph/code-snippets";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import { useVisualizationState } from "@/core/visualization/hooks/use-visualization-state";
import { useExecutionView } from "@/core/synchronization/hooks/use-execution-view";
import type { SupportedLanguage } from "@/core/synchronization/types";
import type { PlaybackSpeed as TimelinePlaybackSpeed } from "@/core/engine/types";
import type { PlaybackSpeed as ExecutionPlaybackSpeed } from "@/core/execution/types";

import { TopicBar } from "@/components/visualizer/topic-bar";
import { GraphCanvas } from "./graph-canvas";
import { GraphOperationBar } from "./graph-operation-bar";
import {
  GraphRepresentationView,
  type RepresentationMode,
} from "./graph-representation-view";
import { GraphStatsCard } from "./graph-stats-card";
import { GraphComplexityCard } from "./graph-complexity-card";

import { TimelineControls } from "@/components/ui/timeline-controls";
import { CodeViewer } from "@/components/code/code-viewer";
import { VariablesPanel } from "@/components/execution/variables-panel";
import { ExplanationPanel } from "@/components/execution/explanation-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaySquare, Code as CodeIcon, Network } from "lucide-react";

const defaultGraphAdapter = new GraphAdapter();

export interface GraphVisualizerShellProps {
  initialGraphState?: GraphState;
  className?: string;
}

export function GraphVisualizerShell({
  initialGraphState,
  className,
}: GraphVisualizerShellProps) {
  // 1. Authoritative Graph State
  const [graphState, setGraphState] = React.useState<GraphState>(() => {
    if (initialGraphState) return initialGraphState;
    return createSampleUndirectedWeightedGraph();
  });

  // Presentation & UI Configuration states
  const [representationMode, setRepresentationMode] =
    React.useState<RepresentationMode>("visualization");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");
  const [mobileTab, setMobileTab] = React.useState<"visualizer" | "code">("visualizer");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Active operation state for code snippets
  const [currentOperation, setCurrentOperation] = React.useState<GraphOperationType>("add-node");

  // 2. Deterministic Trace Generation (initial idle trace)
  const [trace, setTrace] = React.useState(() => {
    return generateAddNodeTrace(createSampleUndirectedWeightedGraph(), "E");
  });

  // 3. Execution Engine
  const engine = useExecutionEngine<GraphState>(trace, { initialSpeed: 1 });

  // 4. Visualization State Adapter
  const { visualizationState, resolvedHighlights } = useVisualizationState<GraphState>({
    adapter: defaultGraphAdapter,
    runtimeState: engine.controller.getRuntimeState(),
  });

  // 5. Multi-language code snippets
  const sourceCodes = React.useMemo(() => {
    return getGraphSourceCodes(currentOperation);
  }, [currentOperation]);

  // 6. Synchronized Execution View Context
  const executionView = useExecutionView<GraphState>({
    runtimeState: engine.controller.getRuntimeState(),
    language: activeLanguage,
    sourceCodes,
    visualizationState,
  });

  // Derive current step state or fallback to base graph state
  const currentStep = engine.currentStep;
  const activeGraphState = currentStep ? currentStep.state : graphState;

  // Clear transient error messages
  const clearError = () => setErrorMessage(null);

  // Handlers for Graph Mutations
  const handleAddNode = (label: string) => {
    clearError();
    setCurrentOperation("add-node");

    const newTrace = generateAddNodeTrace(activeGraphState, label);
    const finalStep = newTrace.steps[newTrace.steps.length - 1];

    if (finalStep && finalStep.operation !== "compare") {
      setGraphState(finalStep.state);
    } else {
      setErrorMessage(`Vertex "${label}" already exists in the graph.`);
    }

    setTrace(newTrace);
    engine.reset();
  };

  const handleAddEdge = (sourceLabel: string, targetLabel: string, weight?: number) => {
    clearError();
    setCurrentOperation("add-edge");

    const newTrace = generateAddEdgeTrace(activeGraphState, sourceLabel, targetLabel, weight);
    const finalStep = newTrace.steps[newTrace.steps.length - 1];

    if (finalStep && finalStep.operation === "insert") {
      setGraphState(finalStep.state);
    } else {
      setErrorMessage(`Cannot add edge: edge already exists or endpoints are invalid.`);
    }

    setTrace(newTrace);
    engine.reset();
  };

  const handleDeleteNode = (label: string) => {
    clearError();
    setCurrentOperation("delete-node");

    const newTrace = generateDeleteNodeTrace(activeGraphState, label);
    const finalStep = newTrace.steps[newTrace.steps.length - 1];

    if (finalStep && finalStep.operation === "delete") {
      setGraphState(finalStep.state);
    } else {
      setErrorMessage(`Vertex "${label}" could not be deleted.`);
    }

    setTrace(newTrace);
    engine.reset();
  };

  const handleDeleteEdge = (sourceLabel: string, targetLabel: string) => {
    clearError();
    setCurrentOperation("delete-edge");

    const newTrace = generateDeleteEdgeTrace(activeGraphState, sourceLabel, targetLabel);
    const finalStep = newTrace.steps[newTrace.steps.length - 1];

    if (finalStep && finalStep.operation === "delete") {
      setGraphState(finalStep.state);
    } else {
      setErrorMessage(`Edge could not be deleted.`);
    }

    setTrace(newTrace);
    engine.reset();
  };

  const handleClearGraph = () => {
    clearError();
    setCurrentOperation("clear");

    const newTrace = generateClearGraphTrace(activeGraphState);
    const finalStep = newTrace.steps[newTrace.steps.length - 1];

    if (finalStep) {
      setGraphState(finalStep.state);
    }

    setTrace(newTrace);
    engine.reset();
  };

  // Switch Graph Type (Undirected / Directed)
  const handleGraphTypeChange = (newType: GraphType) => {
    clearError();
    const isDirected = newType === "directed";
    const nextState: GraphState = isDirected
      ? createSampleDirectedGraph()
      : createSampleUndirectedWeightedGraph();

    setGraphState(nextState);
    setTrace(generateAddNodeTrace(nextState, "E"));
    engine.reset();
  };

  // Switch Edge Type (Unweighted / Weighted)
  const handleEdgeTypeChange = (newType: EdgeType) => {
    clearError();
    const isWeighted = newType === "weighted";
    const updatedEdges = activeGraphState.edges.map((e, idx) => ({
      ...e,
      weight: isWeighted ? (e.weight ?? (idx + 1) * 2 + 1) : undefined,
    }));

    const nextState: GraphState = {
      ...activeGraphState,
      weighted: isWeighted,
      edges: updatedEdges,
    };

    setGraphState(nextState);
    setTrace(generateAddNodeTrace(nextState, "E"));
    engine.reset();
  };

  // Presets Loader
  const handleLoadPreset = (preset: "undirected-weighted" | "directed-dag" | "random") => {
    clearError();
    let nextState: GraphState;

    if (preset === "undirected-weighted") {
      nextState = createSampleUndirectedWeightedGraph();
    } else if (preset === "directed-dag") {
      nextState = createSampleDirectedGraph();
    } else {
      nextState = generateRandomGraph({
        nodeCount: 5,
        directed: activeGraphState.directed,
        weighted: activeGraphState.weighted,
      });
    }

    setGraphState(nextState);
    setTrace(generateAddNodeTrace(nextState, "E"));
    engine.reset();
  };

  // Node Drag Position Update (Presentation Only - No Topology Corruption)
  const handleNodePositionChange = (nodeId: string, x: number, y: number) => {
    setGraphState((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
    }));
  };

  // Selection handlers
  const handleSelectNode = (nodeId: string | null) => {
    setGraphState((prev) => ({
      ...prev,
      selectedNodeId: nodeId,
      selectedEdgeId: null,
    }));
    if (nodeId) {
      const selectTrace = generateSelectNodeTrace(activeGraphState, nodeId);
      if (selectTrace.steps.length > 0) {
        setTrace(selectTrace);
        engine.reset();
      }
    }
  };

  const handleSelectEdge = (edgeId: string | null) => {
    setGraphState((prev) => ({
      ...prev,
      selectedEdgeId: edgeId,
      selectedNodeId: null,
    }));
  };

  return (
    <div className={cn("flex flex-col min-h-screen bg-surface-100 dark:bg-surface-950", className)}>
      {/* Compact Horizontal Topic Bar across all Visualizers */}
      <TopicBar currentSlug="graph" />

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-surface-900 p-2">
        <Tabs value={mobileTab} onValueChange={(val) => setMobileTab(val as "visualizer" | "code")}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="visualizer" className="gap-1 text-xs">
              <PlaySquare className="h-3 w-3" />
              <span>Canvas & Controls</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-1 text-xs">
              <CodeIcon className="h-3 w-3" />
              <span>Code & State</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Workspace Layout */}
      <main className="flex-1 p-3 md:p-5 max-w-7xl w-full mx-auto flex flex-col gap-4">
        {/* Compact Educational Introduction Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Network className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Graph Visualizer
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                Non-Linear Network
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A graph consists of <strong className="text-slate-700 dark:text-slate-200">vertices</strong> (points/nodes) connected by <strong className="text-slate-700 dark:text-slate-200">edges</strong> (connections between vertices).
            </p>
          </div>

          {/* Compact Graph Type & Edge Type Toggles */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {/* Graph Type Selector */}
            <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800/60 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleGraphTypeChange("undirected")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                  !activeGraphState.directed
                    ? "bg-white dark:bg-surface-900 text-brand-600 dark:text-brand-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Undirected
              </button>
              <button
                type="button"
                onClick={() => handleGraphTypeChange("directed")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                  activeGraphState.directed
                    ? "bg-white dark:bg-surface-900 text-brand-600 dark:text-brand-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Directed
              </button>
            </div>

            {/* Edge Type Selector */}
            <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800/60 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleEdgeTypeChange("unweighted")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                  !activeGraphState.weighted
                    ? "bg-white dark:bg-surface-900 text-purple-600 dark:text-purple-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Unweighted
              </button>
              <button
                type="button"
                onClick={() => handleEdgeTypeChange("weighted")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                  activeGraphState.weighted
                    ? "bg-white dark:bg-surface-900 text-purple-600 dark:text-purple-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Weighted
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Wide Workspace Layout (NO SIDEBAR) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (Canvas, Representations, Operation Bar, Playback) (7 cols desktop, 8 xl) */}
          <div
            className={cn(
              "lg:col-span-7 xl:col-span-8 flex flex-col gap-4",
              mobileTab !== "visualizer" && "hidden lg:flex"
            )}
          >
            {/* Visualizer Canvas & Representations */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-surface-900 overflow-hidden flex flex-col">
              <div className="p-3">
                <GraphRepresentationView
                  graphState={activeGraphState}
                  mode={representationMode}
                  onModeChange={setRepresentationMode}
                >
                  <GraphCanvas
                    graphState={activeGraphState}
                    highlightedElementIds={engine.currentStep?.highlightedElements}
                    selectedNodeId={activeGraphState.selectedNodeId}
                    selectedEdgeId={activeGraphState.selectedEdgeId}
                    onSelectNode={handleSelectNode}
                    onSelectEdge={handleSelectEdge}
                    onNodePositionChange={handleNodePositionChange}
                  />
                </GraphRepresentationView>
              </div>

              {/* Timeline Controls */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-surface-50 dark:bg-surface-950/40">
                <TimelineControls
                  isPlaying={engine.isPlaying}
                  currentStep={engine.currentStepIndex}
                  totalSteps={engine.totalSteps}
                  speed={engine.speed as TimelinePlaybackSpeed}
                  onPlay={engine.play}
                  onPause={engine.pause}
                  onStepForward={engine.next}
                  onStepBackward={engine.previous}
                  onGoToStart={engine.jumpToStart}
                  onGoToEnd={engine.jumpToEnd}
                  onSeek={engine.jumpTo}
                  onSpeedChange={(spd) => engine.setSpeed(spd as ExecutionPlaybackSpeed)}
                />
              </div>
            </div>

            {/* Graph Operations Toolbar */}
            <GraphOperationBar
              graphState={activeGraphState}
              onAddNode={handleAddNode}
              onAddEdge={handleAddEdge}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
              onClearGraph={handleClearGraph}
              onLoadPreset={handleLoadPreset}
              errorMessage={errorMessage}
            />
          </div>

          {/* Right Column (Code, Variables, Metrics, Explanations, Complexity) (5 cols desktop, 4 xl) */}
          <div
            className={cn(
              "lg:col-span-5 xl:col-span-4 flex flex-col gap-4",
              mobileTab !== "code" && "hidden lg:flex"
            )}
          >
            {/* Explanation Panel */}
            <ExplanationPanel
              explanation={
                currentStep?.explanation ||
                `Graph ready with ${activeGraphState.nodes.length} vertices and ${activeGraphState.edges.length} edges.`
              }
              title={currentStep?.operation || "Graph State"}
              codeLine={currentStep?.codeLine}
              stepIndex={engine.currentStepIndex}
              totalSteps={engine.totalSteps}
            />

            {/* Runtime Scope Variables */}
            <VariablesPanel
              variables={
                currentStep?.variables || {
                  vertices: activeGraphState.nodes.length,
                  edges: activeGraphState.edges.length,
                  directed: activeGraphState.directed,
                  weighted: activeGraphState.weighted,
                }
              }
              title="Execution Scope Variables"
            />

            {/* Graph Statistics & Degrees Inspector */}
            <GraphStatsCard graphState={activeGraphState} />

            {/* Synchronized Code Viewer */}
            <CodeViewer
              sourceCode={executionView.sourceCode}
              activeLines={executionView.activeCodeLines}
              primaryLine={executionView.primaryCodeLine}
              language={activeLanguage}
              onLanguageChange={setActiveLanguage}
              availableLanguages={["python", "typescript", "javascript", "java", "cpp"]}
              title={`Graph Operation Code (${currentOperation})`}
            />

            {/* Graph Complexity Reference */}
            <GraphComplexityCard />
          </div>
        </div>
      </main>
    </div>
  );
}
