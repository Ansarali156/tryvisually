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
} from "@/core/graph/trace-generators";
import { GraphAdapter } from "@/core/graph/graph-adapter";
import { getGraphSourceCodes } from "@/core/graph/code-snippets";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import { useVisualizationState } from "@/core/visualization/hooks/use-visualization-state";
import { useExecutionView } from "@/core/synchronization/hooks/use-execution-view";
import type { SupportedLanguage } from "@/core/synchronization/types";
import { GraphCanvas } from "./graph-canvas";
import { VisuAlgoShell, type VisuAlgoAction } from "@/components/visualizer/visualgo-shell";

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

  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");
  const [currentOperation, setCurrentOperation] = React.useState<GraphOperationType>("add-node");

  // Inputs
  const [nodeLabel, setNodeLabel] = React.useState("F");
  const [edgeSource, setEdgeSource] = React.useState("A");
  const [edgeTarget, setEdgeTarget] = React.useState("D");
  const [edgeWeight, setEdgeWeight] = React.useState("4");
  const [delNodeLabel, setDelNodeLabel] = React.useState("E");

  // 2. Deterministic Trace Generation
  const [trace, setTrace] = React.useState(() => {
    return generateAddNodeTrace(createSampleUndirectedWeightedGraph(), "F");
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

  const currentStep = engine.currentStep;
  const activeGraphState = currentStep ? currentStep.state : graphState;

  const handleAddNode = (label: string) => {
    setCurrentOperation("add-node");
    const newTrace = generateAddNodeTrace(activeGraphState, label);
    const finalStep = newTrace.steps[newTrace.steps.length - 1];
    if (finalStep && finalStep.operation !== "compare") {
      setGraphState(finalStep.state);
    }
    setTrace(newTrace);
    engine.reset();
    setTimeout(() => engine.play(), 50);
  };

  const handleAddEdge = (sourceLabel: string, targetLabel: string, weight?: number) => {
    setCurrentOperation("add-edge");
    const newTrace = generateAddEdgeTrace(activeGraphState, sourceLabel, targetLabel, weight);
    const finalStep = newTrace.steps[newTrace.steps.length - 1];
    if (finalStep && finalStep.operation === "insert") {
      setGraphState(finalStep.state);
    }
    setTrace(newTrace);
    engine.reset();
    setTimeout(() => engine.play(), 50);
  };

  const handleDeleteNode = (label: string) => {
    setCurrentOperation("delete-node");
    const newTrace = generateDeleteNodeTrace(activeGraphState, label);
    const finalStep = newTrace.steps[newTrace.steps.length - 1];
    if (finalStep && finalStep.operation === "delete") {
      setGraphState(finalStep.state);
    }
    setTrace(newTrace);
    engine.reset();
    setTimeout(() => engine.play(), 50);
  };

  const actions: VisuAlgoAction[] = [
    {
      id: "add-vertex",
      label: "Add Vertex",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Vertex Label</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nodeLabel}
              maxLength={3}
              onChange={(e) => setNodeLabel(e.target.value.toUpperCase())}
              placeholder="e.g. E"
              className="w-16 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
            <button
              onClick={() => {
                if (nodeLabel.trim()) handleAddNode(nodeLabel.trim());
              }}
              className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Go
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "add-edge",
      label: "Add Edge",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Connect Vertices (u, v)</div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="u"
              value={edgeSource}
              maxLength={2}
              onChange={(e) => setEdgeSource(e.target.value.toUpperCase())}
              className="w-10 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono text-center"
            />
            <span className="text-xs text-muted-foreground">→</span>
            <input
              type="text"
              placeholder="v"
              value={edgeTarget}
              maxLength={2}
              onChange={(e) => setEdgeTarget(e.target.value.toUpperCase())}
              className="w-10 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono text-center"
            />
            {graphState.weighted && (
              <input
                type="number"
                placeholder="w"
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(e.target.value)}
                className="w-12 px-1.5 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
              />
            )}
            <button
              onClick={() => {
                if (edgeSource.trim() && edgeTarget.trim()) {
                  handleAddEdge(
                    edgeSource.trim(),
                    edgeTarget.trim(),
                    graphState.weighted ? parseInt(edgeWeight, 10) || 1 : undefined
                  );
                }
              }}
              className="px-2.5 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors ml-auto"
            >
              Go
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "delete-vertex",
      label: "Delete Vertex",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Delete Vertex Label</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={delNodeLabel}
              maxLength={3}
              onChange={(e) => setDelNodeLabel(e.target.value.toUpperCase())}
              className="w-16 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
            />
            <button
              onClick={() => {
                if (delNodeLabel.trim()) handleDeleteNode(delNodeLabel.trim());
              }}
              className="px-3 py-1 text-xs font-bold bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
            >
              Go
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "randomize",
      label: "Randomize",
      onClick: () => {
        const rand = generateRandomGraph({
          nodeCount: 5,
          directed: graphState.directed,
          weighted: graphState.weighted,
        });
        setGraphState(rand);
        setTrace(generateAddNodeTrace(rand, "G"));
        engine.reset();
      },
    },
    {
      id: "reset",
      label: "Reset Sample",
      onClick: () => {
        const sample = createSampleUndirectedWeightedGraph();
        setGraphState(sample);
        setTrace(generateAddNodeTrace(sample, "F"));
        engine.reset();
      },
    },
  ];

  return (
    <VisuAlgoShell
      title="Graph Data Structure"
      category="Graph Theory"
      subVariants={[
        { id: "undirected-weighted", label: "Undirected Weighted", active: !graphState.directed && graphState.weighted },
        { id: "undirected-unweighted", label: "Undirected Unweighted", active: !graphState.directed && !graphState.weighted },
        { id: "directed-weighted", label: "Directed Weighted", active: graphState.directed && graphState.weighted },
        { id: "directed-unweighted", label: "Directed Unweighted", active: graphState.directed && !graphState.weighted },
      ]}
      activeSubVariant={
        graphState.directed
          ? graphState.weighted
            ? "directed-weighted"
            : "directed-unweighted"
          : graphState.weighted
          ? "undirected-weighted"
          : "undirected-unweighted"
      }
      onSelectSubVariant={(id) => {
        let nextGraph: GraphState;
        if (id === "directed-weighted") nextGraph = createSampleDirectedGraph();
        else if (id === "directed-unweighted") {
          const g = createSampleDirectedGraph();
          nextGraph = { ...g, weighted: false, edges: g.edges.map((e) => ({ ...e, weight: undefined })) };
        } else if (id === "undirected-unweighted") nextGraph = createSampleUndirectedGraph();
        else nextGraph = createSampleUndirectedWeightedGraph();

        setGraphState(nextGraph);
        setTrace(generateAddNodeTrace(nextGraph, "F"));
        engine.reset();
      }}
      actions={actions}
      statusBadge={
        engine.isPlaying
          ? "Running"
          : currentOperation.toUpperCase()
      }
      statusExplanation={
        executionView.explanation ||
        "Select Add Vertex, Add Edge, or Delete Vertex from the bottom-left dock."
      }
      complexityBadge={`V: ${activeGraphState.nodes.length}, E: ${activeGraphState.edges.length}`}
      code={executionView.sourceCode}
      activeCodeLines={executionView.activeCodeLines}
      currentStep={engine.currentStepIndex}
      totalSteps={engine.totalSteps}
      isPlaying={engine.isPlaying}
      speed={engine.speed}
      onPlay={engine.play}
      onPause={engine.pause}
      onStepForward={engine.next}
      onStepBackward={engine.previous}
      onGoToStart={engine.jumpToStart}
      onGoToEnd={engine.jumpToEnd}
      onSeek={engine.jumpTo}
      onSpeedChange={(spd) => engine.setSpeed(spd)}
      className={className}
    >
      {/* Full-stage Interactive Stage */}
      <div className="w-full h-full flex flex-col items-center justify-center p-4 select-none relative overflow-hidden">
        <GraphCanvas
          graphState={activeGraphState}
          highlightedElementIds={Array.from(resolvedHighlights.keys())}
          className="w-full h-full"
        />
      </div>
    </VisuAlgoShell>
  );
}
