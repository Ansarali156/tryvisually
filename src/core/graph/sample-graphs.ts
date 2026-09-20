/**
 * Pre-configured Sample Graphs and Deterministic Random Graph Generator
 */

import type { GraphState, GraphNode, GraphEdge } from "./types";
import { computeCircularLayout } from "./layout";
import { createStableNodeId, createStableEdgeId } from "./validation";

/**
 * Prompt 13 Acceptance Sample: Undirected Weighted Graph
 * A -- 5 -- B
 * |         |
 * 2         3
 * |         |
 * C -- 4 -- D
 */
export function createSampleUndirectedWeightedGraph(): GraphState {
  const nodes: GraphNode[] = [
    { id: "node-a", label: "A", x: 180, y: 100 },
    { id: "node-b", label: "B", x: 460, y: 100 },
    { id: "node-c", label: "C", x: 180, y: 300 },
    { id: "node-d", label: "D", x: 460, y: 300 },
  ];

  const edges: GraphEdge[] = [
    {
      id: "edge-node-a--node-b",
      sourceId: "node-a",
      targetId: "node-b",
      directed: false,
      weight: 5,
    },
    {
      id: "edge-node-a--node-c",
      sourceId: "node-a",
      targetId: "node-c",
      directed: false,
      weight: 2,
    },
    {
      id: "edge-node-b--node-d",
      sourceId: "node-b",
      targetId: "node-d",
      directed: false,
      weight: 3,
    },
    {
      id: "edge-node-c--node-d",
      sourceId: "node-c",
      targetId: "node-d",
      directed: false,
      weight: 4,
    },
  ];

  return {
    nodes,
    edges,
    directed: false,
    weighted: true,
    selectedNodeId: null,
    selectedEdgeId: null,
  };
}

/**
 * Simple Undirected Unweighted Graph
 */
export function createSampleUndirectedGraph(): GraphState {
  const nodes: GraphNode[] = [
    { id: "node-a", label: "A", x: 200, y: 120 },
    { id: "node-b", label: "B", x: 440, y: 120 },
    { id: "node-c", label: "C", x: 200, y: 280 },
    { id: "node-d", label: "D", x: 440, y: 280 },
  ];

  const edges: GraphEdge[] = [
    { id: "edge-node-a--node-b", sourceId: "node-a", targetId: "node-b", directed: false },
    { id: "edge-node-a--node-c", sourceId: "node-a", targetId: "node-c", directed: false },
    { id: "edge-node-b--node-d", sourceId: "node-b", targetId: "node-d", directed: false },
    { id: "edge-node-c--node-d", sourceId: "node-c", targetId: "node-d", directed: false },
  ];

  return {
    nodes,
    edges,
    directed: false,
    weighted: false,
    selectedNodeId: null,
    selectedEdgeId: null,
  };
}

/**
 * Directed DAG Graph
 */
export function createSampleDirectedGraph(): GraphState {
  const nodes: GraphNode[] = [
    { id: "node-a", label: "A", x: 180, y: 200 },
    { id: "node-b", label: "B", x: 320, y: 110 },
    { id: "node-c", label: "C", x: 320, y: 290 },
    { id: "node-d", label: "D", x: 460, y: 200 },
  ];

  const edges: GraphEdge[] = [
    { id: "edge-node-a->node-b", sourceId: "node-a", targetId: "node-b", directed: true },
    { id: "edge-node-a->node-c", sourceId: "node-a", targetId: "node-c", directed: true },
    { id: "edge-node-b->node-d", sourceId: "node-b", targetId: "node-d", directed: true },
    { id: "edge-node-c->node-d", sourceId: "node-c", targetId: "node-d", directed: true },
  ];

  return {
    nodes,
    edges,
    directed: true,
    weighted: false,
    selectedNodeId: null,
    selectedEdgeId: null,
  };
}

/**
 * Creates an empty graph state
 */
export function createEmptyGraphState(directed = false, weighted = false): GraphState {
  return {
    nodes: [],
    edges: [],
    directed,
    weighted,
    selectedNodeId: null,
    selectedEdgeId: null,
  };
}

/**
 * Generates a random connected or sparse graph with circular layout
 */
export function generateRandomGraph(options: {
  nodeCount?: number;
  edgeCount?: number;
  directed?: boolean;
  weighted?: boolean;
} = {}): GraphState {
  const nodeCount = Math.max(3, Math.min(options.nodeCount ?? 5, 8));
  const directed = options.directed ?? false;
  const weighted = options.weighted ?? false;
  const alphabet = "ABCDEFGH";

  const rawNodes: GraphNode[] = Array.from({ length: nodeCount }, (_, i) => {
    const label = alphabet[i] || `V${i + 1}`;
    return {
      id: createStableNodeId(label),
      label,
      x: 0,
      y: 0,
    };
  });

  const positionedNodes = computeCircularLayout(rawNodes, { width: 640, height: 400, padding: 60 });

  // Generate edges: ensure at least a spanning tree to avoid disconnected nodes
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  const addEdge = (uIdx: number, vIdx: number) => {
    if (uIdx === vIdx) return;
    const u = positionedNodes[uIdx];
    const v = positionedNodes[vIdx];
    const key = directed ? `${u.id}->${v.id}` : [u.id, v.id].sort().join("--");
    if (edgeSet.has(key)) return;

    edgeSet.add(key);
    const weight = weighted ? Math.floor(Math.random() * 9) + 1 : undefined;
    edges.push({
      id: createStableEdgeId(u.id, v.id, directed),
      sourceId: u.id,
      targetId: v.id,
      directed,
      ...(weighted ? { weight } : {}),
    });
  };

  // Ring connections to make it visually attractive and connected
  for (let i = 0; i < nodeCount; i++) {
    addEdge(i, (i + 1) % nodeCount);
  }

  // Add 1-2 cross chords
  if (nodeCount >= 4) {
    addEdge(0, Math.floor(nodeCount / 2));
    if (nodeCount >= 6) {
      addEdge(1, Math.floor(nodeCount / 2) + 1);
    }
  }

  return {
    nodes: positionedNodes,
    edges,
    directed,
    weighted,
    selectedNodeId: null,
    selectedEdgeId: null,
  };
}
