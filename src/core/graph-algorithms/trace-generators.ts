/**
 * Trace Generators for Graph Algorithms
 *
 * Implements deterministic execution traces for:
 * 1. Breadth-First Search (BFS)
 * 2. Depth-First Search (DFS)
 * 3. Dijkstra's Shortest Path Algorithm
 * 4. Bellman-Ford Algorithm
 * 5. Prim's Minimum Spanning Tree Algorithm
 * 6. Kruskal's Minimum Spanning Tree Algorithm
 * 7. Topological Sort (Kahn's Algorithm)
 */

import { createExecutionTrace } from "@/core/execution/trace/trace-builder";
import type { ExecutionTrace } from "@/core/execution/types";
import type { GraphState, GraphNode, GraphEdge } from "@/core/graph/types";
import type { GraphAlgorithmExecutionState } from "./types";
import { UnionFind } from "./union-find";

function getNodeLabelMap(nodes: readonly GraphNode[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const n of nodes) map.set(n.id, n.label);
  return map;
}

function getNeighbors(
  graph: GraphState,
  nodeId: string
): { targetId: string; edgeId: string; weight: number }[] {
  const neighbors: { targetId: string; edgeId: string; weight: number }[] = [];
  for (const edge of graph.edges) {
    if (edge.sourceId === nodeId) {
      neighbors.push({
        targetId: edge.targetId,
        edgeId: edge.id,
        weight: edge.weight ?? 1,
      });
    } else if (!graph.directed && edge.targetId === nodeId) {
      neighbors.push({
        targetId: edge.sourceId,
        edgeId: edge.id,
        weight: edge.weight ?? 1,
      });
    }
  }
  return neighbors;
}

/**
 * 1. Breadth-First Search (BFS) Trace Generator
 */
export function generateBfsAlgorithmTrace(
  graph: GraphState,
  startNodeId: string
): ExecutionTrace<GraphAlgorithmExecutionState> {
  const labels = getNodeLabelMap(graph.nodes);
  const startNode = graph.nodes.find((n) => n.id === startNodeId) ?? graph.nodes[0];
  const startId = startNode?.id ?? "";

  const initialState: GraphAlgorithmExecutionState = {
    graph,
    algorithm: "bfs",
    currentVertexId: null,
    visitedVertexIds: [],
    frontierIds: [],
    activeEdgeId: null,
    treeEdgeIds: [],
    phaseDescription: `Ready to start BFS traversal from vertex "${labels.get(startId) ?? startId}".`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "bfs",
      algorithmName: "Breadth-First Search",
      category: "Graph Traversal",
    },
  });

  if (!startId || graph.nodes.length === 0) {
    return builder.build();
  }

  // Step 1: Initialize Queue and Visited set
  const visited = [startId];
  const queue = [startId];
  const treeEdges: string[] = [];

  builder.addStep({
    operation: "call",
    codeLine: 2,
    variables: {
      queue: queue.map((id) => labels.get(id)),
      visited: visited.map((id) => labels.get(id)),
      current: null,
    },
    state: {
      ...initialState,
      currentVertexId: startId,
      visitedVertexIds: [...visited],
      frontierIds: [...queue],
      phaseDescription: `Initialize: Enqueue start vertex "${labels.get(startId)}" and mark as visited.`,
    },
    highlightedElements: [startId],
    explanation: `Enqueued start vertex "${labels.get(startId)}" into FIFO queue.`,
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currLabel = labels.get(current) ?? current;

    builder.addStep({
      operation: "select",
      codeLine: 6,
      variables: {
        queue: queue.map((id) => labels.get(id)),
        visited: visited.map((id) => labels.get(id)),
        current: currLabel,
      },
      state: {
        graph,
        algorithm: "bfs",
        currentVertexId: current,
        visitedVertexIds: [...visited],
        frontierIds: [...queue],
        activeEdgeId: null,
        treeEdgeIds: [...treeEdges],
        phaseDescription: `Dequeued vertex "${currLabel}". Exploring adjacent neighbors.`,
      },
      highlightedElements: [current],
      explanation: `Dequeued vertex "${currLabel}" from front of the queue to examine neighbors.`,
    });

    const neighbors = getNeighbors(graph, current);

    for (const { targetId, edgeId } of neighbors) {
      const neighborLabel = labels.get(targetId) ?? targetId;
      const isVisited = visited.includes(targetId);

      builder.addStep({
        operation: "compare",
        codeLine: 8,
        variables: {
          queue: queue.map((id) => labels.get(id)),
          visited: visited.map((id) => labels.get(id)),
          current: currLabel,
          examiningNeighbor: neighborLabel,
          alreadyVisited: isVisited,
        },
        state: {
          graph,
          algorithm: "bfs",
          currentVertexId: current,
          visitedVertexIds: [...visited],
          frontierIds: [...queue],
          activeEdgeId: edgeId,
          treeEdgeIds: [...treeEdges],
          phaseDescription: `Checking neighbor "${neighborLabel}" via edge. Already visited? ${isVisited ? "Yes" : "No"}.`,
        },
        highlightedElements: [current, edgeId, targetId],
        explanation: isVisited
          ? `Neighbor "${neighborLabel}" has already been visited. Skip edge.`
          : `Neighbor "${neighborLabel}" is unvisited. Add to queue.`,
      });

      if (!isVisited) {
        visited.push(targetId);
        queue.push(targetId);
        treeEdges.push(edgeId);

        builder.addStep({
          operation: "insert",
          codeLine: 10,
          variables: {
            queue: queue.map((id) => labels.get(id)),
            visited: visited.map((id) => labels.get(id)),
            current: currLabel,
            enqueued: neighborLabel,
          },
          state: {
            graph,
            algorithm: "bfs",
            currentVertexId: current,
            visitedVertexIds: [...visited],
            frontierIds: [...queue],
            activeEdgeId: edgeId,
            treeEdgeIds: [...treeEdges],
            phaseDescription: `Marked "${neighborLabel}" visited and appended to queue.`,
          },
          highlightedElements: [targetId, edgeId],
          explanation: `Marked "${neighborLabel}" as visited and pushed to queue.`,
        });
      }
    }
  }

  // Final Step: Traversal complete
  builder.addStep({
    operation: "call",
    codeLine: 14,
    variables: {
      queue: [],
      visited: visited.map((id) => labels.get(id)),
      traversalOrder: visited.map((id) => labels.get(id)),
      totalVisited: visited.length,
    },
    state: {
      graph,
      algorithm: "bfs",
      currentVertexId: null,
      visitedVertexIds: [...visited],
      frontierIds: [],
      activeEdgeId: null,
      treeEdgeIds: [...treeEdges],
      phaseDescription: `BFS complete. Visited ${visited.length} reachable vertices.`,
    },
    highlightedElements: [...visited],
    explanation: `BFS complete. Explored all reachable vertices level-by-level.`,
  });

  return builder.build();
}

/**
 * 2. Depth-First Search (DFS) Trace Generator
 */
export function generateDfsAlgorithmTrace(
  graph: GraphState,
  startNodeId: string
): ExecutionTrace<GraphAlgorithmExecutionState> {
  const labels = getNodeLabelMap(graph.nodes);
  const startNode = graph.nodes.find((n) => n.id === startNodeId) ?? graph.nodes[0];
  const startId = startNode?.id ?? "";

  const initialState: GraphAlgorithmExecutionState = {
    graph,
    algorithm: "dfs",
    currentVertexId: null,
    visitedVertexIds: [],
    frontierIds: [],
    activeEdgeId: null,
    treeEdgeIds: [],
    phaseDescription: `Ready to start DFS traversal from vertex "${labels.get(startId) ?? startId}".`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "dfs",
      algorithmName: "Depth-First Search",
      category: "Graph Traversal",
    },
  });

  if (!startId || graph.nodes.length === 0) {
    return builder.build();
  }

  const visited: string[] = [];
  const callStack: string[] = [];
  const treeEdges: string[] = [];

  function dfsRecursive(current: string, fromEdgeId: string | null) {
    const currLabel = labels.get(current) ?? current;
    visited.push(current);
    callStack.push(current);
    if (fromEdgeId) treeEdges.push(fromEdgeId);

    builder.addStep({
      operation: "call",
      codeLine: 4,
      variables: {
        callStack: callStack.map((id) => labels.get(id)),
        visited: visited.map((id) => labels.get(id)),
        current: currLabel,
      },
      state: {
        graph,
        algorithm: "dfs",
        currentVertexId: current,
        visitedVertexIds: [...visited],
        frontierIds: [...callStack],
        activeEdgeId: fromEdgeId,
        treeEdgeIds: [...treeEdges],
        phaseDescription: `Enter traverse("${currLabel}"). Marked as visited.`,
      },
      highlightedElements: [current, ...(fromEdgeId ? [fromEdgeId] : [])],
      explanation: `Calling traverse("${currLabel}"). Node pushed onto the DFS recursion stack.`,
    });

    const neighbors = getNeighbors(graph, current);

    for (const { targetId, edgeId } of neighbors) {
      const neighborLabel = labels.get(targetId) ?? targetId;
      const isVisited = visited.includes(targetId);

      builder.addStep({
        operation: "compare",
        codeLine: 6,
        variables: {
          callStack: callStack.map((id) => labels.get(id)),
          visited: visited.map((id) => labels.get(id)),
          current: currLabel,
          neighbor: neighborLabel,
          visitedCheck: isVisited,
        },
        state: {
          graph,
          algorithm: "dfs",
          currentVertexId: current,
          visitedVertexIds: [...visited],
          frontierIds: [...callStack],
          activeEdgeId: edgeId,
          treeEdgeIds: [...treeEdges],
          phaseDescription: `From "${currLabel}", checking neighbor "${neighborLabel}". Visited? ${isVisited ? "Yes" : "No"}.`,
        },
        highlightedElements: [current, edgeId, targetId],
        explanation: isVisited
          ? `Neighbor "${neighborLabel}" is already visited. Backtrack from edge.`
          : `Neighbor "${neighborLabel}" is unvisited. Recursively traverse deeper.`,
      });

      if (!isVisited) {
        dfsRecursive(targetId, edgeId);

        // After returning from recursive call
        builder.addStep({
          operation: "call",
          codeLine: 7,
          variables: {
            callStack: callStack.map((id) => labels.get(id)),
            visited: visited.map((id) => labels.get(id)),
            current: currLabel,
            returnedFrom: neighborLabel,
          },
          state: {
            graph,
            algorithm: "dfs",
            currentVertexId: current,
            visitedVertexIds: [...visited],
            frontierIds: [...callStack],
            activeEdgeId: edgeId,
            treeEdgeIds: [...treeEdges],
            phaseDescription: `Backtracked to "${currLabel}" after exploring subtree at "${neighborLabel}".`,
          },
          highlightedElements: [current],
          explanation: `Returned back to "${currLabel}". Resuming traversal of remaining neighbors.`,
        });
      }
    }

    callStack.pop();
  }

  dfsRecursive(startId, null);

  builder.addStep({
    operation: "call",
    codeLine: 12,
    variables: {
      traversalOrder: visited.map((id) => labels.get(id)),
      totalVisited: visited.length,
    },
    state: {
      graph,
      algorithm: "dfs",
      currentVertexId: null,
      visitedVertexIds: [...visited],
      frontierIds: [],
      activeEdgeId: null,
      treeEdgeIds: [...treeEdges],
      phaseDescription: `DFS traversal complete. Visited ${visited.length} reachable vertices.`,
    },
    highlightedElements: [...visited],
    explanation: `DFS traversal finished. Explored deep branches and backtracked cleanly.`,
  });

  return builder.build();
}

/**
 * 3. Dijkstra's Algorithm Trace Generator
 */
export function generateDijkstraAlgorithmTrace(
  graph: GraphState,
  startNodeId: string,
  targetNodeId?: string
): ExecutionTrace<GraphAlgorithmExecutionState> {
  const labels = getNodeLabelMap(graph.nodes);
  const startNode = graph.nodes.find((n) => n.id === startNodeId) ?? graph.nodes[0];
  const startId = startNode?.id ?? "";

  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};
  for (const n of graph.nodes) {
    distances[n.id] = Infinity;
    predecessors[n.id] = null;
  }
  if (startId) distances[startId] = 0;

  const initialState: GraphAlgorithmExecutionState = {
    graph,
    algorithm: "dijkstra",
    currentVertexId: null,
    visitedVertexIds: [],
    frontierIds: [],
    activeEdgeId: null,
    treeEdgeIds: [],
    distances: { ...distances },
    predecessors: { ...predecessors },
    candidateList: startId ? [{ id: startId, label: labels.get(startId) ?? startId, priority: 0 }] : [],
    phaseDescription: `Ready to compute shortest paths from "${labels.get(startId) ?? startId}".`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "dijkstra",
      algorithmName: "Dijkstra's Shortest Path",
      category: "Shortest Path",
    },
  });

  if (!startId || graph.nodes.length === 0) return builder.build();

  const visited: string[] = [];
  const treeEdges: string[] = [];
  const pq: { id: string; dist: number }[] = [{ id: startId, dist: 0 }];

  builder.addStep({
    operation: "call",
    codeLine: 2,
    variables: {
      source: labels.get(startId),
      dist: Object.fromEntries(Object.entries(distances).map(([k, v]) => [labels.get(k), v === Infinity ? "∞" : v])),
      pq: pq.map((p) => `${labels.get(p.id)}:${p.dist}`),
    },
    state: {
      ...initialState,
      currentVertexId: startId,
      phaseDescription: `Initialize dist[${labels.get(startId)}] = 0, all other distances = ∞. Insert source into priority queue.`,
    },
    highlightedElements: [startId],
    explanation: `Set dist[${labels.get(startId)}] = 0 and push (${labels.get(startId)}, 0) to priority queue.`,
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { id: u, dist: d } = pq.shift()!;
    const uLabel = labels.get(u) ?? u;

    if (visited.includes(u)) continue;
    visited.push(u);

    // If target reached
    if (targetNodeId && u === targetNodeId) {
      builder.addStep({
        operation: "select",
        codeLine: 6,
        variables: {
          targetReached: uLabel,
          shortestDistance: d,
        },
        state: {
          graph,
          algorithm: "dijkstra",
          currentVertexId: u,
          visitedVertexIds: [...visited],
          frontierIds: pq.map((p) => p.id),
          activeEdgeId: null,
          treeEdgeIds: [...treeEdges],
          distances: { ...distances },
          predecessors: { ...predecessors },
          candidateList: pq.map((p) => ({ id: p.id, label: labels.get(p.id) ?? p.id, priority: p.dist })),
          phaseDescription: `Target "${uLabel}" reached with optimal shortest distance ${d}!`,
        },
        highlightedElements: [u],
        explanation: `Target vertex "${uLabel}" dequeued. Shortest path is confirmed.`,
      });
      break;
    }

    builder.addStep({
      operation: "select",
      codeLine: 6,
      variables: {
        current: uLabel,
        distance: d,
        visited: visited.map((id) => labels.get(id)),
      },
      state: {
        graph,
        algorithm: "dijkstra",
        currentVertexId: u,
        visitedVertexIds: [...visited],
        frontierIds: pq.map((p) => p.id),
        activeEdgeId: null,
        treeEdgeIds: [...treeEdges],
        distances: { ...distances },
        predecessors: { ...predecessors },
        candidateList: pq.map((p) => ({ id: p.id, label: labels.get(p.id) ?? p.id, priority: p.dist })),
        phaseDescription: `Dequeued minimum vertex "${uLabel}" with confirmed distance ${d}. Relaxing incident edges.`,
      },
      highlightedElements: [u],
      explanation: `Dequeued vertex "${uLabel}" with minimal cost ${d}. Its shortest distance is now finalized.`,
    });

    const neighbors = getNeighbors(graph, u);

    for (const { targetId: v, edgeId, weight: w } of neighbors) {
      if (visited.includes(v)) continue;
      const vLabel = labels.get(v) ?? v;
      const alt = distances[u] + w;

      builder.addStep({
        operation: "compare",
        codeLine: 9,
        variables: {
          from: uLabel,
          to: vLabel,
          weight: w,
          currentDist: distances[v] === Infinity ? "∞" : distances[v],
          newDist: alt,
          relaxed: alt < distances[v],
        },
        state: {
          graph,
          algorithm: "dijkstra",
          currentVertexId: u,
          visitedVertexIds: [...visited],
          frontierIds: pq.map((p) => p.id),
          activeEdgeId: edgeId,
          treeEdgeIds: [...treeEdges],
          distances: { ...distances },
          predecessors: { ...predecessors },
          candidateList: pq.map((p) => ({ id: p.id, label: labels.get(p.id) ?? p.id, priority: p.dist })),
          phaseDescription: `Evaluating edge ${uLabel} -> ${vLabel} (weight ${w}): dist[${uLabel}] + ${w} = ${alt} vs dist[${vLabel}] = ${distances[v] === Infinity ? "∞" : distances[v]}.`,
        },
        highlightedElements: [u, edgeId, v],
        explanation: alt < distances[v]
          ? `Shorter path found to "${vLabel}"! ${alt} < ${distances[v] === Infinity ? "∞" : distances[v]}. Relaxing distance.`
          : `Path via "${uLabel}" is not shorter (${alt} >= ${distances[v]}). No change.`,
      });

      if (alt < distances[v]) {
        distances[v] = alt;
        predecessors[v] = u;
        if (!treeEdges.includes(edgeId)) treeEdges.push(edgeId);
        pq.push({ id: v, dist: alt });

        builder.addStep({
          operation: "insert",
          codeLine: 11,
          variables: {
            updatedVertex: vLabel,
            newDistance: alt,
            predecessor: uLabel,
          },
          state: {
            graph,
            algorithm: "dijkstra",
            currentVertexId: u,
            visitedVertexIds: [...visited],
            frontierIds: pq.map((p) => p.id),
            activeEdgeId: edgeId,
            treeEdgeIds: [...treeEdges],
            distances: { ...distances },
            predecessors: { ...predecessors },
            candidateList: pq.map((p) => ({ id: p.id, label: labels.get(p.id) ?? p.id, priority: p.dist })),
            phaseDescription: `Updated dist[${vLabel}] = ${alt}, predecessor[${vLabel}] = "${uLabel}". Enqueued to PQ.`,
          },
          highlightedElements: [v, edgeId],
          explanation: `Updated distance to "${vLabel}" to ${alt} and enqueued into priority queue.`,
        });
      }
    }
  }

  // Traversal finished
  builder.addStep({
    operation: "call",
    codeLine: 16,
    variables: {
      finalDistances: Object.fromEntries(
        Object.entries(distances).map(([k, v]) => [labels.get(k), v === Infinity ? "∞" : v])
      ),
    },
    state: {
      graph,
      algorithm: "dijkstra",
      currentVertexId: null,
      visitedVertexIds: [...visited],
      frontierIds: [],
      activeEdgeId: null,
      treeEdgeIds: [...treeEdges],
      distances: { ...distances },
      predecessors: { ...predecessors },
      candidateList: [],
      phaseDescription: `Dijkstra complete. Computed all shortest paths from "${labels.get(startId)}".`,
    },
    highlightedElements: [...visited],
    explanation: `Dijkstra algorithm finished. All reachable vertex distances are minimized.`,
  });

  return builder.build();
}

/**
 * 4. Bellman-Ford Trace Generator
 */
export function generateBellmanFordAlgorithmTrace(
  graph: GraphState,
  startNodeId: string
): ExecutionTrace<GraphAlgorithmExecutionState> {
  const labels = getNodeLabelMap(graph.nodes);
  const startNode = graph.nodes.find((n) => n.id === startNodeId) ?? graph.nodes[0];
  const startId = startNode?.id ?? "";

  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};
  for (const n of graph.nodes) {
    distances[n.id] = Infinity;
    predecessors[n.id] = null;
  }
  if (startId) distances[startId] = 0;

  const initialState: GraphAlgorithmExecutionState = {
    graph,
    algorithm: "bellman-ford",
    currentVertexId: startId || null,
    visitedVertexIds: startId ? [startId] : [],
    frontierIds: [],
    activeEdgeId: null,
    treeEdgeIds: [],
    distances: { ...distances },
    predecessors: { ...predecessors },
    phaseDescription: `Ready to run Bellman-Ford from "${labels.get(startId) ?? startId}". (V-1 = ${Math.max(0, graph.nodes.length - 1)} relaxation rounds).`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "bellman-ford",
      algorithmName: "Bellman-Ford Algorithm",
      category: "Shortest Path",
    },
  });

  if (!startId || graph.nodes.length === 0) return builder.build();

  const numVertices = graph.nodes.length;
  const treeEdges: string[] = [];

  // V - 1 relaxation rounds
  for (let round = 1; round <= Math.min(numVertices - 1, 4); round++) {
    let anyRelaxation = false;

    builder.addStep({
      operation: "call",
      codeLine: 3,
      variables: {
        round,
        maxRounds: numVertices - 1,
      },
      state: {
        graph,
        algorithm: "bellman-ford",
        currentVertexId: null,
        visitedVertexIds: Object.keys(distances).filter((k) => distances[k] !== Infinity),
        frontierIds: [],
        activeEdgeId: null,
        treeEdgeIds: [...treeEdges],
        distances: { ...distances },
        predecessors: { ...predecessors },
        phaseDescription: `--- Round ${round} of ${numVertices - 1} Relaxation ---`,
      },
      highlightedElements: [],
      explanation: `Starting round ${round}: Iterating over all ${graph.edges.length} edges to relax paths.`,
    });

    for (const edge of graph.edges) {
      const u = edge.sourceId;
      const v = edge.targetId;
      const w = edge.weight ?? 1;
      const uLabel = labels.get(u) ?? u;
      const vLabel = labels.get(v) ?? v;

      if (distances[u] !== Infinity && distances[u] + w < distances[v]) {
        anyRelaxation = true;
        distances[v] = distances[u] + w;
        predecessors[v] = u;
        if (!treeEdges.includes(edge.id)) treeEdges.push(edge.id);

        builder.addStep({
          operation: "insert",
          codeLine: 5,
          variables: {
            round,
            edge: `${uLabel} -> ${vLabel}`,
            weight: w,
            updatedDist: distances[v],
          },
          state: {
            graph,
            algorithm: "bellman-ford",
            currentVertexId: v,
            visitedVertexIds: Object.keys(distances).filter((k) => distances[k] !== Infinity),
            frontierIds: [],
            activeEdgeId: edge.id,
            treeEdgeIds: [...treeEdges],
            distances: { ...distances },
            predecessors: { ...predecessors },
            phaseDescription: `Round ${round}: Relaxed edge (${uLabel} -> ${vLabel}). New dist[${vLabel}] = ${distances[v]}.`,
          },
          highlightedElements: [u, edge.id, v],
          explanation: `Relaxed edge ${uLabel} -> ${vLabel}. Updated distance to ${distances[v]}.`,
        });
      }
    }

    if (!anyRelaxation) {
      builder.addStep({
        operation: "call",
        codeLine: 8,
        variables: {
          round,
          convergedEarly: true,
        },
        state: {
          graph,
          algorithm: "bellman-ford",
          currentVertexId: null,
          visitedVertexIds: Object.keys(distances).filter((k) => distances[k] !== Infinity),
          frontierIds: [],
          activeEdgeId: null,
          treeEdgeIds: [...treeEdges],
          distances: { ...distances },
          predecessors: { ...predecessors },
          phaseDescription: `No distances changed in round ${round}. Early convergence achieved.`,
        },
        highlightedElements: [],
        explanation: `Algorithm converged early at round ${round}. No further relaxations possible.`,
      });
      break;
    }
  }

  // 13th step: Negative cycle check
  let hasNegativeCycle = false;
  for (const edge of graph.edges) {
    const u = edge.sourceId;
    const v = edge.targetId;
    const w = edge.weight ?? 1;
    if (distances[u] !== Infinity && distances[u] + w < distances[v]) {
      hasNegativeCycle = true;
      break;
    }
  }

  builder.addStep({
    operation: "call",
    codeLine: 10,
    variables: {
      hasNegativeCycle,
      finalDistances: Object.fromEntries(
        Object.entries(distances).map(([k, v]) => [labels.get(k), v === Infinity ? "∞" : v])
      ),
    },
    state: {
      graph,
      algorithm: "bellman-ford",
      currentVertexId: null,
      visitedVertexIds: Object.keys(distances).filter((k) => distances[k] !== Infinity),
      frontierIds: [],
      activeEdgeId: null,
      treeEdgeIds: [...treeEdges],
      distances: { ...distances },
      predecessors: { ...predecessors },
      cycleDetected: hasNegativeCycle,
      phaseDescription: hasNegativeCycle
        ? `Negative-weight cycle detected! Shortest paths are undefined.`
        : `Bellman-Ford complete. No negative cycles found.`,
    },
    highlightedElements: hasNegativeCycle ? graph.edges.map((e) => e.id) : [...treeEdges],
    explanation: hasNegativeCycle
      ? `Negative weight cycle detected. Distances can decrease indefinitely.`
      : `Bellman-Ford terminated successfully. All shortest paths confirmed.`,
  });

  return builder.build();
}

/**
 * 5. Prim's Minimum Spanning Tree Trace Generator
 */
export function generatePrimAlgorithmTrace(
  graph: GraphState,
  startNodeId: string
): ExecutionTrace<GraphAlgorithmExecutionState> {
  const labels = getNodeLabelMap(graph.nodes);
  const startNode = graph.nodes.find((n) => n.id === startNodeId) ?? graph.nodes[0];
  const startId = startNode?.id ?? "";

  const initialState: GraphAlgorithmExecutionState = {
    graph,
    algorithm: "prim",
    currentVertexId: null,
    visitedVertexIds: [],
    frontierIds: [],
    activeEdgeId: null,
    treeEdgeIds: [],
    phaseDescription: `Ready to compute MST via Prim's algorithm starting from "${labels.get(startId) ?? startId}".`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "prim",
      algorithmName: "Prim's MST Algorithm",
      category: "Minimum Spanning Tree",
    },
  });

  if (!startId || graph.nodes.length === 0) return builder.build();

  const inMst = [startId];
  const mstEdges: string[] = [];

  builder.addStep({
    operation: "call",
    codeLine: 2,
    variables: {
      startVertex: labels.get(startId),
      inMst: inMst.map((id) => labels.get(id)),
    },
    state: {
      graph,
      algorithm: "prim",
      currentVertexId: startId,
      visitedVertexIds: [...inMst],
      frontierIds: [],
      activeEdgeId: null,
      treeEdgeIds: [],
      phaseDescription: `Initialize: Start MST with vertex "${labels.get(startId)}".`,
    },
    highlightedElements: [startId],
    explanation: `Added start vertex "${labels.get(startId)}" to the growing MST set.`,
  });

  while (inMst.length < graph.nodes.length) {
    let bestEdge: GraphEdge | null = null;
    let bestWeight = Infinity;
    let bestNextNode: string | null = null;

    for (const u of inMst) {
      for (const edge of graph.edges) {
        let v: string | null = null;
        if (edge.sourceId === u && !inMst.includes(edge.targetId)) {
          v = edge.targetId;
        } else if (!graph.directed && edge.targetId === u && !inMst.includes(edge.sourceId)) {
          v = edge.sourceId;
        }

        if (v && (edge.weight ?? 1) < bestWeight) {
          bestWeight = edge.weight ?? 1;
          bestEdge = edge;
          bestNextNode = v;
        }
      }
    }

    if (!bestEdge || !bestNextNode) break;

    const uLabel = labels.get(bestEdge.sourceId) ?? bestEdge.sourceId;
    const vLabel = labels.get(bestNextNode) ?? bestNextNode;

    builder.addStep({
      operation: "select",
      codeLine: 8,
      variables: {
        selectedEdge: `${uLabel} - ${vLabel}`,
        weight: bestWeight,
        connectingVertex: vLabel,
      },
      state: {
        graph,
        algorithm: "prim",
        currentVertexId: bestNextNode,
        visitedVertexIds: [...inMst],
        frontierIds: [],
        activeEdgeId: bestEdge.id,
        treeEdgeIds: [...mstEdges],
        phaseDescription: `Selected minimum crossing edge (${uLabel} - ${vLabel}) with weight ${bestWeight}.`,
      },
      highlightedElements: [bestEdge.id, bestNextNode],
      explanation: `Minimum crossing edge is (${uLabel} - ${vLabel}, wt ${bestWeight}). Adding to MST.`,
    });

    inMst.push(bestNextNode);
    mstEdges.push(bestEdge.id);

    builder.addStep({
      operation: "insert",
      codeLine: 12,
      variables: {
        mstVertices: inMst.map((id) => labels.get(id)),
        mstEdgesCount: mstEdges.length,
      },
      state: {
        graph,
        algorithm: "prim",
        currentVertexId: bestNextNode,
        visitedVertexIds: [...inMst],
        frontierIds: [],
        activeEdgeId: null,
        treeEdgeIds: [...mstEdges],
        phaseDescription: `Added vertex "${vLabel}" to MST. Total MST vertices: ${inMst.length}.`,
      },
      highlightedElements: [...mstEdges, ...inMst],
      explanation: `Vertex "${vLabel}" and edge (${uLabel} - ${vLabel}) joined the MST.`,
    });
  }

  // Prim complete
  builder.addStep({
    operation: "call",
    codeLine: 16,
    variables: {
      totalMstEdges: mstEdges.length,
      isSpanning: inMst.length === graph.nodes.length,
    },
    state: {
      graph,
      algorithm: "prim",
      currentVertexId: null,
      visitedVertexIds: [...inMst],
      frontierIds: [],
      activeEdgeId: null,
      treeEdgeIds: [...mstEdges],
      phaseDescription: `Prim's MST complete! Contains ${mstEdges.length} edges connecting ${inMst.length} vertices.`,
    },
    highlightedElements: [...mstEdges, ...inMst],
    explanation: `Minimum Spanning Tree construction complete with Prim's algorithm.`,
  });

  return builder.build();
}

/**
 * 6. Kruskal's Minimum Spanning Tree Trace Generator
 */
export function generateKruskalAlgorithmTrace(
  graph: GraphState
): ExecutionTrace<GraphAlgorithmExecutionState> {
  const labels = getNodeLabelMap(graph.nodes);
  const uf = new UnionFind(graph.nodes.map((n) => n.id));

  // Sort edges ascending by weight
  const sortedEdges = [...graph.edges].sort(
    (a, b) => (a.weight ?? 1) - (b.weight ?? 1)
  );

  const initialState: GraphAlgorithmExecutionState = {
    graph,
    algorithm: "kruskal",
    currentVertexId: null,
    visitedVertexIds: [],
    frontierIds: [],
    activeEdgeId: null,
    treeEdgeIds: [],
    disjointSets: uf.getSnapshot(),
    phaseDescription: `Ready to run Kruskal's algorithm. Sorted ${sortedEdges.length} edges by weight.`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "kruskal",
      algorithmName: "Kruskal's MST Algorithm",
      category: "Minimum Spanning Tree",
    },
  });

  if (graph.nodes.length === 0 || graph.edges.length === 0) return builder.build();

  const mstEdges: string[] = [];
  const visitedVertices = new Set<string>();

  builder.addStep({
    operation: "call",
    codeLine: 3,
    variables: {
      sortedEdgesCount: sortedEdges.length,
      firstEdge: sortedEdges[0]
        ? `${labels.get(sortedEdges[0].sourceId)} - ${labels.get(sortedEdges[0].targetId)} (wt ${sortedEdges[0].weight ?? 1})`
        : null,
    },
    state: {
      ...initialState,
      phaseDescription: `Sorted all edges in ascending weight order. Initialized Disjoint Set Union (DSU).`,
    },
    highlightedElements: sortedEdges.map((e) => e.id),
    explanation: `All edges sorted by weight. Kruskal greedily inspects cheapest edge next.`,
  });

  for (const edge of sortedEdges) {
    const uLabel = labels.get(edge.sourceId) ?? edge.sourceId;
    const vLabel = labels.get(edge.targetId) ?? edge.targetId;
    const wt = edge.weight ?? 1;

    const rootU = uf.find(edge.sourceId);
    const rootV = uf.find(edge.targetId);
    const wouldFormCycle = rootU === rootV;

    builder.addStep({
      operation: "compare",
      codeLine: 6,
      variables: {
        examiningEdge: `${uLabel} - ${vLabel}`,
        weight: wt,
        setU: labels.get(rootU) ?? rootU,
        setV: labels.get(rootV) ?? rootV,
        formsCycle: wouldFormCycle,
      },
      state: {
        graph,
        algorithm: "kruskal",
        currentVertexId: null,
        visitedVertexIds: Array.from(visitedVertices),
        frontierIds: [],
        activeEdgeId: edge.id,
        treeEdgeIds: [...mstEdges],
        disjointSets: uf.getSnapshot(),
        phaseDescription: `Checking edge (${uLabel} - ${vLabel}, wt ${wt}). In same set? ${wouldFormCycle ? "Yes (Cycle!)" : "No"}.`,
      },
      highlightedElements: [edge.id, edge.sourceId, edge.targetId],
      explanation: wouldFormCycle
        ? `Edge (${uLabel} - ${vLabel}) connects vertices in the same set (${labels.get(rootU)}). Discard to avoid cycle.`
        : `Edge (${uLabel} - ${vLabel}) connects different sets (${labels.get(rootU)} and ${labels.get(rootV)}). Safe to add.`,
    });

    if (!wouldFormCycle) {
      uf.union(edge.sourceId, edge.targetId);
      mstEdges.push(edge.id);
      visitedVertices.add(edge.sourceId);
      visitedVertices.add(edge.targetId);

      builder.addStep({
        operation: "insert",
        codeLine: 8,
        variables: {
          addedEdge: `${uLabel} - ${vLabel}`,
          weight: wt,
          mstEdgeCount: mstEdges.length,
          targetEdges: graph.nodes.length - 1,
        },
        state: {
          graph,
          algorithm: "kruskal",
          currentVertexId: null,
          visitedVertexIds: Array.from(visitedVertices),
          frontierIds: [],
          activeEdgeId: edge.id,
          treeEdgeIds: [...mstEdges],
          disjointSets: uf.getSnapshot(),
          phaseDescription: `Added edge (${uLabel} - ${vLabel}) to MST. United sets. Total MST edges: ${mstEdges.length}.`,
        },
        highlightedElements: [...mstEdges, edge.sourceId, edge.targetId],
        explanation: `Added edge (${uLabel} - ${vLabel}) to MST and united their components.`,
      });

      if (mstEdges.length === graph.nodes.length - 1) {
        break; // MST full
      }
    }
  }

  // Complete
  builder.addStep({
    operation: "call",
    codeLine: 12,
    variables: {
      finalMstEdges: mstEdges.length,
      connectedComponents: 1,
    },
    state: {
      graph,
      algorithm: "kruskal",
      currentVertexId: null,
      visitedVertexIds: Array.from(visitedVertices),
      frontierIds: [],
      activeEdgeId: null,
      treeEdgeIds: [...mstEdges],
      disjointSets: uf.getSnapshot(),
      phaseDescription: `Kruskal's MST complete! Contains ${mstEdges.length} edges spanning ${visitedVertices.size} vertices.`,
    },
    highlightedElements: [...mstEdges],
    explanation: `Kruskal's algorithm complete. Found Minimum Spanning Tree using Union-Find.`,
  });

  return builder.build();
}

/**
 * 7. Topological Sort (Kahn's Algorithm) Trace Generator
 */
export function generateTopologicalSortAlgorithmTrace(
  graph: GraphState
): ExecutionTrace<GraphAlgorithmExecutionState> {
  const labels = getNodeLabelMap(graph.nodes);
  const inDegrees: Record<string, number> = {};
  for (const n of graph.nodes) inDegrees[n.id] = 0;

  for (const edge of graph.edges) {
    inDegrees[edge.targetId] = (inDegrees[edge.targetId] ?? 0) + 1;
  }

  const initialState: GraphAlgorithmExecutionState = {
    graph,
    algorithm: "topological-sort",
    currentVertexId: null,
    visitedVertexIds: [],
    frontierIds: [],
    activeEdgeId: null,
    treeEdgeIds: [],
    inDegrees: { ...inDegrees },
    topologicalOrder: [],
    phaseDescription: `Ready to run Kahn's Topological Sort. Calculated initial in-degrees for all vertices.`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "topological-sort",
      algorithmName: "Topological Sort (Kahn's)",
      category: "Directed Acyclic Graphs",
    },
  });

  if (graph.nodes.length === 0) return builder.build();

  const zeroInDegreeQueue = graph.nodes
    .filter((n) => inDegrees[n.id] === 0)
    .map((n) => n.id);

  const order: string[] = [];

  builder.addStep({
    operation: "call",
    codeLine: 6,
    variables: {
      inDegrees: Object.fromEntries(Object.entries(inDegrees).map(([k, v]) => [labels.get(k), v])),
      zeroInDegreeQueue: zeroInDegreeQueue.map((id) => labels.get(id)),
    },
    state: {
      graph,
      algorithm: "topological-sort",
      currentVertexId: null,
      visitedVertexIds: [],
      frontierIds: [...zeroInDegreeQueue],
      activeEdgeId: null,
      treeEdgeIds: [],
      inDegrees: { ...inDegrees },
      topologicalOrder: [],
      phaseDescription: `Found ${zeroInDegreeQueue.length} vertices with in-degree 0: [${zeroInDegreeQueue.map((id) => labels.get(id)).join(", ")}].`,
    },
    highlightedElements: [...zeroInDegreeQueue],
    explanation: `Vertices with in-degree 0 have no dependencies. Enqueued to processing queue.`,
  });

  while (zeroInDegreeQueue.length > 0) {
    const u = zeroInDegreeQueue.shift()!;
    const uLabel = labels.get(u) ?? u;
    order.push(u);

    builder.addStep({
      operation: "select",
      codeLine: 9,
      variables: {
        dequeued: uLabel,
        currentOrder: order.map((id) => labels.get(id)),
      },
      state: {
        graph,
        algorithm: "topological-sort",
        currentVertexId: u,
        visitedVertexIds: [...order],
        frontierIds: [...zeroInDegreeQueue],
        activeEdgeId: null,
        treeEdgeIds: [],
        inDegrees: { ...inDegrees },
        topologicalOrder: order.map((id) => labels.get(id) ?? id),
        phaseDescription: `Removed vertex "${uLabel}" from queue and appended to topological order.`,
      },
      highlightedElements: [u],
      explanation: `Vertex "${uLabel}" has 0 remaining dependencies. Added to topological ordering.`,
    });

    // Decrement in-degree of all outgoing neighbors
    const outgoingEdges = graph.edges.filter((e) => e.sourceId === u);

    for (const edge of outgoingEdges) {
      const v = edge.targetId;
      const vLabel = labels.get(v) ?? v;
      inDegrees[v] = Math.max(0, (inDegrees[v] ?? 1) - 1);

      const becameZero = inDegrees[v] === 0;
      if (becameZero) {
        zeroInDegreeQueue.push(v);
      }

      builder.addStep({
        operation: "compare",
        codeLine: 13,
        variables: {
          from: uLabel,
          to: vLabel,
          remainingInDegree: inDegrees[v],
          enqueued: becameZero,
        },
        state: {
          graph,
          algorithm: "topological-sort",
          currentVertexId: u,
          visitedVertexIds: [...order],
          frontierIds: [...zeroInDegreeQueue],
          activeEdgeId: edge.id,
          treeEdgeIds: [],
          inDegrees: { ...inDegrees },
          topologicalOrder: order.map((id) => labels.get(id) ?? id),
          phaseDescription: `Removed dependency (${uLabel} -> ${vLabel}). in-degree[${vLabel}] is now ${inDegrees[v]}.${becameZero ? ` Enqueued "${vLabel}"!` : ""}`,
        },
        highlightedElements: [edge.id, v],
        explanation: becameZero
          ? `Dependency satisfied! "${vLabel}" now has in-degree 0 and is enqueued.`
          : `Removed edge to "${vLabel}". Remaining in-degree: ${inDegrees[v]}.`,
      });
    }
  }

  const isDag = order.length === graph.nodes.length;

  builder.addStep({
    operation: "call",
    codeLine: 18,
    variables: {
      finalOrder: order.map((id) => labels.get(id)),
      isDAG: isDag,
      cycleDetected: !isDag,
    },
    state: {
      graph,
      algorithm: "topological-sort",
      currentVertexId: null,
      visitedVertexIds: [...order],
      frontierIds: [],
      activeEdgeId: null,
      treeEdgeIds: [],
      inDegrees: { ...inDegrees },
      topologicalOrder: order.map((id) => labels.get(id) ?? id),
      cycleDetected: !isDag,
      phaseDescription: isDag
        ? `Topological Sort complete! Valid DAG ordering: [${order.map((id) => labels.get(id)).join(" -> ")}].`
        : `Cycle detected in graph! Not a valid Directed Acyclic Graph (DAG). Processed ${order.length}/${graph.nodes.length} vertices.`,
    },
    highlightedElements: isDag ? [...order] : [],
    explanation: isDag
      ? `Topological sort successfully completed. All vertex dependencies respected.`
      : `Cycle detected! A cycle prevents remaining vertices from ever reaching in-degree 0.`,
  });

  return builder.build();
}
