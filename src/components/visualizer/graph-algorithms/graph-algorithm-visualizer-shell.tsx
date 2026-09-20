"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GraphState } from "@/core/graph/types";
import {
  createSampleUndirectedWeightedGraph,
  createSampleDirectedGraph,
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
import { TopicBar } from "@/components/visualizer/topic-bar";
import { GraphCanvas } from "@/components/visualizer/graph/graph-canvas";
import { TimelineControls } from "@/components/ui/timeline-controls";
import { CodeViewer } from "@/components/code/code-viewer";
import { VariablesPanel } from "@/components/execution/variables-panel";
import { ExplanationPanel } from "@/components/execution/explanation-panel";
import { Button } from "@/components/ui/button";
import type { PlaybackSpeed } from "@/core/engine/types";
import { Play, Network } from "lucide-react";

interface Props {
  initialAlgorithm?: GraphAlgorithmType;
  className?: string;
}

const ALGORITHMS: { id: GraphAlgorithmType; name: string; category: string }[] = [
  { id: "bfs", name: "BFS (Breadth-First)", category: "Traversal" },
  { id: "dfs", name: "DFS (Depth-First)", category: "Traversal" },
  { id: "dijkstra", name: "Dijkstra's Algorithm", category: "Shortest Path" },
  { id: "bellman-ford", name: "Bellman-Ford", category: "Shortest Path" },
  { id: "prim", name: "Prim's Algorithm", category: "MST" },
  { id: "kruskal", name: "Kruskal's Algorithm", category: "MST" },
  { id: "topological-sort", name: "Topological Sort", category: "DAG" },
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

  const runAlgorithm = React.useCallback(() => {
    const newTrace = createTrace(selectedAlgorithm, graphState, startNodeId);
    setTrace(newTrace);
  }, [createTrace, selectedAlgorithm, graphState, startNodeId]);

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

  // Node label map
  const nodeMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const n of graphState.nodes) map.set(n.id, n.label);
    return map;
  }, [graphState.nodes]);

  return (
    <div className={cn("min-h-screen flex flex-col bg-background text-foreground", className)}>
      <TopicBar />

      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-[1700px] w-full mx-auto gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Network className="w-6 h-6 text-primary" />
              Graph Algorithms Visualizer
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Explore deterministic step-by-step graph traversals, shortest paths, and spanning trees.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {ALGORITHMS.map((algo) => (
              <Button
                key={algo.id}
                variant={selectedAlgorithm === algo.id ? "primary" : "outline"}
                size="sm"
                className="text-xs h-8"
                onClick={() => {
                  setSelectedAlgorithm(algo.id);
                  const newTrace = createTrace(algo.id, graphState, startNodeId);
                  setTrace(newTrace);
                }}
              >
                {algo.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Options & Execution Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            {selectedAlgorithm !== "kruskal" && selectedAlgorithm !== "topological-sort" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Start Vertex:</span>
                <select
                  value={startNodeId}
                  onChange={(e) => {
                    setStartNodeId(e.target.value);
                    const newTrace = createTrace(selectedAlgorithm, graphState, e.target.value);
                    setTrace(newTrace);
                  }}
                  className="bg-background border border-border text-foreground text-xs rounded px-2 py-1 outline-none"
                >
                  {graphState.nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      Vertex {node.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button size="sm" onClick={runAlgorithm} className="h-8 gap-1.5">
              <Play className="w-3.5 h-3.5" />
              Run Algorithm
            </Button>
          </div>

          <div className="text-xs font-medium text-muted-foreground max-w-xl truncate">
            {runtimeState?.phaseDescription || "Ready to execute"}
          </div>
        </div>

        {/* Primary Visualization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Canvas Area */}
          <div className="lg:col-span-8 flex flex-col gap-3 min-h-[520px]">
            <div className="flex-1 relative rounded-xl border border-border bg-card overflow-hidden min-h-[460px]">
              <GraphCanvas
                graphState={graphState}
                highlightedElementIds={highlightedElements}
                selectedNodeId={runtimeState?.currentVertexId}
                selectedEdgeId={runtimeState?.activeEdgeId}
                className="w-full h-full min-h-[460px]"
              />

              {/* Data Structure Live State Overlay */}
              <div className="absolute top-3 right-3 max-w-xs w-full bg-background/90 backdrop-blur border border-border rounded-lg p-2.5 shadow-sm text-xs flex flex-col gap-1.5">
                <div className="font-semibold text-foreground flex items-center justify-between border-b border-border pb-1">
                  <span>Data Structure State</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{selectedAlgorithm}</span>
                </div>

                {/* BFS Queue */}
                {selectedAlgorithm === "bfs" && (
                  <div>
                    <span className="text-muted-foreground">Queue (FIFO): </span>
                    <span className="font-mono font-medium">
                      [{runtimeState?.frontierIds.map((id) => nodeMap.get(id) ?? id).join(", ") || "empty"}]
                    </span>
                  </div>
                )}

                {/* DFS Stack */}
                {selectedAlgorithm === "dfs" && (
                  <div>
                    <span className="text-muted-foreground">Call Stack (LIFO): </span>
                    <span className="font-mono font-medium">
                      [{runtimeState?.frontierIds.map((id) => nodeMap.get(id) ?? id).join(" -> ") || "empty"}]
                    </span>
                  </div>
                )}

                {/* Shortest Path Distances */}
                {(selectedAlgorithm === "dijkstra" || selectedAlgorithm === "bellman-ford") && (
                  <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                    <span className="text-muted-foreground">Distances from Source:</span>
                    <div className="grid grid-cols-3 gap-1 font-mono text-[11px]">
                      {graphState.nodes.map((n) => {
                        const d = runtimeState?.distances?.[n.id];
                        return (
                          <div key={n.id} className="bg-muted/50 p-1 rounded text-center">
                            {n.label}: {d === Infinity || d === undefined ? "∞" : d}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* MST Edges */}
                {(selectedAlgorithm === "prim" || selectedAlgorithm === "kruskal") && (
                  <div>
                    <span className="text-muted-foreground">MST Edges ({runtimeState?.treeEdgeIds.length ?? 0}):</span>
                    <div className="font-mono text-[11px] mt-0.5 text-emerald-600 dark:text-emerald-400">
                      {runtimeState?.treeEdgeIds.length === 0
                        ? "None yet"
                        : runtimeState?.treeEdgeIds.map((eid) => {
                            const e = graphState.edges.find((x) => x.id === eid);
                            if (!e) return eid;
                            return `${nodeMap.get(e.sourceId)}-${nodeMap.get(e.targetId)}(${e.weight ?? 1})`;
                          }).join(", ")}
                    </div>
                  </div>
                )}

                {/* Topological Order */}
                {selectedAlgorithm === "topological-sort" && (
                  <div>
                    <span className="text-muted-foreground">Topological Order: </span>
                    <div className="font-mono font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {runtimeState?.topologicalOrder && runtimeState.topologicalOrder.length > 0
                        ? runtimeState.topologicalOrder.join(" → ")
                        : "Processing..."}
                    </div>
                    {runtimeState?.cycleDetected && (
                      <div className="text-destructive font-semibold mt-1">Cycle Detected in Graph!</div>
                    )}
                  </div>
                )}

                <div className="text-[11px] text-muted-foreground border-t border-border pt-1">
                  Visited ({runtimeState?.visitedVertexIds.length ?? 0}): [
                  {runtimeState?.visitedVertexIds.map((id) => nodeMap.get(id) ?? id).join(", ")}]
                </div>
              </div>
            </div>

            {/* Timeline Controls */}
            <TimelineControls
              isPlaying={engine.isPlaying}
              currentStep={engine.currentStepIndex}
              totalSteps={engine.totalSteps}
              speed={engine.speed as PlaybackSpeed}
              onPlay={engine.play}
              onPause={engine.pause}
              onStepForward={engine.next}
              onStepBackward={engine.previous}
              onGoToStart={engine.jumpToStart}
              onGoToEnd={engine.jumpToEnd}
              onSeek={engine.jumpTo}
              onSpeedChange={(spd: PlaybackSpeed) => engine.setSpeed(spd)}
            />
          </div>

          {/* Right Panel: Code & Variables */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col min-h-[300px]">
              <CodeViewer
                rawCode={rawSourceCode}
                language={activeLanguage}
                onLanguageChange={setActiveLanguage}
                activeLines={[activeLine]}
                primaryLine={activeLine}
              />
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <VariablesPanel variables={currentStep?.variables ?? {}} />
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <ExplanationPanel
                title="Current Step"
                explanation={currentStep?.explanation ?? "Click Run to begin traversal."}
                stepIndex={engine.currentStepIndex}
                totalSteps={engine.totalSteps}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
