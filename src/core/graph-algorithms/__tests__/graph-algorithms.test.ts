import { describe, it, expect } from "vitest";
import type { GraphState } from "@/core/graph/types";
import {
  generateBfsAlgorithmTrace,
  generateDfsAlgorithmTrace,
  generateDijkstraAlgorithmTrace,
  generateBellmanFordAlgorithmTrace,
  generatePrimAlgorithmTrace,
  generateKruskalAlgorithmTrace,
  generateTopologicalSortAlgorithmTrace,
} from "../trace-generators";
import { UnionFind } from "../union-find";

const testGraph: GraphState = {
  nodes: [
    { id: "node-0", label: "A", x: 100, y: 100 },
    { id: "node-1", label: "B", x: 250, y: 100 },
    { id: "node-2", label: "C", x: 250, y: 250 },
    { id: "node-3", label: "D", x: 100, y: 250 },
  ],
  edges: [
    { id: "edge-0-1", sourceId: "node-0", targetId: "node-1", directed: false, weight: 4 },
    { id: "edge-1-2", sourceId: "node-1", targetId: "node-2", directed: false, weight: 2 },
    { id: "edge-2-3", sourceId: "node-2", targetId: "node-3", directed: false, weight: 3 },
    { id: "edge-3-0", sourceId: "node-3", targetId: "node-0", directed: false, weight: 1 },
    { id: "edge-0-2", sourceId: "node-0", targetId: "node-2", directed: false, weight: 5 },
  ],
  directed: false,
  weighted: true,
};

const dagGraph: GraphState = {
  nodes: [
    { id: "v-0", label: "A", x: 50, y: 100 },
    { id: "v-1", label: "B", x: 200, y: 50 },
    { id: "v-2", label: "C", x: 200, y: 150 },
    { id: "v-3", label: "D", x: 350, y: 100 },
  ],
  edges: [
    { id: "e-0-1", sourceId: "v-0", targetId: "v-1", directed: true },
    { id: "e-0-2", sourceId: "v-0", targetId: "v-2", directed: true },
    { id: "e-1-3", sourceId: "v-1", targetId: "v-3", directed: true },
    { id: "e-2-3", sourceId: "v-2", targetId: "v-3", directed: true },
  ],
  directed: true,
  weighted: false,
};

describe("UnionFind", () => {
  it("unites disjoint sets and detects cycles", () => {
    const uf = new UnionFind(["A", "B", "C", "D"]);
    expect(uf.find("A")).toBe("A");
    expect(uf.find("B")).toBe("B");

    expect(uf.union("A", "B")).toBe(true);
    expect(uf.find("A")).toBe(uf.find("B"));

    expect(uf.union("B", "C")).toBe(true);
    expect(uf.find("A")).toBe(uf.find("C"));

    // A and C are already in same set -> cycle
    expect(uf.union("A", "C")).toBe(false);
  });
});

describe("Graph Traversal Traces", () => {
  it("generates deterministic BFS trace", () => {
    const trace = generateBfsAlgorithmTrace(testGraph, "node-0");
    expect(trace.steps.length).toBeGreaterThan(3);
    const lastStep = trace.steps[trace.steps.length - 1];
    expect(lastStep.state.visitedVertexIds).toHaveLength(4);
    expect(lastStep.state.phaseDescription).toContain("BFS complete");
  });

  it("generates deterministic DFS trace", () => {
    const trace = generateDfsAlgorithmTrace(testGraph, "node-0");
    expect(trace.steps.length).toBeGreaterThan(3);
    const lastStep = trace.steps[trace.steps.length - 1];
    expect(lastStep.state.visitedVertexIds).toHaveLength(4);
    expect(lastStep.state.phaseDescription).toContain("DFS traversal complete");
  });
});

describe("Shortest Path Traces", () => {
  it("generates Dijkstra trace with accurate minimal distances", () => {
    const trace = generateDijkstraAlgorithmTrace(testGraph, "node-0");
    expect(trace.steps.length).toBeGreaterThan(5);
    const lastStep = trace.steps[trace.steps.length - 1];
    expect(lastStep.state.distances).toBeDefined();
    // Path to node-3 is 1 (direct), to node-2 is node-3 + 3 = 4 (or node-0 -> node-2 is 5)
    expect(lastStep.state.distances!["node-0"]).toBe(0);
    expect(lastStep.state.distances!["node-3"]).toBe(1);
    expect(lastStep.state.distances!["node-2"]).toBe(4);
  });

  it("generates Bellman-Ford trace with cycle detection", () => {
    const trace = generateBellmanFordAlgorithmTrace(testGraph, "node-0");
    expect(trace.steps.length).toBeGreaterThan(2);
    const lastStep = trace.steps[trace.steps.length - 1];
    expect(lastStep.state.cycleDetected).toBe(false);
    expect(lastStep.state.distances!["node-0"]).toBe(0);
  });
});

describe("Minimum Spanning Tree Traces", () => {
  it("generates Prim's algorithm trace with correct spanning tree count", () => {
    const trace = generatePrimAlgorithmTrace(testGraph, "node-0");
    expect(trace.steps.length).toBeGreaterThan(4);
    const lastStep = trace.steps[trace.steps.length - 1];
    expect(lastStep.state.treeEdgeIds).toHaveLength(3); // V - 1 = 3 edges for 4 vertices
  });

  it("generates Kruskal's algorithm trace using Union-Find", () => {
    const trace = generateKruskalAlgorithmTrace(testGraph);
    expect(trace.steps.length).toBeGreaterThan(4);
    const lastStep = trace.steps[trace.steps.length - 1];
    expect(lastStep.state.treeEdgeIds).toHaveLength(3);
  });
});

describe("Topological Sort Trace", () => {
  it("generates valid topological order on DAG", () => {
    const trace = generateTopologicalSortAlgorithmTrace(dagGraph);
    expect(trace.steps.length).toBeGreaterThan(3);
    const lastStep = trace.steps[trace.steps.length - 1];
    expect(lastStep.state.cycleDetected).toBe(false);
    expect(lastStep.state.topologicalOrder).toHaveLength(4);
    // A must come first, D must come last
    expect(lastStep.state.topologicalOrder![0]).toBe("A");
    expect(lastStep.state.topologicalOrder![3]).toBe("D");
  });
});
