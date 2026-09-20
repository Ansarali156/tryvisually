/**
 * Deterministic Execution Trace Generators for Graph Operations
 *
 * Single source of truth for step-by-step state evolution.
 * Guarantees immutability of historical snapshots via ExecutionTraceBuilder.
 */

import type { ExecutionTrace } from "@/core/execution/types";
import { createExecutionTrace } from "@/core/execution/trace/trace-builder";
import type { GraphState, GraphNode, GraphEdge } from "./types";
import {
  createStableNodeId,
  createStableEdgeId,
  checkDuplicateNodeLabel,
  checkDuplicateEdge,
  calculateNodeDegrees,
} from "./validation";
import { computeNextNodePosition } from "./layout";

/**
 * Deep clone utility for GraphState
 */
function cloneGraphState(state: GraphState): GraphState {
  return {
    nodes: state.nodes.map((n) => ({ ...n })),
    edges: state.edges.map((e) => ({ ...e })),
    directed: state.directed,
    weighted: state.weighted,
    selectedNodeId: state.selectedNodeId ?? null,
    selectedEdgeId: state.selectedEdgeId ?? null,
  };
}

/**
 * Generates deterministic ExecutionTrace for adding a node to the graph
 */
export function generateAddNodeTrace(
  initialState: GraphState,
  rawLabel: string
): ExecutionTrace<GraphState> {
  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "graph-add-vertex",
      algorithmName: "Graph Add Vertex",
      category: "Graph Operations",
    },
  });

  const label = rawLabel.trim().toUpperCase() || "A";

  // Step 1: Validate node label
  const isDuplicate = checkDuplicateNodeLabel(initialState.nodes, label);
  const state0 = cloneGraphState(initialState);

  builder.addStep({
    operation: "call",
    codeLine: 1,
    variables: {
      operation: "add_vertex",
      label,
      totalVertices: state0.nodes.length,
    },
    state: state0,
    highlightedElements: [],
    explanation: `Validating vertex label "${label}". Checking if vertex already exists in graph.`,
  });

  if (isDuplicate) {
    builder.addStep({
      operation: "compare",
      codeLine: 2,
      variables: {
        operation: "add_vertex",
        label,
        error: "Duplicate vertex",
      },
      state: state0,
      highlightedElements: [],
      explanation: `Vertex "${label}" already exists in the graph. Operation aborted without mutation.`,
    });
    return builder.build();
  }

  // Step 2: Compute deterministic position and allocate stable ID
  const nodeId = createStableNodeId(label);
  const { x, y } = computeNextNodePosition(initialState.nodes);
  const newNode: GraphNode = {
    id: nodeId,
    label,
    x,
    y,
  };

  const state1 = cloneGraphState(initialState);
  builder.addStep({
    operation: "insert",
    codeLine: 4,
    variables: {
      operation: "allocate_vertex",
      label,
      nodeId,
      position: `(${x}, ${y})`,
    },
    state: state1,
    highlightedElements: [],
    explanation: `Allocated stable identifier "${nodeId}" and computed coordinates (${x}, ${y}) for vertex "${label}".`,
  });

  // Step 3: Insert node into canonical graph state
  const state2: GraphState = {
    ...cloneGraphState(initialState),
    nodes: [...initialState.nodes, newNode],
    selectedNodeId: nodeId,
  };

  builder.addStep({
    operation: "update",
    codeLine: 5,
    variables: {
      operation: "commit_vertex",
      label,
      nodeId,
      totalVertices: state2.nodes.length,
      totalEdges: state2.edges.length,
    },
    state: state2,
    highlightedElements: [nodeId],
    explanation: `Vertex "${label}" successfully inserted into the graph. Total vertices: ${state2.nodes.length}.`,
  });

  return builder.build();
}

/**
 * Generates deterministic ExecutionTrace for adding an edge between source and target
 */
export function generateAddEdgeTrace(
  initialState: GraphState,
  sourceLabel: string,
  targetLabel: string,
  weight?: number
): ExecutionTrace<GraphState> {
  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "graph-add-edge",
      algorithmName: "Graph Add Edge",
      category: "Graph Operations",
    },
  });

  const sLabel = sourceLabel.trim().toUpperCase();
  const tLabel = targetLabel.trim().toUpperCase();

  const sourceNode = initialState.nodes.find(
    (n) => n.label.trim().toUpperCase() === sLabel
  );
  const targetNode = initialState.nodes.find(
    (n) => n.label.trim().toUpperCase() === tLabel
  );

  const state0 = cloneGraphState(initialState);

  // Step 1: Select source vertex
  builder.addStep({
    operation: "select",
    codeLine: 1,
    variables: {
      operation: "select_source",
      source: sLabel,
      target: tLabel,
    },
    state: {
      ...state0,
      selectedNodeId: sourceNode?.id ?? null,
    },
    highlightedElements: sourceNode ? [sourceNode.id] : [],
    explanation: sourceNode
      ? `Selected source vertex "${sLabel}".`
      : `Source vertex "${sLabel}" not found in graph.`,
  });

  if (!sourceNode || !targetNode) {
    builder.addStep({
      operation: "compare",
      codeLine: 2,
      variables: {
        error: "Missing endpoint",
        sourceFound: Boolean(sourceNode),
        targetFound: Boolean(targetNode),
      },
      state: state0,
      highlightedElements: [],
      explanation: `Cannot create edge: both vertices "${sLabel}" and "${tLabel}" must exist in the graph.`,
    });
    return builder.build();
  }

  // Step 2: Select target vertex
  const state1: GraphState = {
    ...cloneGraphState(initialState),
    selectedNodeId: targetNode.id,
  };

  builder.addStep({
    operation: "select",
    codeLine: 2,
    variables: {
      operation: "select_target",
      source: sLabel,
      target: tLabel,
    },
    state: state1,
    highlightedElements: [sourceNode.id, targetNode.id],
    explanation: `Selected target vertex "${tLabel}". Validating edge endpoints.`,
  });

  // Step 3: Check duplicate edge
  const isDuplicate = checkDuplicateEdge(
    initialState.edges,
    sourceNode.id,
    targetNode.id,
    initialState.directed
  );

  if (isDuplicate) {
    builder.addStep({
      operation: "compare",
      codeLine: 3,
      variables: {
        operation: "check_duplicate",
        duplicate: true,
        edge: initialState.directed
          ? `${sLabel} -> ${tLabel}`
          : `${sLabel} -- ${tLabel}`,
      },
      state: state1,
      highlightedElements: [sourceNode.id, targetNode.id],
      explanation: `Edge between "${sLabel}" and "${tLabel}" already exists in the graph. Duplicate rejected.`,
    });
    return builder.build();
  }

  // Step 4: Construct edge object with stable ID
  const edgeId = createStableEdgeId(
    sourceNode.id,
    targetNode.id,
    initialState.directed
  );
  const newEdge: GraphEdge = {
    id: edgeId,
    sourceId: sourceNode.id,
    targetId: targetNode.id,
    directed: initialState.directed,
    ...(initialState.weighted && weight !== undefined ? { weight } : {}),
  };

  // Step 5: Commit edge to canonical graph state
  const state2: GraphState = {
    ...cloneGraphState(initialState),
    edges: [...initialState.edges, newEdge],
    selectedNodeId: null,
    selectedEdgeId: edgeId,
  };

  const edgeDescription = initialState.directed
    ? `directed edge "${sLabel} → ${tLabel}"`
    : `undirected edge "${sLabel} ── ${tLabel}"`;
  const weightText =
    initialState.weighted && weight !== undefined ? ` with weight ${weight}` : "";

  builder.addStep({
    operation: "insert",
    codeLine: 5,
    variables: {
      operation: "commit_edge",
      source: sLabel,
      target: tLabel,
      edgeId,
      directed: initialState.directed,
      weight: weight ?? null,
      totalEdges: state2.edges.length,
    },
    state: state2,
    highlightedElements: [edgeId, sourceNode.id, targetNode.id],
    explanation: `Added ${edgeDescription}${weightText}. Total edges: ${state2.edges.length}.`,
  });

  return builder.build();
}

/**
 * Generates deterministic ExecutionTrace for deleting a vertex and all its incident edges
 */
export function generateDeleteNodeTrace(
  initialState: GraphState,
  rawLabel: string
): ExecutionTrace<GraphState> {
  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "graph-delete-vertex",
      algorithmName: "Graph Delete Vertex",
      category: "Graph Operations",
    },
  });

  const label = rawLabel.trim().toUpperCase();

  const targetNode = initialState.nodes.find(
    (n) => n.label.trim().toUpperCase() === label
  );

  if (!targetNode) {
    builder.addStep({
      operation: "compare",
      codeLine: 1,
      variables: { operation: "delete_vertex", label, found: false },
      state: cloneGraphState(initialState),
      highlightedElements: [],
      explanation: `Cannot delete vertex "${label}": vertex not found in graph.`,
    });
    return builder.build();
  }

  // Step 1: Identify vertex and incident edges
  const incidentEdges = initialState.edges.filter(
    (e) => e.sourceId === targetNode.id || e.targetId === targetNode.id
  );
  const incidentEdgeIds = incidentEdges.map((e) => e.id);

  const state0: GraphState = {
    ...cloneGraphState(initialState),
    selectedNodeId: targetNode.id,
  };

  builder.addStep({
    operation: "select",
    codeLine: 2,
    variables: {
      operation: "identify_incident_edges",
      label,
      incidentCount: incidentEdges.length,
      incidentEdgeIds,
    },
    state: state0,
    highlightedElements: [targetNode.id, ...incidentEdgeIds],
    explanation: `Identified vertex "${label}" with ${incidentEdges.length} incident edge(s) to remove.`,
  });

  // Step 2: Remove incident edges
  const remainingEdges = initialState.edges.filter(
    (e) => e.sourceId !== targetNode.id && e.targetId !== targetNode.id
  );

  const state1: GraphState = {
    ...cloneGraphState(initialState),
    edges: remainingEdges,
    selectedNodeId: targetNode.id,
  };

  builder.addStep({
    operation: "delete",
    codeLine: 4,
    variables: {
      operation: "remove_incident_edges",
      removedEdges: incidentEdges.length,
      remainingEdges: remainingEdges.length,
    },
    state: state1,
    highlightedElements: [targetNode.id],
    explanation: `Removed ${incidentEdges.length} incident edge(s) connected to vertex "${label}".`,
  });

  // Step 3: Remove vertex from graph
  const remainingNodes = initialState.nodes.filter((n) => n.id !== targetNode.id);

  const state2: GraphState = {
    ...cloneGraphState(initialState),
    nodes: remainingNodes,
    edges: remainingEdges,
    selectedNodeId: null,
    selectedEdgeId: null,
  };

  builder.addStep({
    operation: "delete",
    codeLine: 5,
    variables: {
      operation: "remove_vertex",
      deletedLabel: label,
      remainingVertices: remainingNodes.length,
    },
    state: state2,
    highlightedElements: [],
    explanation: `Vertex "${label}" removed from graph. Remaining vertices: ${remainingNodes.length}.`,
  });

  return builder.build();
}

/**
 * Generates deterministic ExecutionTrace for deleting an edge
 */
export function generateDeleteEdgeTrace(
  initialState: GraphState,
  sourceLabel: string,
  targetLabel: string
): ExecutionTrace<GraphState> {
  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "graph-delete-edge",
      algorithmName: "Graph Delete Edge",
      category: "Graph Operations",
    },
  });

  const sLabel = sourceLabel.trim().toUpperCase();
  const tLabel = targetLabel.trim().toUpperCase();

  const sourceNode = initialState.nodes.find(
    (n) => n.label.trim().toUpperCase() === sLabel
  );
  const targetNode = initialState.nodes.find(
    (n) => n.label.trim().toUpperCase() === tLabel
  );

  if (!sourceNode || !targetNode) {
    builder.addStep({
      operation: "compare",
      codeLine: 1,
      variables: { operation: "delete_edge", found: false },
      state: cloneGraphState(initialState),
      highlightedElements: [],
      explanation: `Cannot delete edge: endpoint vertices "${sLabel}" or "${tLabel}" not found.`,
    });
    return builder.build();
  }

  const targetEdge = initialState.edges.find((e) => {
    if (initialState.directed) {
      return e.sourceId === sourceNode.id && e.targetId === targetNode.id;
    }
    return (
      (e.sourceId === sourceNode.id && e.targetId === targetNode.id) ||
      (e.sourceId === targetNode.id && e.targetId === sourceNode.id)
    );
  });

  if (!targetEdge) {
    builder.addStep({
      operation: "compare",
      codeLine: 2,
      variables: { operation: "delete_edge", found: false },
      state: cloneGraphState(initialState),
      highlightedElements: [],
      explanation: `Edge between "${sLabel}" and "${tLabel}" does not exist in graph.`,
    });
    return builder.build();
  }

  // Step 1: Highlight edge to be removed
  const state0: GraphState = {
    ...cloneGraphState(initialState),
    selectedEdgeId: targetEdge.id,
  };

  builder.addStep({
    operation: "select",
    codeLine: 3,
    variables: {
      operation: "target_edge",
      source: sLabel,
      target: tLabel,
      edgeId: targetEdge.id,
    },
    state: state0,
    highlightedElements: [targetEdge.id],
    explanation: `Targeted edge between "${sLabel}" and "${tLabel}" for deletion.`,
  });

  // Step 2: Remove edge
  const remainingEdges = initialState.edges.filter((e) => e.id !== targetEdge.id);

  const state1: GraphState = {
    ...cloneGraphState(initialState),
    edges: remainingEdges,
    selectedEdgeId: null,
  };

  builder.addStep({
    operation: "delete",
    codeLine: 4,
    variables: {
      operation: "remove_edge",
      remainingEdges: remainingEdges.length,
    },
    state: state1,
    highlightedElements: [sourceNode.id, targetNode.id],
    explanation: `Edge between "${sLabel}" and "${tLabel}" removed. Total edges: ${remainingEdges.length}.`,
  });

  return builder.build();
}

/**
 * Generates deterministic ExecutionTrace for clearing all vertices and edges
 */
export function generateClearGraphTrace(
  initialState: GraphState
): ExecutionTrace<GraphState> {
  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "graph-clear",
      algorithmName: "Graph Clear",
      category: "Graph Operations",
    },
  });

  const allElementIds = [
    ...initialState.nodes.map((n) => n.id),
    ...initialState.edges.map((e) => e.id),
  ];

  builder.addStep({
    operation: "select",
    codeLine: 1,
    variables: {
      operation: "clear_graph",
      verticesCount: initialState.nodes.length,
      edgesCount: initialState.edges.length,
    },
    state: cloneGraphState(initialState),
    highlightedElements: allElementIds,
    explanation: `Clearing graph: selecting all ${initialState.nodes.length} vertices and ${initialState.edges.length} edges for removal.`,
  });

  const emptyState: GraphState = {
    nodes: [],
    edges: [],
    directed: initialState.directed,
    weighted: initialState.weighted,
    selectedNodeId: null,
    selectedEdgeId: null,
  };

  builder.addStep({
    operation: "delete",
    codeLine: 2,
    variables: {
      operation: "graph_cleared",
      verticesCount: 0,
      edgesCount: 0,
    },
    state: emptyState,
    highlightedElements: [],
    explanation: `Graph cleared. All vertices and edges removed.`,
  });

  return builder.build();
}

/**
 * Generates ExecutionTrace when selecting a node (calculating degrees)
 */
export function generateSelectNodeTrace(
  initialState: GraphState,
  nodeId: string
): ExecutionTrace<GraphState> {
  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "graph-select-vertex",
      algorithmName: "Graph Select Vertex",
      category: "Graph Operations",
    },
  });

  const node = initialState.nodes.find((n) => n.id === nodeId);
  if (!node) return builder.build();

  const degreeInfo = calculateNodeDegrees(initialState, nodeId);
  const incidentEdges = initialState.edges.filter(
    (e) => e.sourceId === nodeId || e.targetId === nodeId
  );

  const selectedState: GraphState = {
    ...cloneGraphState(initialState),
    selectedNodeId: nodeId,
    selectedEdgeId: null,
  };

  builder.addStep({
    operation: "select",
    codeLine: 1,
    variables: {
      vertex: node.label,
      nodeId,
      degree: degreeInfo.degree,
      inDegree: degreeInfo.inDegree,
      outDegree: degreeInfo.outDegree,
      directed: initialState.directed,
    },
    state: selectedState,
    highlightedElements: [nodeId, ...incidentEdges.map((e) => e.id)],
    explanation: initialState.directed
      ? `Vertex "${node.label}" selected. In-degree: ${degreeInfo.inDegree}, Out-degree: ${degreeInfo.outDegree}.`
      : `Vertex "${node.label}" selected. Degree: ${degreeInfo.degree}.`,
  });

  return builder.build();
}
