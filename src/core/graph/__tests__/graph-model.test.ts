import { describe, it, expect } from "vitest";
import {
  validateGraph,
  checkDuplicateNodeLabel,
  checkDuplicateEdge,
  calculateNodeDegrees,
  createStableNodeId,
  createStableEdgeId,
} from "../validation";
import {
  createSampleUndirectedWeightedGraph,
  createSampleDirectedGraph,
  createEmptyGraphState,
  generateRandomGraph,
} from "../sample-graphs";
import type { GraphState } from "../types";

describe("Graph Model & Validation", () => {
  it("should validate a well-formed sample undirected weighted graph", () => {
    const graph = createSampleUndirectedWeightedGraph();
    const result = validateGraph(graph);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(graph.nodes).toHaveLength(4);
    expect(graph.edges).toHaveLength(4);
  });

  it("should validate a well-formed sample directed graph", () => {
    const graph = createSampleDirectedGraph();
    const result = validateGraph(graph);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(graph.directed).toBe(true);
  });

  it("should detect duplicate node labels", () => {
    const graph = createSampleUndirectedWeightedGraph();
    expect(checkDuplicateNodeLabel(graph.nodes, "A")).toBe(true);
    expect(checkDuplicateNodeLabel(graph.nodes, "a")).toBe(true); // Case-insensitive
    expect(checkDuplicateNodeLabel(graph.nodes, "Z")).toBe(false);
  });

  it("should detect duplicate edges in undirected graphs", () => {
    const graph = createSampleUndirectedWeightedGraph();
    // A-B exists
    expect(checkDuplicateEdge(graph.edges, "node-a", "node-b", false)).toBe(true);
    // B-A is identical in undirected graph
    expect(checkDuplicateEdge(graph.edges, "node-b", "node-a", false)).toBe(true);
    // A-D does not exist
    expect(checkDuplicateEdge(graph.edges, "node-a", "node-d", false)).toBe(false);
  });

  it("should differentiate direction in directed graphs", () => {
    const graph = createSampleDirectedGraph(); // A->B exists
    expect(checkDuplicateEdge(graph.edges, "node-a", "node-b", true)).toBe(true);
    // B->A does not exist
    expect(checkDuplicateEdge(graph.edges, "node-b", "node-a", true)).toBe(false);
  });

  it("should calculate degrees correctly for undirected graph", () => {
    const graph = createSampleUndirectedWeightedGraph();
    // Node A is connected to B and C
    const degreeA = calculateNodeDegrees(graph, "node-a");
    expect(degreeA.degree).toBe(2);
    expect(degreeA.outDegree).toBe(2);
    expect(degreeA.inDegree).toBe(0); // in undirected, incident edges counted in degree
  });

  it("should calculate in-degree and out-degree correctly for directed graph", () => {
    const graph = createSampleDirectedGraph();
    // A has outgoing edges to B and C
    const degreeA = calculateNodeDegrees(graph, "node-a");
    expect(degreeA.outDegree).toBe(2);
    expect(degreeA.inDegree).toBe(0);

    // D has incoming edges from B and C
    const degreeD = calculateNodeDegrees(graph, "node-d");
    expect(degreeD.inDegree).toBe(2);
    expect(degreeD.outDegree).toBe(0);
  });

  it("should detect invalid references and missing weights in validation", () => {
    const invalidGraph: GraphState = {
      nodes: [{ id: "node-a", label: "A", x: 0, y: 0 }],
      edges: [
        {
          id: "edge-broken",
          sourceId: "node-a",
          targetId: "node-nonexistent",
          directed: false,
        },
      ],
      directed: false,
      weighted: true, // Missing weight on edge
      selectedNodeId: null,
      selectedEdgeId: null,
    };

    const result = validateGraph(invalidGraph);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.includes("non-existent target node"))).toBe(true);
    expect(result.errors.some((e) => e.includes("missing a valid numeric weight"))).toBe(true);
  });

  it("should generate random graphs within bounds", () => {
    const rand = generateRandomGraph({ nodeCount: 5, directed: false, weighted: true });
    expect(rand.nodes).toHaveLength(5);
    expect(rand.edges.length).toBeGreaterThanOrEqual(4);
    const result = validateGraph(rand);
    expect(result.valid).toBe(true);
  });
});
