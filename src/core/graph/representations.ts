/**
 * Canonical Derived Graph Representations
 *
 * Adjacency List and Adjacency Matrix are dynamically derived from the
 * single source of truth: canonical GraphState.
 */

import type { GraphState, AdjacencyList, AdjacencyMatrix, AdjacencyNeighbor } from "./types";

/**
 * Derives an Adjacency List from the canonical GraphState.
 * Keys are node labels. Neighbors are sorted by target label for determinism.
 */
export function deriveAdjacencyList(state: GraphState): AdjacencyList {
  const list: AdjacencyList = {};
  const nodeMap = new Map<string, string>(); // id -> label

  for (const node of state.nodes) {
    nodeMap.set(node.id, node.label);
    list[node.label] = [];
  }

  for (const edge of state.edges) {
    const sourceLabel = nodeMap.get(edge.sourceId);
    const targetLabel = nodeMap.get(edge.targetId);

    if (!sourceLabel || !targetLabel) continue;

    // Add forward connection
    const forwardNeighbor: AdjacencyNeighbor = {
      targetId: edge.targetId,
      label: targetLabel,
      ...(state.weighted && edge.weight !== undefined ? { weight: edge.weight } : {}),
    };
    list[sourceLabel].push(forwardNeighbor);

    // If undirected, add reverse connection (unless it's a self-loop)
    if (!state.directed && edge.sourceId !== edge.targetId) {
      const reverseNeighbor: AdjacencyNeighbor = {
        targetId: edge.sourceId,
        label: sourceLabel,
        ...(state.weighted && edge.weight !== undefined ? { weight: edge.weight } : {}),
      };
      list[targetLabel].push(reverseNeighbor);
    }
  }

  // Sort neighbors for deterministic, clean display
  for (const label of Object.keys(list)) {
    list[label].sort((a, b) => a.label.localeCompare(b.label));
  }

  return list;
}

/**
 * Derives an Adjacency Matrix from the canonical GraphState.
 * Matrix dimension is |V| x |V|.
 * In unweighted graphs, entries are 1 (connected) or 0 (disconnected).
 * In weighted graphs, entries are weight (connected) or 0 (disconnected).
 */
export function deriveAdjacencyMatrix(state: GraphState): AdjacencyMatrix {
  // Sort node labels for predictable row and column headers
  const sortedNodes = [...state.nodes].sort((a, b) => a.label.localeCompare(b.label));
  const labels = sortedNodes.map((n) => n.label);
  const idToIndex = new Map<string, number>();

  sortedNodes.forEach((node, idx) => {
    idToIndex.set(node.id, idx);
  });

  const n = sortedNodes.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (const edge of state.edges) {
    const fromIdx = idToIndex.get(edge.sourceId);
    const toIdx = idToIndex.get(edge.targetId);

    if (fromIdx !== undefined && toIdx !== undefined) {
      const val = state.weighted && edge.weight !== undefined ? edge.weight : 1;
      matrix[fromIdx][toIdx] = val;

      // In undirected graph, matrix is symmetric
      if (!state.directed) {
        matrix[toIdx][fromIdx] = val;
      }
    }
  }

  return {
    labels,
    matrix,
  };
}
