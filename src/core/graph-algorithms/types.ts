/**
 * Graph Algorithm Types and State Models
 *
 * Models execution states for BFS, DFS, Dijkstra, Bellman-Ford, Prim's,
 * Kruskal's, and Topological Sort.
 */

import type { GraphState } from "@/core/graph/types";

export type GraphAlgorithmType =
  | "bfs"
  | "dfs"
  | "dijkstra"
  | "bellman-ford"
  | "prim"
  | "kruskal"
  | "topological-sort";

export interface GraphAlgorithmExecutionState {
  readonly graph: GraphState;
  readonly algorithm: GraphAlgorithmType;
  /** Currently active/evaluated vertex ID */
  readonly currentVertexId: string | null;
  /** Visited vertex IDs in order */
  readonly visitedVertexIds: readonly string[];
  /** Frontiers / Queue (BFS, Kahn's) or Call Stack (DFS) */
  readonly frontierIds: readonly string[];
  /** Currently traversed / examined edge ID */
  readonly activeEdgeId: string | null;
  /** MST or Shortest Path tree edge IDs */
  readonly treeEdgeIds: readonly string[];
  /** Distance table: node ID -> distance */
  readonly distances?: Readonly<Record<string, number>>;
  /** Predecessor table: node ID -> parent node ID */
  readonly predecessors?: Readonly<Record<string, string | null>>;
  /** In-degree map for Topological Sort: node ID -> remaining in-degree */
  readonly inDegrees?: Readonly<Record<string, number>>;
  /** Topological order result */
  readonly topologicalOrder?: readonly string[];
  /** Candidate list for Dijkstra / Prim */
  readonly candidateList?: readonly { readonly id: string; readonly label: string; readonly priority: number }[];
  /** Kruskal specific: Disjoint Set representatives: node ID -> root ID */
  readonly disjointSets?: Readonly<Record<string, string>>;
  /** Cycle detected flag */
  readonly cycleDetected?: boolean;
  /** Step explanation */
  readonly phaseDescription: string;
}
