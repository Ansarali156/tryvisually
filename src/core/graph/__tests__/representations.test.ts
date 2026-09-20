import { describe, it, expect } from "vitest";
import { deriveAdjacencyList, deriveAdjacencyMatrix } from "../representations";
import {
  createSampleUndirectedWeightedGraph,
  createSampleDirectedGraph,
} from "../sample-graphs";

describe("Graph Representations Derivations", () => {
  it("should correctly derive Adjacency List for the acceptance undirected weighted graph", () => {
    const graph = createSampleUndirectedWeightedGraph();
    const adjList = deriveAdjacencyList(graph);

    expect(Object.keys(adjList).sort()).toEqual(["A", "B", "C", "D"]);

    // A -> B(5), C(2)
    expect(adjList["A"]).toEqual([
      { targetId: "node-b", label: "B", weight: 5 },
      { targetId: "node-c", label: "C", weight: 2 },
    ]);

    // B -> A(5), D(3)
    expect(adjList["B"]).toEqual([
      { targetId: "node-a", label: "A", weight: 5 },
      { targetId: "node-d", label: "D", weight: 3 },
    ]);

    // C -> A(2), D(4)
    expect(adjList["C"]).toEqual([
      { targetId: "node-a", label: "A", weight: 2 },
      { targetId: "node-d", label: "D", weight: 4 },
    ]);

    // D -> B(3), C(4)
    expect(adjList["D"]).toEqual([
      { targetId: "node-b", label: "B", weight: 3 },
      { targetId: "node-c", label: "C", weight: 4 },
    ]);
  });

  it("should correctly derive Adjacency Matrix for the acceptance undirected weighted graph", () => {
    const graph = createSampleUndirectedWeightedGraph();
    const { labels, matrix } = deriveAdjacencyMatrix(graph);

    expect(labels).toEqual(["A", "B", "C", "D"]);

    // Matrix indices: 0: A, 1: B, 2: C, 3: D
    // A: B(5), C(2) -> [0, 5, 2, 0]
    expect(matrix[0]).toEqual([0, 5, 2, 0]);
    // B: A(5), D(3) -> [5, 0, 0, 3]
    expect(matrix[1]).toEqual([5, 0, 0, 3]);
    // C: A(2), D(4) -> [2, 0, 0, 4]
    expect(matrix[2]).toEqual([2, 0, 0, 4]);
    // D: B(3), C(4) -> [0, 3, 4, 0]
    expect(matrix[3]).toEqual([0, 3, 4, 0]);

    // Verify matrix symmetry for undirected graph
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        expect(matrix[i][j]).toBe(matrix[j][i]);
      }
    }
  });

  it("should correctly derive Adjacency List and Matrix for directed graph", () => {
    const graph = createSampleDirectedGraph(); // A->B, A->C, B->D, C->D
    const adjList = deriveAdjacencyList(graph);
    const { labels, matrix } = deriveAdjacencyMatrix(graph);

    // In directed graph: A has outgoing to B and C
    expect(adjList["A"].map((n) => n.label)).toEqual(["B", "C"]);
    // B has outgoing to D only
    expect(adjList["B"].map((n) => n.label)).toEqual(["D"]);
    // C has outgoing to D only
    expect(adjList["C"].map((n) => n.label)).toEqual(["D"]);
    // D has no outgoing edges
    expect(adjList["D"]).toEqual([]);

    // Matrix indices: 0: A, 1: B, 2: C, 3: D
    expect(matrix[0]).toEqual([0, 1, 1, 0]); // A -> B, C
    expect(matrix[1]).toEqual([0, 0, 0, 1]); // B -> D
    expect(matrix[2]).toEqual([0, 0, 0, 1]); // C -> D
    expect(matrix[3]).toEqual([0, 0, 0, 0]); // D -> none
  });
});
