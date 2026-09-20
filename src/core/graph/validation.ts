/**
 * Graph Validation and Degree Calculation Utilities
 */

import type { GraphState, GraphNode, GraphEdge, NodeDegreeInfo } from "./types";

export interface GraphValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Creates a deterministic, stable node ID based on its label
 */
export function createStableNodeId(label: string): string {
  const sanitized = label.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return `node-${sanitized || "vertex"}`;
}

/**
 * Creates a deterministic, stable edge ID based on its endpoints and direction
 */
export function createStableEdgeId(
  sourceId: string,
  targetId: string,
  directed: boolean
): string {
  if (directed) {
    return `edge-${sourceId}->${targetId}`;
  }
  // For undirected graphs, canonical ordering guarantees (u, v) and (v, u) have identical IDs
  const sorted = [sourceId, targetId].sort();
  return `edge-${sorted[0]}--${sorted[1]}`;
}

/**
 * Checks if a node label already exists (case-insensitive)
 */
export function checkDuplicateNodeLabel(
  nodes: readonly GraphNode[],
  label: string
): boolean {
  const clean = label.trim().toLowerCase();
  return nodes.some((n) => n.label.trim().toLowerCase() === clean);
}

/**
 * Checks if an edge between source and target already exists
 */
export function checkDuplicateEdge(
  edges: readonly GraphEdge[],
  sourceId: string,
  targetId: string,
  directed: boolean
): boolean {
  return edges.some((e) => {
    if (directed) {
      return e.sourceId === sourceId && e.targetId === targetId;
    }
    // Undirected edge matches both directions
    return (
      (e.sourceId === sourceId && e.targetId === targetId) ||
      (e.sourceId === targetId && e.targetId === sourceId)
    );
  });
}

/**
 * Calculates in-degree, out-degree, and total degree for a specified node
 */
export function calculateNodeDegrees(
  state: GraphState,
  nodeId: string
): NodeDegreeInfo {
  let inDegree = 0;
  let outDegree = 0;

  for (const edge of state.edges) {
    if (edge.sourceId === nodeId && edge.targetId === nodeId) {
      // Self-loop adds 1 to inDegree and 1 to outDegree
      inDegree += 1;
      outDegree += 1;
    } else if (edge.sourceId === nodeId) {
      outDegree += 1;
    } else if (edge.targetId === nodeId) {
      inDegree += 1;
    }
  }

  const degree = state.directed ? inDegree + outDegree : outDegree; // in undirected graph inDegree === outDegree

  return {
    inDegree,
    outDegree,
    degree,
  };
}

/**
 * Validates the canonical graph state against integrity rules
 */
export function validateGraph(state: GraphState): GraphValidationResult {
  const errors: string[] = [];
  const nodeIds = new Set<string>();
  const nodeLabels = new Set<string>();

  // 1. Node uniqueness and validity
  for (const node of state.nodes) {
    if (!node.id) {
      errors.push("Graph contains a node with missing ID");
    } else if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node ID detected: ${node.id}`);
    } else {
      nodeIds.add(node.id);
    }

    const cleanLabel = node.label?.trim().toLowerCase();
    if (!cleanLabel) {
      errors.push(`Node ${node.id} has empty label`);
    } else if (nodeLabels.has(cleanLabel)) {
      errors.push(`Duplicate node label detected: "${node.label}"`);
    } else {
      nodeLabels.add(cleanLabel);
    }
  }

  // 2. Edge uniqueness and validity
  const edgeSet = new Set<string>();
  for (const edge of state.edges) {
    if (!nodeIds.has(edge.sourceId)) {
      errors.push(`Edge ${edge.id} references non-existent source node: ${edge.sourceId}`);
    }
    if (!nodeIds.has(edge.targetId)) {
      errors.push(`Edge ${edge.id} references non-existent target node: ${edge.targetId}`);
    }

    const edgeKey = state.directed
      ? `${edge.sourceId}->${edge.targetId}`
      : [edge.sourceId, edge.targetId].sort().join("--");

    if (edgeSet.has(edgeKey)) {
      errors.push(`Duplicate edge detected: ${edgeKey}`);
    } else {
      edgeSet.add(edgeKey);
    }

    if (state.weighted && (edge.weight === undefined || isNaN(edge.weight))) {
      errors.push(`Edge ${edge.id} is missing a valid numeric weight in weighted graph`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Returns the next suggested node label (A, B, C, ... Z, A1, B1, ...)
 */
export function getNextDefaultNodeLabel(nodes: readonly GraphNode[]): string {
  const existing = new Set(nodes.map((n) => n.label.trim().toUpperCase()));
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < alphabet.length; i++) {
    const letter = alphabet[i];
    if (!existing.has(letter)) {
      return letter;
    }
  }

  // If A-Z are used, try A1, B1, etc.
  for (let round = 1; round <= 10; round++) {
    for (let i = 0; i < alphabet.length; i++) {
      const candidate = `${alphabet[i]}${round}`;
      if (!existing.has(candidate)) {
        return candidate;
      }
    }
  }

  return `N${nodes.length + 1}`;
}
