/**
 * Linked List Operation Trace Generators
 *
 * Implements deterministic execution trace generators for Singly, Doubly, and Circular linked lists.
 * Invariants:
 * 1. Stable Node IDs are strictly preserved across updates, movements, and reversals.
 * 2. Circular operations always terminate deterministically (stopping upon returning to HEAD).
 * 3. Every step provides synchronized codeLine, variables, pointer metadata, and explanations.
 */

import type { ExecutionTrace } from "@/core/execution/types";
import { createExecutionTrace } from "@/core/execution/trace/trace-builder";
import type { LinkedListNode, LinkedListState, LinkedListOperationType } from "./types";
import { generateNodeId } from "./validation";

/**
 * Helper to build an updated LinkedListState snapshot.
 */
function cloneAndFreezeState(
  nodes: readonly LinkedListNode[],
  headId: string | null,
  tailId: string | null,
  nextMap: Record<string, string | null>,
  prevMap?: Record<string, string | null>,
  variant: LinkedListState["variant"] = "singly"
): LinkedListState {
  return Object.freeze({
    nodes: Object.freeze([...nodes]),
    headId,
    tailId,
    next: Object.freeze({ ...nextMap }),
    previous: prevMap ? Object.freeze({ ...prevMap }) : undefined,
    variant,
  });
}

/**
 * Derives the next deterministic node ID based on existing nodes.
 */
function getNextNodeId(nodes: readonly LinkedListNode[]): string {
  let maxId = 0;
  for (const node of nodes) {
    const match = node.id.match(/\d+$/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num > maxId) maxId = num;
    }
  }
  return generateNodeId(maxId + 1);
}

/**
 * 1. TRAVERSAL TRACE GENERATOR
 * Handles Singly, Doubly, and Circular linked lists with guaranteed deterministic termination.
 */
export function createTraversalTrace(state: LinkedListState): ExecutionTrace<LinkedListState> {
  const builder = createExecutionTrace<LinkedListState>({
    initialState: state,
    metadata: {
      algorithmId: "linked-list-traverse",
      algorithmName: "Linked List Traversal",
      category: "Traversal & Search",
      complexity: { time: "O(n)", space: "O(1)" },
    },
  });

  // Step 0: Initial state
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { headId: state.headId, variant: state.variant },
    state,
    highlightedElements: [],
    explanation: `Starting ${state.variant} linked list traversal from HEAD.`,
  });

  if (!state.headId || state.nodes.length === 0) {
    builder.addStep({
      operation: "return",
      codeLine: 2,
      variables: { current: null },
      state,
      highlightedElements: [],
      explanation: "List is empty (HEAD points to null). Traversal complete.",
    });
    return builder.build();
  }

  let currentId: string | null = state.headId;
  let position = 0;
  const isCircular = state.variant === "circular";
  let hasVisitedHead = false;

  // Traversal loop with mandatory termination safeguard
  const MAX_STEPS = state.nodes.length + 2;
  let iterations = 0;

  while (currentId !== null && iterations < MAX_STEPS) {
    iterations++;
    const currentNode = state.nodes.find((n) => n.id === currentId);
    if (!currentNode) break;

    // In circular list, if we return to head after visiting at least 1 node, terminate safely
    if (isCircular && hasVisitedHead && currentId === state.headId) {
      builder.addStep({
        operation: "custom",
        codeLine: 4,
        variables: { current: currentId, position, returnedToHead: true },
        state,
        highlightedElements: [currentId],
        metadata: {
          pointers: [{ index: 0, label: "HEAD (loop complete)" }],
        },
        explanation:
          "Because this is a circular linked list, the last node points back to HEAD instead of null. Traversal stops cleanly to prevent an infinite loop.",
      });
      break;
    }

    hasVisitedHead = true;
    const nextId: string | null = state.next[currentId] ?? null;

    // Step: Visit current node
    builder.addStep({
      operation: "visit",
      codeLine: 3,
      variables: {
        current: currentId,
        value: currentNode.value,
        position,
        next: nextId,
      },
      state,
      highlightedElements: [currentId],
      metadata: {
        pointers: [{ index: position, label: "current" }],
      },
      explanation: `Visit node at position ${position} (value: ${currentNode.value}, ID: "${currentId}"). Following next pointer to "${nextId ?? "null"}".`,
    });

    currentId = nextId;
    position++;
  }

  // Final Step: Reached termination
  if (!isCircular) {
    builder.addStep({
      operation: "return",
      codeLine: 4,
      variables: { current: null, totalVisited: state.nodes.length },
      state,
      highlightedElements: [],
      explanation: "Current pointer reached null. Traversal complete across all nodes.",
    });
  }

  return builder.build();
}

/**
 * 2. SEARCH TRACE GENERATOR
 */
export function createSearchTrace(
  state: LinkedListState,
  target: number
): ExecutionTrace<LinkedListState> {
  const builder = createExecutionTrace<LinkedListState>({
    initialState: state,
    metadata: {
      algorithmId: "linked-list-search",
      algorithmName: "Linked List Search",
      category: "Traversal & Search",
      complexity: { time: "O(n)", space: "O(1)" },
    },
  });

  // Step 0: Initial state
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { target, headId: state.headId },
    state,
    highlightedElements: [],
    explanation: `Searching for target value ${target} in ${state.variant} linked list.`,
  });

  if (!state.headId || state.nodes.length === 0) {
    builder.addStep({
      operation: "return",
      codeLine: 7,
      variables: { target, result: -1 },
      state,
      highlightedElements: [],
      explanation: `List is empty. Target ${target} not found. Returning -1.`,
    });
    return builder.build();
  }

  let currentId: string | null = state.headId;
  let position = 0;
  let found = false;
  let hasVisitedHead = false;

  while (currentId !== null) {
    const currentNode = state.nodes.find((n) => n.id === currentId);
    if (!currentNode) break;

    // Circular termination check
    if (state.variant === "circular" && hasVisitedHead && currentId === state.headId) {
      break;
    }
    hasVisitedHead = true;

    const isMatch = currentNode.value === target;

    // Step: Compare current node value with target
    builder.addStep({
      operation: "compare",
      codeLine: 4,
      variables: {
        current: currentId,
        currentValue: currentNode.value,
        target,
        position,
        isMatch,
      },
      state,
      highlightedElements: [currentId],
      metadata: {
        pointers: [{ index: position, label: "current" }],
      },
      explanation: `Compare node at position ${position}: ${currentNode.value} == ${target}. ${
        isMatch ? "Match found!" : "Not a match. Advance to next node."
      }`,
    });

    if (isMatch) {
      found = true;
      builder.addStep({
        operation: "found",
        codeLine: 5,
        variables: { target, foundPosition: position, nodeId: currentId, current: currentId, found: true },
        state,
        highlightedElements: [currentId],
        metadata: {
          pointers: [{ index: position, label: "found!" }],
        },
        explanation: `Found target value ${target} at position ${position} (ID: "${currentId}")!`,
      });
      break;
    }

    currentId = state.next[currentId] ?? null;
    position++;
  }

  if (!found) {
    const isCircular = state.variant === "circular";
    builder.addStep({
      operation: "return",
      codeLine: 7,
      variables: { target, result: -1, found: false, totalScanned: state.nodes.length },
      state,
      highlightedElements: [],
      explanation: isCircular
        ? `Completed full cycle back to HEAD without finding target value ${target}. Stopping search.`
        : `Target value ${target} is NOT present in the linked list. Returning -1.`,
    });
  }

  return builder.build();
}

/**
 * 3. ACCESS BY POSITION TRACE GENERATOR
 */
export function createAccessTrace(
  state: LinkedListState,
  position: number
): ExecutionTrace<LinkedListState> {
  const builder = createExecutionTrace<LinkedListState>({
    initialState: state,
    metadata: {
      algorithmId: "linked-list-access",
      algorithmName: "Linked List Access",
      category: "Traversal & Search",
      complexity: { time: "O(n)", space: "O(1)" },
    },
  });

  const n = state.nodes.length;
  if (position < 0 || position >= n) {
    builder.addStep({
      operation: "custom",
      codeLine: 1,
      variables: { position, length: n, error: "Index out of bounds" },
      state,
      highlightedElements: [],
      explanation: `Position ${position} is out of bounds for list of length ${n}.`,
    });
    return builder.build();
  }

  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { position, length: n },
    state,
    highlightedElements: [],
    explanation: `Beginning sequential traversal from HEAD to access node at position ${position}.`,
  });

  let currentId: string | null = state.headId;

  for (let i = 0; i <= position; i++) {
    const currentNode = state.nodes.find((node) => node.id === currentId)!;
    const isTarget = i === position;

    builder.addStep({
      operation: isTarget ? "select" : "visit",
      codeLine: 3,
      variables: { currentPosition: i, targetPosition: position, value: currentNode.value },
      state,
      highlightedElements: [currentNode.id],
      metadata: {
        pointers: [{ index: i, label: isTarget ? "target" : "current" }],
      },
      explanation: isTarget
        ? `Reached target position ${position}. Value is ${currentNode.value}.`
        : `At position ${i} (value: ${currentNode.value}). Advancing pointer.`,
    });

    if (isTarget) {
      builder.addStep({
        operation: "return",
        codeLine: 4,
        variables: { position, returnedValue: currentNode.value },
        state,
        highlightedElements: [currentNode.id],
        explanation: `Access complete: Returned value ${currentNode.value} at position ${position}.`,
      });
      break;
    }

    currentId = state.next[currentId!] ?? null;
  }

  return builder.build();
}

/**
 * 4. INSERT AT BEGINNING TRACE GENERATOR
 */
export function createInsertAtBeginningTrace(
  state: LinkedListState,
  value: number
): ExecutionTrace<LinkedListState> {
  const builder = createExecutionTrace<LinkedListState>({
    initialState: state,
    metadata: {
      algorithmId: "linked-list-insert-beginning",
      algorithmName: "Insert at Beginning",
      category: "Insertion",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  const newId = getNextNodeId(state.nodes);
  const newNode: LinkedListNode = { id: newId, value };

  // Step 0: Initial state
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { value, currentHead: state.headId },
    state,
    highlightedElements: [],
    explanation: `Preparing to insert value ${value} at the beginning of the list.`,
  });

  // Step 1: Create new node
  builder.addStep({
    operation: "insert",
    codeLine: 2,
    variables: { newNodeId: newId, value },
    state,
    highlightedElements: [],
    explanation: `Allocated new node "${newId}" with value ${value}.`,
  });

  // Step 2: Wire pointers
  const nextMap = { ...state.next };
  const prevMap = state.previous ? { ...state.previous } : undefined;

  nextMap[newId] = state.headId;

  if (prevMap && state.headId) {
    prevMap[state.headId] = newId;
    prevMap[newId] = null;
  }

  let tailId = state.tailId;
  if (!tailId) {
    tailId = newId;
  }

  if (state.variant === "circular") {
    nextMap[tailId] = newId;
  }

  const updatedNodes = [newNode, ...state.nodes];
  const intermediateState = cloneAndFreezeState(
    updatedNodes,
    state.headId,
    tailId,
    nextMap,
    prevMap,
    state.variant
  );

  builder.addStep({
    operation: "custom",
    codeLine: 3,
    variables: { newNodeId: newId, pointsTo: state.headId },
    state: intermediateState,
    highlightedElements: [newId],
    metadata: {
      pointers: [{ index: 0, label: "new" }],
    },
    explanation: `Set new_node.next to point to old HEAD ("${state.headId ?? "null"}").`,
  });

  // Step 3: Update HEAD to new node
  const finalState = cloneAndFreezeState(
    updatedNodes,
    newId,
    tailId,
    nextMap,
    prevMap,
    state.variant
  );

  builder.addStep({
    operation: "insert",
    codeLine: 4,
    variables: { newHead: newId, totalNodes: updatedNodes.length },
    state: finalState,
    highlightedElements: [newId],
    metadata: {
      pointers: [{ index: 0, label: "HEAD" }],
    },
    explanation: `Updated HEAD pointer to point to the new node "${newId}". Insertion complete in O(1) time.`,
  });

  return builder.build();
}

/**
 * 5. INSERT AT END TRACE GENERATOR
 */
export function createInsertAtEndTrace(
  state: LinkedListState,
  value: number
): ExecutionTrace<LinkedListState> {
  const builder = createExecutionTrace<LinkedListState>({
    initialState: state,
    metadata: {
      algorithmId: "linked-list-insert-end",
      algorithmName: "Insert at End",
      category: "Insertion",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  if (!state.headId || state.nodes.length === 0) {
    return createInsertAtBeginningTrace(state, value);
  }

  const newId = getNextNodeId(state.nodes);
  const newNode: LinkedListNode = { id: newId, value };

  // Step 0: Initial state
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { value, currentTail: state.tailId },
    state,
    highlightedElements: [],
    explanation: `Preparing to append value ${value} to TAIL ("${state.tailId}").`,
  });

  // Step 1: Create node
  builder.addStep({
    operation: "insert",
    codeLine: 2,
    variables: { newNodeId: newId, value },
    state,
    highlightedElements: [],
    explanation: `Allocated new node "${newId}" with value ${value}.`,
  });

  // Step 2: Connect old tail to new node
  const oldTailId = state.tailId!;
  const nextMap = { ...state.next };
  const prevMap = state.previous ? { ...state.previous } : undefined;

  nextMap[oldTailId] = newId;
  nextMap[newId] = state.variant === "circular" ? state.headId : null;

  if (prevMap) {
    prevMap[newId] = oldTailId;
  }

  const updatedNodes = [...state.nodes, newNode];
  const intermediateState = cloneAndFreezeState(
    updatedNodes,
    state.headId,
    state.tailId,
    nextMap,
    prevMap,
    state.variant
  );

  builder.addStep({
    operation: "custom",
    codeLine: 4,
    variables: { oldTail: oldTailId, newNext: newId },
    state: intermediateState,
    highlightedElements: [oldTailId, newId],
    metadata: {
      pointers: [{ index: updatedNodes.length - 1, label: "new" }],
    },
    explanation: `Connected old tail "${oldTailId}".next to point to new node "${newId}".`,
  });

  // Step 3: Update TAIL pointer
  const finalState = cloneAndFreezeState(
    updatedNodes,
    state.headId,
    newId,
    nextMap,
    prevMap,
    state.variant
  );

  builder.addStep({
    operation: "insert",
    codeLine: 5,
    variables: { newTail: newId, totalNodes: updatedNodes.length },
    state: finalState,
    highlightedElements: [newId],
    metadata: {
      pointers: [{ index: updatedNodes.length - 1, label: "TAIL" }],
    },
    explanation: `Updated TAIL pointer to new node "${newId}". Append complete in O(1) time.`,
  });

  return builder.build();
}

/**
 * 6. INSERT AT POSITION TRACE GENERATOR
 */
export function createInsertAtPositionTrace(
  state: LinkedListState,
  position: number,
  value: number
): ExecutionTrace<LinkedListState> {
  if (position <= 0 || state.nodes.length === 0) {
    return createInsertAtBeginningTrace(state, value);
  }
  if (position >= state.nodes.length) {
    return createInsertAtEndTrace(state, value);
  }

  const builder = createExecutionTrace<LinkedListState>({
    initialState: state,
    metadata: {
      algorithmId: "linked-list-insert-position",
      algorithmName: "Insert at Position",
      category: "Insertion",
      complexity: { time: "O(n)", space: "O(1)" },
    },
  });

  const newId = getNextNodeId(state.nodes);
  const newNode: LinkedListNode = { id: newId, value };

  // Step 0: Initial state
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { position, value },
    state,
    highlightedElements: [],
    explanation: `Preparing to insert value ${value} at position ${position}.`,
  });

  // Step 1: Traverse to position - 1
  const prevNode = state.nodes[position - 1];
  const nextNode = state.nodes[position];

  builder.addStep({
    operation: "visit",
    codeLine: 4,
    variables: { predecessorId: prevNode.id, predecessorPos: position - 1 },
    state,
    highlightedElements: [prevNode.id],
    metadata: {
      pointers: [{ index: position - 1, label: "prev" }],
    },
    explanation: `Traversed to predecessor node at position ${position - 1} (value: ${prevNode.value}).`,
  });

  // Step 2: Splice pointers
  const nextMap = { ...state.next };
  const prevMap = state.previous ? { ...state.previous } : undefined;

  nextMap[newId] = nextNode.id;
  nextMap[prevNode.id] = newId;

  if (prevMap) {
    prevMap[newId] = prevNode.id;
    prevMap[nextNode.id] = newId;
  }

  const updatedNodes = [...state.nodes];
  updatedNodes.splice(position, 0, newNode);

  const finalState = cloneAndFreezeState(
    updatedNodes,
    state.headId,
    state.tailId,
    nextMap,
    prevMap,
    state.variant
  );

  builder.addStep({
    operation: "insert",
    codeLine: 5,
    variables: { newNodeId: newId, nextNodeId: nextNode.id },
    state: finalState,
    highlightedElements: [newId],
    metadata: {
      pointers: [
        { index: position - 1, label: "prev" },
        { index: position, label: "inserted" },
      ],
    },
    explanation: `Set new_node.next = "${nextNode.id}" and prev.next = "${newId}". Node spliced into list at position ${position}.`,
  });

  return builder.build();
}

/**
 * 7. DELETE FROM BEGINNING TRACE GENERATOR
 */
export function createDeleteAtBeginningTrace(
  state: LinkedListState
): ExecutionTrace<LinkedListState> {
  const builder = createExecutionTrace<LinkedListState>({
    initialState: state,
    metadata: {
      algorithmId: "linked-list-delete-beginning",
      algorithmName: "Delete from Beginning",
      category: "Deletion",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  if (!state.headId || state.nodes.length === 0) {
    builder.addStep({
      operation: "custom",
      codeLine: 1,
      variables: { error: "List empty" },
      state,
      highlightedElements: [],
      explanation: "Cannot delete from an empty list.",
    });
    return builder.build();
  }

  const oldHeadId = state.headId;
  const oldHeadNode = state.nodes[0];
  const newHeadId = state.next[oldHeadId] ?? null;

  // Step 0: Identify HEAD for removal
  builder.addStep({
    operation: "delete",
    codeLine: 2,
    variables: { headId: oldHeadId, value: oldHeadNode.value },
    state,
    highlightedElements: [oldHeadId],
    metadata: {
      pointers: [{ index: 0, label: "HEAD (delete)" }],
    },
    explanation: `Identified HEAD node "${oldHeadId}" (value: ${oldHeadNode.value}) for removal.`,
  });

  // Step 1: Update pointers
  const nextMap = { ...state.next };
  const prevMap = state.previous ? { ...state.previous } : undefined;
  delete nextMap[oldHeadId];

  if (prevMap) {
    delete prevMap[oldHeadId];
    if (newHeadId) {
      prevMap[newHeadId] = null;
    }
  }

  let tailId = state.tailId;
  if (oldHeadId === tailId) {
    tailId = null;
  } else if (state.variant === "circular" && tailId && newHeadId) {
    nextMap[tailId] = newHeadId;
  }

  const remainingNodes = state.nodes.slice(1);
  const finalState = cloneAndFreezeState(
    remainingNodes,
    newHeadId,
    tailId,
    nextMap,
    prevMap,
    state.variant
  );

  builder.addStep({
    operation: "delete",
    codeLine: 4,
    variables: { removedNodeId: oldHeadId, newHead: newHeadId },
    state: finalState,
    highlightedElements: newHeadId ? [newHeadId] : [],
    explanation: `Advanced HEAD to next node ("${newHeadId ?? "null"}"). Node "${oldHeadId}" removed in O(1) time.`,
  });

  return builder.build();
}

/**
 * 8. DELETE FROM END TRACE GENERATOR
 */
export function createDeleteAtEndTrace(state: LinkedListState): ExecutionTrace<LinkedListState> {
  const n = state.nodes.length;
  if (n <= 1) {
    return createDeleteAtBeginningTrace(state);
  }

  const builder = createExecutionTrace<LinkedListState>({
    initialState: state,
    metadata: {
      algorithmId: "linked-list-delete-end",
      algorithmName: "Delete from End",
      category: "Deletion",
      complexity: {
        time: state.variant === "doubly" ? "O(1)" : "O(n)",
        space: "O(1)",
      },
    },
  });

  const oldTailNode = state.nodes[n - 1];
  const newTailNode = state.nodes[n - 2];

  // Step 0: Initial state
  builder.addStep({
    operation: "delete",
    codeLine: 2,
    variables: { tailId: oldTailNode.id, value: oldTailNode.value },
    state,
    highlightedElements: [oldTailNode.id],
    metadata: {
      pointers: [{ index: n - 1, label: "TAIL (delete)" }],
    },
    explanation: `Identified TAIL node "${oldTailNode.id}" (value: ${oldTailNode.value}) for removal.`,
  });

  // Step 1: Update pointers
  const nextMap = { ...state.next };
  const prevMap = state.previous ? { ...state.previous } : undefined;

  delete nextMap[oldTailNode.id];
  nextMap[newTailNode.id] = state.variant === "circular" ? state.headId : null;

  if (prevMap) {
    delete prevMap[oldTailNode.id];
  }

  const remainingNodes = state.nodes.slice(0, n - 1);
  const finalState = cloneAndFreezeState(
    remainingNodes,
    state.headId,
    newTailNode.id,
    nextMap,
    prevMap,
    state.variant
  );

  builder.addStep({
    operation: "delete",
    codeLine: 4,
    variables: { newTail: newTailNode.id, removedId: oldTailNode.id },
    state: finalState,
    highlightedElements: [newTailNode.id],
    metadata: {
      pointers: [{ index: n - 2, label: "new TAIL" }],
    },
    explanation: `Disconnected old tail. Set new TAIL to "${newTailNode.id}". Removal complete.`,
  });

  return builder.build();
}

/**
 * 9. DELETE AT POSITION TRACE GENERATOR
 */
export function createDeleteAtPositionTrace(
  state: LinkedListState,
  position: number
): ExecutionTrace<LinkedListState> {
  if (position <= 0 || state.nodes.length <= 1) {
    return createDeleteAtBeginningTrace(state);
  }
  if (position >= state.nodes.length - 1) {
    return createDeleteAtEndTrace(state);
  }

  const builder = createExecutionTrace<LinkedListState>({
    initialState: state,
    metadata: {
      algorithmId: "linked-list-delete-position",
      algorithmName: "Delete at Position",
      category: "Deletion",
      complexity: { time: "O(n)", space: "O(1)" },
    },
  });

  const prevNode = state.nodes[position - 1];
  const targetNode = state.nodes[position];
  const nextNode = state.nodes[position + 1];

  // Step 0: Identify node to remove
  builder.addStep({
    operation: "delete",
    codeLine: 2,
    variables: { position, targetId: targetNode.id, value: targetNode.value },
    state,
    highlightedElements: [targetNode.id],
    metadata: {
      pointers: [{ index: position, label: "delete" }],
    },
    explanation: `Targeting node at position ${position} (value: ${targetNode.value}) for removal.`,
  });

  // Step 1: Rewire pointers
  const nextMap = { ...state.next };
  const prevMap = state.previous ? { ...state.previous } : undefined;

  nextMap[prevNode.id] = nextNode.id;
  delete nextMap[targetNode.id];

  if (prevMap) {
    prevMap[nextNode.id] = prevNode.id;
    delete prevMap[targetNode.id];
  }

  const remainingNodes = state.nodes.filter((_, idx) => idx !== position);
  const finalState = cloneAndFreezeState(
    remainingNodes,
    state.headId,
    state.tailId,
    nextMap,
    prevMap,
    state.variant
  );

  builder.addStep({
    operation: "delete",
    codeLine: 5,
    variables: { rewiredFrom: prevNode.id, rewiredTo: nextNode.id },
    state: finalState,
    highlightedElements: [prevNode.id, nextNode.id],
    explanation: `Bypassed node "${targetNode.id}" by setting prev.next = "${nextNode.id}". Node removed.`,
  });

  return builder.build();
}

/**
 * 10. UPDATE VALUE TRACE GENERATOR
 */
export function createUpdateTrace(
  state: LinkedListState,
  position: number,
  newValue: number
): ExecutionTrace<LinkedListState> {
  const builder = createExecutionTrace<LinkedListState>({
    initialState: state,
    metadata: {
      algorithmId: "linked-list-update",
      algorithmName: "Update Node Value",
      category: "Transformation",
      complexity: { time: "O(n)", space: "O(1)" },
    },
  });

  const n = state.nodes.length;
  if (position < 0 || position >= n) {
    builder.addStep({
      operation: "custom",
      codeLine: 1,
      variables: { position, error: "Out of bounds" },
      state,
      highlightedElements: [],
      explanation: `Position ${position} out of bounds.`,
    });
    return builder.build();
  }

  const targetNode = state.nodes[position];

  // Step 0: Locate node
  builder.addStep({
    operation: "select",
    codeLine: 3,
    variables: { position, currentValue: targetNode.value, newValue },
    state,
    highlightedElements: [targetNode.id],
    metadata: {
      pointers: [{ index: position, label: "target" }],
    },
    explanation: `Locating node at position ${position} (value: ${targetNode.value}).`,
  });

  // Step 1: Mutate value while preserving stable node ID!
  const updatedNodes = state.nodes.map((node, idx) =>
    idx === position ? { id: node.id, value: newValue } : node
  );
  const finalState = cloneAndFreezeState(
    updatedNodes,
    state.headId,
    state.tailId,
    state.next,
    state.previous,
    state.variant
  );

  builder.addStep({
    operation: "update",
    codeLine: 4,
    variables: { position, oldValue: targetNode.value, newValue },
    state: finalState,
    highlightedElements: [targetNode.id],
    metadata: {
      pointers: [{ index: position, label: "updated" }],
    },
    explanation: `Updated value of node "${targetNode.id}" from ${targetNode.value} to ${newValue}. Stable node ID preserved.`,
  });

  return builder.build();
}

/**
 * 11. REVERSE LIST TRACE GENERATOR (Singly & Doubly)
 */
export function createReverseTrace(state: LinkedListState): ExecutionTrace<LinkedListState> {
  const builder = createExecutionTrace<LinkedListState>({
    initialState: state,
    metadata: {
      algorithmId: "linked-list-reverse",
      algorithmName: "Reverse Linked List",
      category: "Transformation",
      complexity: { time: "O(n)", space: "O(1)" },
    },
  });

  const n = state.nodes.length;

  // Step 0: Initial state
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { prev: null, current: state.headId },
    state,
    highlightedElements: [],
    explanation: "Preparing to reverse list. Initializing prev = null, current = head.",
  });

  if (n <= 1) {
    builder.addStep({
      operation: "return",
      codeLine: 8,
      variables: { totalNodes: n, reversed: true },
      state,
      highlightedElements: state.headId ? [state.headId] : [],
      explanation: `List with ${n} node(s) is already trivially reversed.`,
    });
    return builder.build();
  }

  let prevId: string | null = null;
  let currentId: string | null = state.headId;
  const nextMap: Record<string, string | null> = { ...state.next };
  const prevMap: Record<string, string | null> | undefined = state.previous ? { ...state.previous } : undefined;

  let stepCount = 0;

  while (currentId !== null && stepCount < n) {
    const currentNode = state.nodes.find((node) => node.id === currentId)!;
    const nextId: string | null = state.next[currentId] ?? null;

    // Step: Save next pointer before overwriting
    builder.addStep({
      operation: "visit",
      codeLine: 4,
      variables: {
        prev: prevId,
        current: currentId,
        next: nextId,
      },
      state,
      highlightedElements: [currentId],
      metadata: {
        pointers: [
          ...(prevId ? [{ index: stepCount - 1, label: "prev" }] : []),
          { index: stepCount, label: "current" },
          ...(nextId ? [{ index: stepCount + 1, label: "next" }] : []),
        ],
      },
      explanation: `Save next node ("${nextId ?? "null"}") before reversing current pointer.`,
    });

    // Reverse pointer direction
    nextMap[currentId] = prevId;
    if (prevMap) {
      prevMap[currentId] = nextId;
    }

    builder.addStep({
      operation: "custom",
      codeLine: 5,
      variables: {
        current: currentId,
        newNext: prevId,
      },
      state,
      highlightedElements: [currentId],
      metadata: {
        pointers: [{ index: stepCount, label: "reversed" }],
      },
      explanation: `Reversed pointer: Set node "${currentId}".next = "${prevId ?? "null"}".`,
    });

    prevId = currentId;
    currentId = nextId;
    stepCount++;
  }

  // Re-order nodes array to reflect reversed traversal order
  const reversedNodes = [...state.nodes].reverse();
  const finalState = cloneAndFreezeState(
    reversedNodes,
    state.tailId,
    state.headId,
    nextMap,
    prevMap,
    state.variant
  );

  // Final Step: Complete
  builder.addStep({
    operation: "return",
    codeLine: 8,
    variables: { newHead: state.tailId, newTail: state.headId, reversed: true },
    state: finalState,
    highlightedElements: finalState.nodes.map((node) => node.id),
    metadata: {
      pointers: [
        { index: 0, label: "HEAD" },
        { index: n - 1, label: "TAIL" },
      ],
    },
    explanation: `Reverse complete! Old TAIL is now HEAD ("${state.tailId}"), and old HEAD is now TAIL ("${state.headId}").`,
  });

  return builder.build();
}

// Export aliases matching both generate* and create* conventions
export const generateTraverseTrace = createTraversalTrace;
export const generateSearchTrace = createSearchTrace;
export const generateAccessTrace = createAccessTrace;
export const generateInsertBeginningTrace = createInsertAtBeginningTrace;
export const generateInsertEndTrace = createInsertAtEndTrace;
export const generateInsertPositionTrace = createInsertAtPositionTrace;
export const generateDeleteBeginningTrace = createDeleteAtBeginningTrace;
export const generateDeleteEndTrace = createDeleteAtEndTrace;
export const generateDeletePositionTrace = createDeleteAtPositionTrace;
export const generateUpdateTrace = createUpdateTrace;
export const generateReverseTrace = createReverseTrace;

/**
 * Universal dispatcher for all linked list operations.
 */
export function generateLinkedListTrace(
  state: LinkedListState,
  operation: LinkedListOperationType,
  params: Record<string, number> = {}
): ExecutionTrace<LinkedListState> {
  switch (operation) {
    case "traverse":
      return createTraversalTrace(state);
    case "search":
      return createSearchTrace(state, params.value ?? (state.nodes[0]?.value ?? 20));
    case "access":
      return createAccessTrace(state, params.index ?? 0);
    case "insert-beginning":
      return createInsertAtBeginningTrace(state, params.value ?? 42);
    case "insert-end":
      return createInsertAtEndTrace(state, params.value ?? 42);
    case "insert-position":
      return createInsertAtPositionTrace(state, params.index ?? 0, params.value ?? 42);
    case "delete-beginning":
      return createDeleteAtBeginningTrace(state);
    case "delete-end":
      return createDeleteAtEndTrace(state);
    case "delete-position":
      return createDeleteAtPositionTrace(state, params.index ?? 0);
    case "update":
      return createUpdateTrace(state, params.index ?? 0, params.value ?? 99);
    case "reverse":
      return createReverseTrace(state);
    default:
      return createTraversalTrace(state);
  }
}
