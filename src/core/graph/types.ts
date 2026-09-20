/**
 * Core Graph Data Types and State Models
 *
 * Canonical representation of a graph data structure.
 * Single source of truth from which Adjacency Lists, Adjacency Matrices,
 * and Visualization States are derived.
 */

export type GraphType = "undirected" | "directed";
export type EdgeType = "unweighted" | "weighted";

export type GraphOperationType =
  | "add-node"
  | "delete-node"
  | "add-edge"
  | "delete-edge"
  | "clear"
  | "select-node"
  | "select-edge";

export interface GraphNode {
  /** Stable unique node identifier (e.g., "node-a", "node-1") - never array index */
  readonly id: string;
  /** Display label (e.g., "A", "B", "1") - must be unique within the graph */
  readonly label: string;
  /** Spatial presentation coordinate x */
  readonly x: number;
  /** Spatial presentation coordinate y */
  readonly y: number;
}

export interface GraphEdge {
  /** Stable unique edge identifier (e.g., "edge-node-a-node-b") */
  readonly id: string;
  /** Source node ID */
  readonly sourceId: string;
  /** Target node ID */
  readonly targetId: string;
  /** Whether the edge is directed (A -> B) or undirected (A -- B) */
  readonly directed: boolean;
  /** Optional numeric weight for weighted graphs */
  readonly weight?: number;
}

export interface GraphState {
  /** Canonical list of vertices */
  readonly nodes: readonly GraphNode[];
  /** Canonical list of edges */
  readonly edges: readonly GraphEdge[];
  /** Graph topology configuration */
  readonly directed: boolean;
  /** Edge weighting configuration */
  readonly weighted: boolean;
  /** Currently selected node ID if any */
  readonly selectedNodeId?: string | null;
  /** Currently selected edge ID if any */
  readonly selectedEdgeId?: string | null;
}

/**
 * Reusable extension point for future graph algorithms (BFS, DFS, Dijkstra, Prim, Kruskal, Topological Sort)
 */
export interface GraphAlgorithmState {
  readonly currentNodeId?: string | null;
  readonly visitedNodeIds: readonly string[];
  readonly activeEdgeIds: readonly string[];
  readonly highlightedEdgeIds: readonly string[];
  readonly distances?: Readonly<Record<string, number>>;
  readonly predecessors?: Readonly<Record<string, string | null>>;
  readonly traversalOrder?: readonly string[];
}

export interface AdjacencyNeighbor {
  readonly targetId: string;
  readonly label: string;
  readonly weight?: number;
}

export type AdjacencyList = Record<string, AdjacencyNeighbor[]>;

export interface AdjacencyMatrix {
  readonly labels: readonly string[];
  readonly matrix: readonly (readonly number[])[];
}

export interface NodeDegreeInfo {
  readonly inDegree: number;
  readonly outDegree: number;
  readonly degree: number; // For undirected graphs, or inDegree + outDegree
}
