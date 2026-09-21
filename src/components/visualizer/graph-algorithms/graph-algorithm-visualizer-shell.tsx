"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GraphState } from "@/core/graph/types";
import {
  createSampleUndirectedWeightedGraph,
  createSampleDirectedGraph,
  generateRandomGraph,
} from "@/core/graph/sample-graphs";
import type { GraphAlgorithmType, GraphAlgorithmExecutionState } from "@/core/graph-algorithms/types";
import {
  generateBfsAlgorithmTrace,
  generateDfsAlgorithmTrace,
  generateDijkstraAlgorithmTrace,
  generateBellmanFordAlgorithmTrace,
  generatePrimAlgorithmTrace,
  generateKruskalAlgorithmTrace,
  generateTopologicalSortAlgorithmTrace,
} from "@/core/graph-algorithms/trace-generators";
import { GRAPH_ALGORITHM_SNIPPETS } from "@/core/graph-algorithms/code-snippets";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import type { SupportedLanguage } from "@/core/synchronization/types";
import { GraphCanvas } from "@/components/visualizer/graph/graph-canvas";
import { VisuAlgoShell, type VisuAlgoAction } from "@/components/visualizer/visualgo-shell";

interface Props {
  initialAlgorithm?: GraphAlgorithmType;
  className?: string;
}

const ALGORITHMS: { id: GraphAlgorithmType; name: string; complexity: string }[] = [
  { id: "bfs", name: "BFS", complexity: "O(V + E)" },
  { id: "dfs", name: "DFS", complexity: "O(V + E)" },
  { id: "dijkstra", name: "Dijkstra", complexity: "O((V + E) log V)" },
  { id: "bellman-ford", name: "Bellman-Ford", complexity: "O(V × E)" },
  { id: "prim", name: "Prim's MST", complexity: "O(E log V)" },
  { id: "kruskal", name: "Kruskal's MST", complexity: "O(E log E)" },
  { id: "topological-sort", name: "Topological Sort", complexity: "O(V + E)" },
];

export function GraphAlgorithmVisualizerShell({
  initialAlgorithm = "bfs",
  className,
}: Props) {
  const [selectedAlgorithm, setSelectedAlgorithm] = React.useState<GraphAlgorithmType>(initialAlgorithm);
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");

  // Dynamic graph topology depending on algorithm
  const [graphState, setGraphState] = React.useState<GraphState>(() => {
    if (initialAlgorithm === "topological-sort") {
      return createSampleDirectedGraph();
    }
    return createSampleUndirectedWeightedGraph();
  });

  const [startNodeId, setStartNodeId] = React.useState<string>(() => {
    return graphState.nodes[0]?.id ?? "";
  });

  // Switch to DAG preset when Topological Sort is selected
  React.useEffect(() => {
    if (selectedAlgorithm === "topological-sort") {
      const dag = createSampleDirectedGraph();
      setGraphState(dag);
      if (dag.nodes[0]) setStartNodeId(dag.nodes[0].id);
    } else {
      const graph = createSampleUndirectedWeightedGraph();
      setGraphState(graph);
      if (graph.nodes[0]) setStartNodeId(graph.nodes[0].id);
    }
  }, [selectedAlgorithm]);

  // Deterministic trace builder
  const createTrace = React.useCallback(
    (algo: GraphAlgorithmType, graph: GraphState, startId: string) => {
      switch (algo) {
        case "bfs":
          return generateBfsAlgorithmTrace(graph, startId);
        case "dfs":
          return generateDfsAlgorithmTrace(graph, startId);
        case "dijkstra":
          return generateDijkstraAlgorithmTrace(graph, startId);
        case "bellman-ford":
          return generateBellmanFordAlgorithmTrace(graph, startId);
        case "prim":
          return generatePrimAlgorithmTrace(graph, startId);
        case "kruskal":
          return generateKruskalAlgorithmTrace(graph);
        case "topological-sort":
          return generateTopologicalSortAlgorithmTrace(graph);
      }
    },
    []
  );

  const [trace, setTrace] = React.useState(() =>
    createTrace(selectedAlgorithm, graphState, startNodeId)
  );

  const runAlgorithm = React.useCallback(
    (algo: GraphAlgorithmType = selectedAlgorithm, startId: string = startNodeId) => {
      const newTrace = createTrace(algo, graphState, startId);
      setTrace(newTrace);
    },
    [createTrace, selectedAlgorithm, graphState, startNodeId]
  );

  const engine = useExecutionEngine<GraphAlgorithmExecutionState>(trace, { initialSpeed: 1 });
  const currentStep = engine.currentStep;
  const runtimeState = currentStep?.state;

  // Highlight elements
  const highlightedElements = React.useMemo(() => {
    const highlights: string[] = [];
    if (!runtimeState) return highlights;

    if (runtimeState.currentVertexId) highlights.push(runtimeState.currentVertexId);
    if (runtimeState.activeEdgeId) highlights.push(runtimeState.activeEdgeId);
    if (runtimeState.treeEdgeIds) highlights.push(...runtimeState.treeEdgeIds);
    if (runtimeState.visitedVertexIds) highlights.push(...runtimeState.visitedVertexIds);
    if (currentStep?.highlightedElements) highlights.push(...currentStep.highlightedElements);

    return Array.from(new Set(highlights));
  }, [runtimeState, currentStep]);

  // Source code
  const rawSourceCode =
    GRAPH_ALGORITHM_SNIPPETS[selectedAlgorithm]?.[activeLanguage] ??
    GRAPH_ALGORITHM_SNIPPETS.bfs.python;

  const activeLine = currentStep?.codeLine ?? 1;

  const currentAlgoMeta = ALGORITHMS.find((a) => a.id === selectedAlgorithm) || ALGORITHMS[0];

  const actions: VisuAlgoAction[] = [
    {
      id: "run",
      label: selectedAlgorithm === "kruskal" || selectedAlgorithm === "topological-sort" ? "Run" : "Execute",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">
            {selectedAlgorithm === "kruskal" || selectedAlgorithm === "topological-sort"
              ? "Start Execution"
              : "Select Start Vertex (s)"}
          </div>
          {selectedAlgorithm !== "kruskal" && selectedAlgorithm !== "topological-sort" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Source:</span>
              <select
                value={startNodeId}
                onChange={(e) => {
                  setStartNodeId(e.target.value);
                  runAlgorithm(selectedAlgorithm, e.target.value);
                }}
                className="px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono"
              >
                {graphState.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    Node {n.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={() => {
              runAlgorithm(selectedAlgorithm, startNodeId);
              setTimeout(() => engine.play(), 50);
            }}
            className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors w-full"
          >
            Start {currentAlgoMeta.name}
          </button>
        </div>
      ),
    },
    {
      id: "randomize",
      label: "Random Graph",
      onClick: () => {
        const rand = generateRandomGraph({
          nodeCount: 5,
          directed: selectedAlgorithm === "topological-sort",
          weighted: true,
        });
        setGraphState(rand);
        if (rand.nodes[0]) {
          setStartNodeId(rand.nodes[0].id);
          const newTrace = createTrace(selectedAlgorithm, rand, rand.nodes[0].id);
          setTrace(newTrace);
        }
      },
    },
    {
      id: "reset",
      label: "Reset Sample",
      onClick: () => {
        const sample =
          selectedAlgorithm === "topological-sort"
            ? createSampleDirectedGraph()
            : createSampleUndirectedWeightedGraph();
        setGraphState(sample);
        if (sample.nodes[0]) {
          setStartNodeId(sample.nodes[0].id);
          const newTrace = createTrace(selectedAlgorithm, sample, sample.nodes[0].id);
          setTrace(newTrace);
        }
      },
    },
  ];

  return (
    <VisuAlgoShell
      title="Graph Algorithms Visualizer"
      category="Graph Theory"
      subVariants={ALGORITHMS.map((algo) => ({
        id: algo.id,
        label: algo.name,
        active: selectedAlgorithm === algo.id,
      }))}
      activeSubVariant={selectedAlgorithm}
      onSelectSubVariant={(id) => {
        const algo = id as GraphAlgorithmType;
        setSelectedAlgorithm(algo);
        const nextGraph =
          algo === "topological-sort"
            ? createSampleDirectedGraph()
            : createSampleUndirectedWeightedGraph();
        setGraphState(nextGraph);
        const sId = nextGraph.nodes[0]?.id || "";
        setStartNodeId(sId);
        setTrace(createTrace(algo, nextGraph, sId));
      }}
      actions={actions}
      statusBadge={
        engine.isPlaying
          ? "Running"
          : selectedAlgorithm.toUpperCase()
      }
      statusExplanation={
        currentStep?.explanation ||
        runtimeState?.phaseDescription ||
        `Select an action from the bottom-left dock to run ${currentAlgoMeta.name}.`
      }
      complexityBadge={currentAlgoMeta.complexity}
      code={rawSourceCode}
      activeCodeLines={[activeLine]}
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
          graphState={graphState}
          highlightedElementIds={highlightedElements}
          className="w-full h-full"
        />

        {/* Algorithm Live Metrics Overlay at Top */}
        <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2 pointer-events-none max-w-md justify-end">
          {runtimeState?.visitedVertexIds && runtimeState.visitedVertexIds.length > 0 && (
            <div className="bg-card/90 backdrop-blur-md border border-border/80 px-3 py-1.5 rounded-lg shadow-sm text-xs flex items-center gap-2">
              <span className="text-muted-foreground font-medium">Visited:</span>
              <span className="font-mono font-bold text-primary">
                {runtimeState.visitedVertexIds
                  .map((id) => graphState.nodes.find((n) => n.id === id)?.label || id)
                  .join(" → ")}
              </span>
            </div>
          )}

          {runtimeState?.treeEdgeIds && runtimeState.treeEdgeIds.length > 0 && (
            <div className="bg-card/90 backdrop-blur-md border border-border/80 px-3 py-1.5 rounded-lg shadow-sm text-xs flex items-center gap-2">
              <span className="text-muted-foreground font-medium">Tree Edges:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {runtimeState.treeEdgeIds.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </VisuAlgoShell>
  );
}
