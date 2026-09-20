/**
 * Tree & BST Trace Generators
 *
 * Implements pure, deterministic trace generation for all Tree and BST operations.
 * Produces immutable ExecutionStep sequences containing:
 * - snapshot state (TreeState)
 * - highlighted element IDs
 * - operation metadata & variables
 * - 1-indexed code line mappings
 * - beginner-friendly explanations
 */

import type { ExecutionTrace } from "@/core/execution/types";
import { createExecutionTrace } from "@/core/execution/trace/trace-builder";
import type {
  TreeState,
  TreeNode,
  TreeOperationType,
  CallStackFrame,
} from "./types";
import {
  generateTreeNodeId,
  isValidBST,
  createEmptyTreeState,
} from "./validation";

function cloneTree(state: TreeState<number>): TreeState<number> {
  const clonedNodes: Record<string, TreeNode<number>> = {};
  for (const [key, node] of Object.entries(state.nodes)) {
    clonedNodes[key] = { ...node };
  }
  return {
    nodes: clonedNodes,
    rootId: state.rootId,
    traversalOutput: state.traversalOutput ? [...state.traversalOutput] : undefined,
    callStack: state.callStack ? [...state.callStack] : undefined,
    queue: state.queue ? [...state.queue] : undefined,
  };
}

// ============================================================================
// 1. BST INSERT
// ============================================================================
export function generateBSTInsertTrace(
  initialState: TreeState<number>,
  value: number
): ExecutionTrace<TreeState<number>> {
  const builder = createExecutionTrace({ initialState, metadata: { algorithmName: "BST Insert" } });
  let currentState = cloneTree(initialState);

  // Step 1: Start insertion
  builder.addStep({
    operation: "compare",
    codeLine: 1,
    state: cloneTree(currentState),
    explanation: `Beginning BST insertion for value ${value}.`,
    highlightedElements: currentState.rootId ? [currentState.rootId] : [],
    variables: {
      val: value,
      root: currentState.rootId ? currentState.nodes[currentState.rootId]?.value : null,
    },
  });

  // Empty tree case
  if (!currentState.rootId) {
    const newId = generateTreeNodeId(value);
    const newNode: TreeNode<number> = {
      id: newId,
      value,
      leftId: null,
      rightId: null,
      parentId: null,
    };
    currentState = {
      nodes: { [newId]: newNode },
      rootId: newId,
    };

    builder.addStep({
      operation: "insert",
      codeLine: 3,
      state: cloneTree(currentState),
      explanation: `The tree is empty. Created new root node with value ${value}.`,
      highlightedElements: [newId],
      variables: {
        val: value,
        created: value,
        position: "root",
      },
    });

    return builder.build();
  }

  // Traversal loop
  let currentId: string | null = currentState.rootId;
  let placed = false;

  while (currentId && !placed) {
    const currNode: TreeNode<number> | undefined = currentState.nodes[currentId];
    if (!currNode) break;

    // Check duplicate
    if (value === currNode.value) {
      builder.addStep({
        operation: "compare",
        codeLine: 5,
        state: cloneTree(currentState),
        explanation: `Value ${value} already exists in the BST at node ${currNode.id}. Duplicates are rejected.`,
        highlightedElements: [currNode.id],
        variables: {
          current: currNode.value,
          val: value,
          status: "duplicate rejected",
        },
      });
      placed = true;
      break;
    }

    if (value < currNode.value) {
      builder.addStep({
        operation: "compare",
        codeLine: 7,
        state: cloneTree(currentState),
        explanation: `${value} < ${currNode.value}: target value is smaller than current node, moving to left subtree.`,
        highlightedElements: [currNode.id],
        variables: {
          current: currNode.value,
          val: value,
          comparison: `${value} < ${currNode.value}`,
          direction: "left",
        },
      });

      if (currNode.leftId === null) {
        // Insert here
        const newId = generateTreeNodeId(value);
        const newNode: TreeNode<number> = {
          id: newId,
          value,
          leftId: null,
          rightId: null,
          parentId: currentId,
        };

        const updatedNodes = {
          ...currentState.nodes,
          [newId]: newNode,
          [currentId]: { ...currNode, leftId: newId },
        };

        currentState = {
          ...currentState,
          nodes: updatedNodes,
        };

        builder.addStep({
          operation: "insert",
          codeLine: 8,
          state: cloneTree(currentState),
          explanation: `Found empty left child of node ${currNode.value}. Inserted ${value} as left child.`,
          highlightedElements: [newId, currentId],
          variables: {
            parent: currNode.value,
            newChild: value,
            direction: "left",
          },
        });
        placed = true;
      } else {
        currentId = currNode.leftId;
      }
    } else {
      // value > currNode.value
      builder.addStep({
        operation: "compare",
        codeLine: 9,
        state: cloneTree(currentState),
        explanation: `${value} > ${currNode.value}: target value is greater than current node, moving to right subtree.`,
        highlightedElements: [currNode.id],
        variables: {
          current: currNode.value,
          val: value,
          comparison: `${value} > ${currNode.value}`,
          direction: "right",
        },
      });

      if (currNode.rightId === null) {
        // Insert here
        const newId = generateTreeNodeId(value);
        const newNode: TreeNode<number> = {
          id: newId,
          value,
          leftId: null,
          rightId: null,
          parentId: currentId,
        };

        const updatedNodes = {
          ...currentState.nodes,
          [newId]: newNode,
          [currentId]: { ...currNode, rightId: newId },
        };

        currentState = {
          ...currentState,
          nodes: updatedNodes,
        };

        builder.addStep({
          operation: "insert",
          codeLine: 10,
          state: cloneTree(currentState),
          explanation: `Found empty right child of node ${currNode.value}. Inserted ${value} as right child.`,
          highlightedElements: [newId, currentId],
          variables: {
            parent: currNode.value,
            newChild: value,
            direction: "right",
          },
        });
        placed = true;
      } else {
        currentId = currNode.rightId;
      }
    }
  }

  // Final confirmation step
  builder.addStep({
    operation: "compare",
    codeLine: 11,
    state: cloneTree(currentState),
    explanation: `BST insertion complete. BST ordering invariant preserved: left < node < right.`,
    highlightedElements: [],
    variables: {
      val: value,
      isValidBST: isValidBST(currentState),
    },
  });

  return builder.build();
}

// ============================================================================
// 2. BST SEARCH & CONTAINS
// ============================================================================
export function generateBSTSearchTrace(
  initialState: TreeState<number>,
  target: number,
  operation: "search" | "contains" = "search"
): ExecutionTrace<TreeState<number>> {
  const builder = createExecutionTrace({ initialState, metadata: { algorithmName: `BST ${operation}` } });
  const currentState = cloneTree(initialState);

  builder.addStep({
    operation: "compare",
    codeLine: 1,
    state: cloneTree(currentState),
    explanation: `Starting ${operation} for value ${target} at root.`,
    highlightedElements: currentState.rootId ? [currentState.rootId] : [],
    variables: { target, current: currentState.rootId ? currentState.nodes[currentState.rootId]?.value : null },
  });

  if (!currentState.rootId) {
    builder.addStep({
      operation: "compare",
      codeLine: 3,
      state: cloneTree(currentState),
      explanation: `The tree is empty. Target ${target} not found.`,
      highlightedElements: [],
      variables: { target, result: operation === "contains" ? false : "NOT FOUND" },
    });
    return builder.build();
  }

  let currentId: string | null = currentState.rootId;
  let found = false;

  while (currentId) {
    const node: TreeNode<number> | undefined = currentState.nodes[currentId];
    if (!node) break;

    builder.addStep({
      operation: "compare",
      codeLine: 4,
      state: cloneTree(currentState),
      explanation: `Inspecting node ${node.value}. Comparing target ${target} with ${node.value}.`,
      highlightedElements: [node.id],
      variables: {
        current: node.value,
        target,
        comparison: target === node.value ? `${target} == ${node.value}` : target < node.value ? `${target} < ${node.value}` : `${target} > ${node.value}`,
      },
    });

    if (target === node.value) {
      builder.addStep({
        operation: "found",
        codeLine: 5,
        state: cloneTree(currentState),
        explanation: `Target ${target} matches node ${node.value}. Value FOUND!`,
        highlightedElements: [node.id],
        variables: {
          current: node.value,
          target,
          status: "FOUND",
          result: operation === "contains" ? true : node.id,
        },
      });
      found = true;
      break;
    } else if (target < node.value) {
      builder.addStep({
        operation: "compare",
        codeLine: 7,
        state: cloneTree(currentState),
        explanation: `${target} < ${node.value}: target is smaller than current node, branching LEFT.`,
        highlightedElements: [node.id],
        variables: {
          current: node.value,
          target,
          direction: "left",
          next: node.leftId ? currentState.nodes[node.leftId]?.value : "null",
        },
      });
      currentId = node.leftId;
    } else {
      builder.addStep({
        operation: "compare",
        codeLine: 9,
        state: cloneTree(currentState),
        explanation: `${target} > ${node.value}: target is greater than current node, branching RIGHT.`,
        highlightedElements: [node.id],
        variables: {
          current: node.value,
          target,
          direction: "right",
          next: node.rightId ? currentState.nodes[node.rightId]?.value : "null",
        },
      });
      currentId = node.rightId;
    }
  }

  if (!found) {
    builder.addStep({
      operation: "compare",
      codeLine: 3,
      state: cloneTree(currentState),
      explanation: `Reached null branch. Target ${target} does not exist in the BST (NOT FOUND).`,
      highlightedElements: [],
      variables: {
        target,
        status: "NOT FOUND",
        result: operation === "contains" ? false : null,
      },
    });
  }

  return builder.build();
}

// ============================================================================
// 3. BST MINIMUM & MAXIMUM
// ============================================================================
export function generateBSTExtremeTrace(
  initialState: TreeState<number>,
  isMin: boolean
): ExecutionTrace<TreeState<number>> {
  const opName = isMin ? "minimum" : "maximum";
  const direction = isMin ? "left" : "right";
  const builder = createExecutionTrace({ initialState, metadata: { algorithmName: `BST ${opName}` } });
  const currentState = cloneTree(initialState);

  builder.addStep({
    operation: "compare",
    codeLine: 1,
    state: cloneTree(currentState),
    explanation: `Searching for ${opName} value in BST starting at root.`,
    highlightedElements: currentState.rootId ? [currentState.rootId] : [],
    variables: { operation: opName, current: currentState.rootId ? currentState.nodes[currentState.rootId]?.value : null },
  });

  if (!currentState.rootId) {
    builder.addStep({
      operation: "compare",
      codeLine: 3,
      state: cloneTree(currentState),
      explanation: `Tree is empty. No ${opName} exists.`,
      highlightedElements: [],
      variables: { result: null },
    });
    return builder.build();
  }

  let currentId: string = currentState.rootId;

  while (true) {
    const node: TreeNode<number> | undefined = currentState.nodes[currentId];
    if (!node) break;

    const nextId = isMin ? node.leftId : node.rightId;

    if (nextId === null) {
      builder.addStep({
        operation: "found",
        codeLine: 6,
        state: cloneTree(currentState),
        explanation: `Node ${node.value} has no ${direction} child. ${opName.toUpperCase()} value in BST is ${node.value}.`,
        highlightedElements: [node.id],
        variables: {
          node: node.value,
          result: node.value,
          status: "FOUND",
        },
      });
      break;
    } else {
      builder.addStep({
        operation: "compare",
        codeLine: 5,
        state: cloneTree(currentState),
        explanation: `Node ${node.value} has a ${direction} child. Continuing ${direction}wards...`,
        highlightedElements: [node.id, nextId],
        variables: {
          current: node.value,
          next: currentState.nodes[nextId]?.value,
          direction,
        },
      });
      currentId = nextId;
    }
  }

  return builder.build();
}

// ============================================================================
// 4. BST SUCCESSOR & PREDECESSOR
// ============================================================================
export function generateBSTSuccessorPredecessorTrace(
  initialState: TreeState<number>,
  target: number,
  isSuccessor: boolean
): ExecutionTrace<TreeState<number>> {
  const opName = isSuccessor ? "successor" : "predecessor";
  const builder = createExecutionTrace({ initialState, metadata: { algorithmName: `BST ${opName}` } });
  const currentState = cloneTree(initialState);

  // Step 1: Locate target node
  builder.addStep({
    operation: "compare",
    codeLine: 1,
    state: cloneTree(currentState),
    explanation: `Locating node with value ${target} to find its inorder ${opName}.`,
    highlightedElements: currentState.rootId ? [currentState.rootId] : [],
    variables: { target, mode: opName },
  });

  let targetId: string | null = null;
  for (const node of Object.values(currentState.nodes)) {
    if (node.value === target) {
      targetId = node.id;
      break;
    }
  }

  if (!targetId) {
    builder.addStep({
      operation: "compare",
      codeLine: 3,
      state: cloneTree(currentState),
      explanation: `Node with value ${target} not found in tree. Cannot find ${opName}.`,
      highlightedElements: [],
      variables: { target, result: null },
    });
    return builder.build();
  }

  const targetNode = currentState.nodes[targetId];

  // Case A: Node has relevant subtree
  const subtreeRootId = isSuccessor ? targetNode.rightId : targetNode.leftId;

  if (subtreeRootId) {
    builder.addStep({
      operation: "compare",
      codeLine: 5,
      state: cloneTree(currentState),
      explanation: `Node ${target} has a ${isSuccessor ? "right" : "left"} subtree. Its inorder ${opName} is the ${isSuccessor ? "minimum" : "maximum"} of this subtree.`,
      highlightedElements: [targetId, subtreeRootId],
      variables: { target, subtreeRoot: currentState.nodes[subtreeRootId]?.value },
    });

    let currId = subtreeRootId;
    while (true) {
      const node = currentState.nodes[currId];
      const nextId = isSuccessor ? node.leftId : node.rightId;
      if (!nextId) {
        builder.addStep({
          operation: "found",
          codeLine: 7,
          state: cloneTree(currentState),
          explanation: `Inorder ${opName} of ${target} is ${node.value}.`,
          highlightedElements: [targetId, node.id],
          variables: { target, [opName]: node.value },
        });
        break;
      }
      builder.addStep({
        operation: "compare",
        codeLine: 6,
        state: cloneTree(currentState),
        explanation: `Stepping ${isSuccessor ? "left" : "right"} in subtree to find extreme...`,
        highlightedElements: [node.id, nextId],
        variables: { current: node.value, next: currentState.nodes[nextId]?.value },
      });
      currId = nextId;
    }
  } else {
    // Case B: No subtree -> walk up parent pointers
    builder.addStep({
      operation: "compare",
      codeLine: 9,
      state: cloneTree(currentState),
      explanation: `Node ${target} has no ${isSuccessor ? "right" : "left"} child. Walking up ancestors to find the lowest ancestor whose ${isSuccessor ? "left" : "right"} child is on the path.`,
      highlightedElements: [targetId],
      variables: { target, strategy: "ancestor walk" },
    });

    let curr: TreeNode<number> | undefined = targetNode;
    let parent: TreeNode<number> | undefined = curr.parentId ? currentState.nodes[curr.parentId] : undefined;
    let foundAncestor = false;

    while (parent) {
      builder.addStep({
        operation: "compare",
        codeLine: 10,
        state: cloneTree(currentState),
        explanation: `Checking ancestor ${parent.value}.`,
        highlightedElements: [parent.id, curr.id],
        variables: { current: curr.value, parent: parent.value },
      });

      if (isSuccessor && parent.leftId === curr.id) {
        foundAncestor = true;
        builder.addStep({
          operation: "found",
          codeLine: 11,
          state: cloneTree(currentState),
          explanation: `Ancestor ${parent.value} contains node ${curr.value} in its LEFT branch. Therefore, ${parent.value} is the inorder successor of ${target}.`,
          highlightedElements: [targetId, parent.id],
          variables: { target, successor: parent.value },
        });
        break;
      } else if (!isSuccessor && parent.rightId === curr.id) {
        foundAncestor = true;
        builder.addStep({
          operation: "found",
          codeLine: 11,
          state: cloneTree(currentState),
          explanation: `Ancestor ${parent.value} contains node ${curr.value} in its RIGHT branch. Therefore, ${parent.value} is the inorder predecessor of ${target}.`,
          highlightedElements: [targetId, parent.id],
          variables: { target, predecessor: parent.value },
        });
        break;
      }

      curr = parent;
      parent = curr.parentId ? currentState.nodes[curr.parentId] : undefined;
    }

    if (!foundAncestor) {
      builder.addStep({
        operation: "compare",
        codeLine: 12,
        state: cloneTree(currentState),
        explanation: `No ancestor satisfies the condition. Value ${target} has no inorder ${opName} in this BST.`,
        highlightedElements: [targetId],
        variables: { target, [opName]: null },
      });
    }
  }

  return builder.build();
}

// ============================================================================
// 5. BST DELETE (CASES 1, 2, AND 3 WITH TWO CHILDREN & INORDER SUCCESSOR)
// ============================================================================
export function generateBSTDeleteTrace(
  initialState: TreeState<number>,
  target: number
): ExecutionTrace<TreeState<number>> {
  const builder = createExecutionTrace({ initialState, metadata: { algorithmName: "BST Delete" } });
  let currentState = cloneTree(initialState);

  // Step 1: Start delete
  builder.addStep({
    operation: "compare",
    codeLine: 1,
    state: cloneTree(currentState),
    explanation: `Starting BST deletion for value ${target}. Searching for target node...`,
    highlightedElements: currentState.rootId ? [currentState.rootId] : [],
    variables: { key: target },
  });

  if (!currentState.rootId) {
    builder.addStep({
      operation: "compare",
      codeLine: 3,
      state: cloneTree(currentState),
      explanation: `The tree is empty. Nothing to delete.`,
      highlightedElements: [],
      variables: { key: target, result: "Tree is empty." },
    });
    return builder.build();
  }

  // Locate target node
  let currentId: string | null = currentState.rootId;
  let targetNode: TreeNode<number> | null = null;

  while (currentId) {
    const node: TreeNode<number> | undefined = currentState.nodes[currentId];
    if (!node) break;

    builder.addStep({
      operation: "compare",
      codeLine: 4,
      state: cloneTree(currentState),
      explanation: `Comparing key ${target} with current node ${node.value}.`,
      highlightedElements: [node.id],
      variables: { current: node.value, target },
    });

    if (target === node.value) {
      targetNode = node;
      break;
    } else if (target < node.value) {
      currentId = node.leftId;
    } else {
      currentId = node.rightId;
    }
  }

  if (!targetNode) {
    builder.addStep({
      operation: "compare",
      codeLine: 3,
      state: cloneTree(currentState),
      explanation: `Node with value ${target} not found in the BST. Deletion aborted.`,
      highlightedElements: [],
      variables: { target, status: "NOT FOUND" },
    });
    return builder.build();
  }

  const targetId = targetNode.id;
  const isLeaf = !targetNode.leftId && !targetNode.rightId;
  const hasOneChild = (!targetNode.leftId && Boolean(targetNode.rightId)) || (Boolean(targetNode.leftId) && !targetNode.rightId);
  const hasTwoChildren = Boolean(targetNode.leftId && targetNode.rightId);

  // ==========================================
  // CASE 1: Leaf node (0 children)
  // ==========================================
  if (isLeaf) {
    builder.addStep({
      operation: "compare",
      codeLine: 9,
      state: cloneTree(currentState),
      explanation: `CASE 1 — Leaf Node: Node ${target} has no children. It can be safely removed by unlinking from parent.`,
      highlightedElements: [targetId],
      variables: { target, case: "Case 1: Leaf" },
    });

    const parentId = targetNode.parentId;
    const newNodes = { ...currentState.nodes };
    delete newNodes[targetId];

    if (parentId && newNodes[parentId]) {
      const parent = newNodes[parentId];
      if (parent.leftId === targetId) {
        newNodes[parentId] = { ...parent, leftId: null };
      } else if (parent.rightId === targetId) {
        newNodes[parentId] = { ...parent, rightId: null };
      }
    }

    currentState = {
      ...currentState,
      nodes: newNodes,
      rootId: parentId ? currentState.rootId : null,
    };

    builder.addStep({
      operation: "delete",
      codeLine: 11,
      state: cloneTree(currentState),
      explanation: `Node ${target} removed from tree. Parent pointer set to null.`,
      highlightedElements: parentId ? [parentId] : [],
      variables: { deleted: target, parent: parentId ? currentState.nodes[parentId]?.value : "null" },
    });
  }

  // ==========================================
  // CASE 2: One child
  // ==========================================
  else if (hasOneChild) {
    const childId = (targetNode.leftId || targetNode.rightId)!;
    const childNode = currentState.nodes[childId];
    const parentId = targetNode.parentId;

    builder.addStep({
      operation: "compare",
      codeLine: 10,
      state: cloneTree(currentState),
      explanation: `CASE 2 — One Child: Node ${target} has one child (${childNode.value}). Connecting child directly to parent.`,
      highlightedElements: [targetId, childId],
      variables: { target, child: childNode.value, case: "Case 2: One child" },
    });

    const newNodes = { ...currentState.nodes };
    delete newNodes[targetId];

    newNodes[childId] = { ...childNode, parentId };

    if (parentId && newNodes[parentId]) {
      const parent = newNodes[parentId];
      if (parent.leftId === targetId) {
        newNodes[parentId] = { ...parent, leftId: childId };
      } else if (parent.rightId === targetId) {
        newNodes[parentId] = { ...parent, rightId: childId };
      }
    }

    currentState = {
      ...currentState,
      nodes: newNodes,
      rootId: parentId ? currentState.rootId : childId,
    };

    builder.addStep({
      operation: "delete",
      codeLine: 12,
      state: cloneTree(currentState),
      explanation: `Reconnected child ${childNode.value} to ${parentId ? `parent ${currentState.nodes[parentId]?.value}` : "root"}. Node ${target} deleted.`,
      highlightedElements: [childId],
      variables: { deleted: target, promotedChild: childNode.value },
    });
  }

  // ==========================================
  // CASE 3: Two children (Acceptance Test 44)
  // ==========================================
  else if (hasTwoChildren) {
    builder.addStep({
      operation: "compare",
      codeLine: 13,
      state: cloneTree(currentState),
      explanation: `CASE 3 — Two Children: Node ${target} has two children. Finding inorder successor (minimum node in right subtree)...`,
      highlightedElements: [targetId, targetNode.leftId!, targetNode.rightId!],
      variables: {
        target,
        left: currentState.nodes[targetNode.leftId!]?.value,
        right: currentState.nodes[targetNode.rightId!]?.value,
        case: "Case 3: Two children",
      },
    });

    // Step into right subtree
    let successorId = targetNode.rightId!;
    builder.addStep({
      operation: "visit",
      codeLine: 14,
      state: cloneTree(currentState),
      explanation: `Stepping into right subtree at node ${currentState.nodes[successorId]?.value}.`,
      highlightedElements: [targetId, successorId],
      variables: { current: currentState.nodes[successorId]?.value },
    });

    // Follow left pointers to minimum
    while (currentState.nodes[successorId]?.leftId) {
      const nextLeft = currentState.nodes[successorId].leftId!;
      builder.addStep({
        operation: "visit",
        codeLine: 14,
        state: cloneTree(currentState),
        explanation: `Node ${currentState.nodes[successorId]?.value} has a left child. Moving left to find minimum...`,
        highlightedElements: [successorId, nextLeft],
        variables: { current: currentState.nodes[successorId]?.value, next: currentState.nodes[nextLeft]?.value },
      });
      successorId = nextLeft;
    }

    const successorNode = currentState.nodes[successorId];

    builder.addStep({
      operation: "found",
      codeLine: 15,
      state: cloneTree(currentState),
      explanation: `Inorder successor found: node ${successorNode.value}. It has no left child. Copying its value ${successorNode.value} to target node ${targetNode.value}.`,
      highlightedElements: [targetId, successorId],
      variables: {
        target: targetNode.value,
        successor: successorNode.value,
      },
    });

    // Copy value and delete successor from its original position
    const newNodes = { ...currentState.nodes };

    // Update target node value with successor value (preserves target node ID)
    newNodes[targetId] = {
      ...targetNode,
      value: successorNode.value,
    };

    // The successor has at most one child (its right child)
    const succRightId = successorNode.rightId;
    const succParentId = successorNode.parentId!;

    if (succRightId && newNodes[succRightId]) {
      newNodes[succRightId] = {
        ...newNodes[succRightId],
        parentId: succParentId,
      };
    }

    if (newNodes[succParentId]) {
      const succParent = newNodes[succParentId];
      if (succParent.leftId === successorId) {
        newNodes[succParentId] = { ...succParent, leftId: succRightId };
      } else if (succParent.rightId === successorId) {
        newNodes[succParentId] = { ...succParent, rightId: succRightId };
      }
    }

    delete newNodes[successorId];

    currentState = {
      ...currentState,
      nodes: newNodes,
    };

    builder.addStep({
      operation: "update",
      codeLine: 16,
      state: cloneTree(currentState),
      explanation: `Successor value ${successorNode.value} copied to node. Successor node removed and subtree reconnected.`,
      highlightedElements: [targetId],
      variables: {
        nodeValue: successorNode.value,
        originalDeleted: target,
        successorRemoved: successorNode.value,
      },
    });
  }

  // Final invariant validation step
  builder.addStep({
    operation: "compare",
    codeLine: 17,
    state: cloneTree(currentState),
    explanation: `BST deletion complete. BST ordering invariant strictly preserved: isValidBST = ${isValidBST(currentState)}.`,
    highlightedElements: [],
    variables: {
      deleted: target,
      isValidBST: isValidBST(currentState),
    },
  });

  return builder.build();
}

// ============================================================================
// 6. TRAVERSALS (PREORDER, INORDER, POSTORDER, LEVEL-ORDER)
// ============================================================================
export function generateTreeTraversalTrace(
  initialState: TreeState<number>,
  order: "preorder" | "inorder" | "postorder" | "level-order",
  mode: "binary-tree" | "bst" = "bst"
): ExecutionTrace<TreeState<number>> {
  const builder = createExecutionTrace({ initialState, metadata: { algorithmName: `Tree ${order}` } });
  const currentState = cloneTree(initialState);

  builder.addStep({
    operation: "visit",
    codeLine: 1,
    state: { ...currentState, traversalOutput: [] },
    explanation: `Starting ${order.toUpperCase()} traversal.`,
    highlightedElements: currentState.rootId ? [currentState.rootId] : [],
    variables: { order, output: [] },
  });

  if (!currentState.rootId) {
    builder.addStep({
      operation: "visit",
      codeLine: 3,
      state: { ...currentState, traversalOutput: [] },
      explanation: `Tree is empty. Traversal result is empty.`,
      highlightedElements: [],
      variables: { output: [] },
    });
    return builder.build();
  }

  // Level-Order using Queue
  if (order === "level-order") {
    const queue: string[] = [currentState.rootId];
    const visitedOutput: number[] = [];

    builder.addStep({
      operation: "enqueue",
      codeLine: 4,
      state: {
        ...currentState,
        traversalOutput: [...visitedOutput],
        queue: [...queue],
      },
      explanation: `Enqueued root node ${currentState.nodes[currentState.rootId]?.value} into FIFO queue.`,
      highlightedElements: [currentState.rootId],
      variables: { queue: queue.map((id) => currentState.nodes[id]?.value), output: [...visitedOutput] },
    });

    while (queue.length > 0) {
      const currId = queue.shift()!;
      const currNode = currentState.nodes[currId];
      if (!currNode) continue;

      visitedOutput.push(currNode.value);

      builder.addStep({
        operation: "dequeue",
        codeLine: 7,
        state: {
          ...currentState,
          traversalOutput: [...visitedOutput],
          queue: [...queue],
        },
        explanation: `Dequeued node ${currNode.value}. Added to level-order output: [${visitedOutput.join(", ")}].`,
        highlightedElements: [currNode.id],
        variables: {
          visited: currNode.value,
          queue: queue.map((id) => currentState.nodes[id]?.value),
          output: [...visitedOutput],
        },
      });

      if (currNode.leftId) {
        queue.push(currNode.leftId);
        builder.addStep({
          operation: "enqueue",
          codeLine: 9,
          state: {
            ...currentState,
            traversalOutput: [...visitedOutput],
            queue: [...queue],
          },
          explanation: `Enqueued left child ${currentState.nodes[currNode.leftId]?.value}.`,
          highlightedElements: [currNode.id, currNode.leftId],
          variables: { queue: queue.map((id) => currentState.nodes[id]?.value) },
        });
      }

      if (currNode.rightId) {
        queue.push(currNode.rightId);
        builder.addStep({
          operation: "enqueue",
          codeLine: 10,
          state: {
            ...currentState,
            traversalOutput: [...visitedOutput],
            queue: [...queue],
          },
          explanation: `Enqueued right child ${currentState.nodes[currNode.rightId]?.value}.`,
          highlightedElements: [currNode.id, currNode.rightId],
          variables: { queue: queue.map((id) => currentState.nodes[id]?.value) },
        });
      }
    }

    builder.addStep({
      operation: "visit",
      codeLine: 12,
      state: {
        ...currentState,
        traversalOutput: [...visitedOutput],
        queue: [],
      },
      explanation: `Level-order traversal complete. Final output: [${visitedOutput.join(", ")}].`,
      highlightedElements: [],
      variables: { output: [...visitedOutput] },
    });

    return builder.build();
  }

  // Recursive Traversals: Preorder, Inorder, Postorder
  const progressiveOutput: number[] = [];
  const callStack: CallStackFrame[] = [];

  function traverseRecursive(nodeId: string | null) {
    if (!nodeId) return;
    const node = currentState.nodes[nodeId];
    if (!node) return;

    // Call Frame Push
    callStack.push({
      id: `frame-${node.id}`,
      functionName: `traverse(${node.value})`,
      nodeId: node.id,
      value: node.value,
      phase: "call",
    });

    builder.addStep({
      operation: "call",
      codeLine: 2,
      state: {
        ...currentState,
        traversalOutput: [...progressiveOutput],
        callStack: [...callStack],
      },
      explanation: `Calling traverse(node ${node.value}).`,
      highlightedElements: [node.id],
      variables: { current: node.value, output: [...progressiveOutput] },
    });

    // 1. Preorder Visit
    if (order === "preorder") {
      progressiveOutput.push(node.value);
      builder.addStep({
        operation: "visit",
        codeLine: 4,
        state: {
          ...currentState,
          traversalOutput: [...progressiveOutput],
          callStack: [...callStack],
        },
        explanation: `PREORDER: Visited root node ${node.value}. Output: [${progressiveOutput.join(", ")}].`,
        highlightedElements: [node.id],
        variables: { visited: node.value, output: [...progressiveOutput] },
      });
    }

    // Traverse Left
    if (node.leftId) {
      traverseRecursive(node.leftId);
    }

    // 2. Inorder Visit
    if (order === "inorder") {
      progressiveOutput.push(node.value);
      const bstSortedNote =
        mode === "bst"
          ? " (Notice: Inorder traversal of a BST produces values in sorted order!)"
          : "";

      builder.addStep({
        operation: "visit",
        codeLine: 7,
        state: {
          ...currentState,
          traversalOutput: [...progressiveOutput],
          callStack: [...callStack],
        },
        explanation: `INORDER: Left subtree complete. Visited node ${node.value}${bstSortedNote}. Output: [${progressiveOutput.join(", ")}].`,
        highlightedElements: [node.id],
        variables: { visited: node.value, output: [...progressiveOutput] },
      });
    }

    // Traverse Right
    if (node.rightId) {
      traverseRecursive(node.rightId);
    }

    // 3. Postorder Visit
    if (order === "postorder") {
      progressiveOutput.push(node.value);
      builder.addStep({
        operation: "visit",
        codeLine: 10,
        state: {
          ...currentState,
          traversalOutput: [...progressiveOutput],
          callStack: [...callStack],
        },
        explanation: `POSTORDER: Both subtrees complete. Visited node ${node.value}. Output: [${progressiveOutput.join(", ")}].`,
        highlightedElements: [node.id],
        variables: { visited: node.value, output: [...progressiveOutput] },
      });
    }

    // Return Frame Pop
    callStack.pop();
    builder.addStep({
      operation: "return",
      codeLine: 11,
      state: {
        ...currentState,
        traversalOutput: [...progressiveOutput],
        callStack: [...callStack],
      },
      explanation: `Returning from traverse(node ${node.value}).`,
      highlightedElements: [node.id],
      variables: { returnedFrom: node.value, output: [...progressiveOutput] },
    });
  }

  traverseRecursive(currentState.rootId);

  builder.addStep({
    operation: "visit",
    codeLine: 12,
    state: {
      ...currentState,
      traversalOutput: [...progressiveOutput],
      callStack: [],
    },
    explanation: `${order.toUpperCase()} traversal complete! Result: [${progressiveOutput.join(", ")}].`,
    highlightedElements: [],
    variables: { output: [...progressiveOutput] },
  });

  return builder.build();
}

// ============================================================================
// 7. GENERAL BINARY TREE OPERATIONS (INSERT-NODE, DELETE-NODE, UPDATE)
// ============================================================================
export function generateBinaryTreeInsertNodeTrace(
  initialState: TreeState<number>,
  parentId: string | null,
  direction: "left" | "right",
  value: number
): ExecutionTrace<TreeState<number>> {
  const builder = createExecutionTrace({ initialState, metadata: { algorithmName: "Binary Tree Insert Node" } });
  let currentState = cloneTree(initialState);

  // Root insertion on empty tree
  if (!currentState.rootId) {
    const newId = generateTreeNodeId(value);
    const newNode: TreeNode<number> = {
      id: newId,
      value,
      leftId: null,
      rightId: null,
      parentId: null,
    };
    currentState = {
      nodes: { [newId]: newNode },
      rootId: newId,
    };

    builder.addStep({
      operation: "insert",
      codeLine: 2,
      state: cloneTree(currentState),
      explanation: `Tree was empty. Created root node with value ${value}.`,
      highlightedElements: [newId],
      variables: { created: value, position: "root" },
    });

    return builder.build();
  }

  // Parent insertion
  if (!parentId || !currentState.nodes[parentId]) {
    builder.addStep({
      operation: "compare",
      codeLine: 3,
      state: cloneTree(currentState),
      explanation: `Parent node not found. Please select a valid parent node to insert a child.`,
      highlightedElements: [],
      variables: { parentId, error: "Invalid parent" },
    });
    return builder.build();
  }

  const parent = currentState.nodes[parentId];
  const occupiedChildId = direction === "left" ? parent.leftId : parent.rightId;

  if (occupiedChildId) {
    builder.addStep({
      operation: "compare",
      codeLine: 4,
      state: cloneTree(currentState),
      explanation: `Parent ${parent.value} already has a ${direction} child (${currentState.nodes[occupiedChildId]?.value}). Cannot overwrite child.`,
      highlightedElements: [parent.id, occupiedChildId],
      variables: { parent: parent.value, direction, occupiedBy: currentState.nodes[occupiedChildId]?.value },
    });
    return builder.build();
  }

  // Valid insertion
  const newId = generateTreeNodeId(value, `${parentId}-${direction}`);
  const newNode: TreeNode<number> = {
    id: newId,
    value,
    leftId: null,
    rightId: null,
    parentId,
  };

  const newNodes = {
    ...currentState.nodes,
    [newId]: newNode,
    [parentId]: {
      ...parent,
      [direction === "left" ? "leftId" : "rightId"]: newId,
    },
  };

  currentState = {
    ...currentState,
    nodes: newNodes,
  };

  builder.addStep({
    operation: "insert",
    codeLine: 8,
    state: cloneTree(currentState),
    explanation: `Inserted node ${value} as the ${direction} child of parent ${parent.value}.`,
    highlightedElements: [parentId, newId],
    variables: { parent: parent.value, direction, newChild: value },
  });

  return builder.build();
}

export function generateBinaryTreeUpdateTrace(
  initialState: TreeState<number>,
  nodeId: string,
  newValue: number
): ExecutionTrace<TreeState<number>> {
  const builder = createExecutionTrace({ initialState, metadata: { algorithmName: "Binary Tree Update" } });
  const currentState = cloneTree(initialState);

  if (!currentState.nodes[nodeId]) {
    builder.addStep({
      operation: "compare",
      codeLine: 1,
      state: cloneTree(currentState),
      explanation: `Node to update not found.`,
      highlightedElements: [],
      variables: { nodeId, newValue },
    });
    return builder.build();
  }

  const oldNode = currentState.nodes[nodeId];
  const updatedNodes = {
    ...currentState.nodes,
    [nodeId]: { ...oldNode, value: newValue },
  };

  const updatedState = {
    ...currentState,
    nodes: updatedNodes,
  };

  builder.addStep({
    operation: "update",
    codeLine: 3,
    state: updatedState,
    explanation: `Updated node ${oldNode.id}: changed value from ${oldNode.value} to ${newValue}.`,
    highlightedElements: [nodeId],
    variables: { oldVal: oldNode.value, newVal: newValue },
  });

  return builder.build();
}

export function generateClearTreeTrace(): ExecutionTrace<TreeState<number>> {
  const emptyState = createEmptyTreeState();
  const builder = createExecutionTrace({ initialState: emptyState, metadata: { algorithmName: "Clear Tree" } });
  builder.addStep({
    operation: "delete",
    codeLine: 1,
    state: emptyState,
    explanation: "Tree cleared. All nodes have been removed.",
    highlightedElements: [],
    variables: { size: 0, root: null },
  });
  return builder.build();
}

/**
 * Universal Tree Trace Dispatcher
 */
export function generateTreeTrace(
  state: TreeState<number>,
  operation: TreeOperationType,
  params: Record<string, unknown> = {},
  mode: "binary-tree" | "bst" = "bst"
): ExecutionTrace<TreeState<number>> {
  switch (operation) {
    case "insert":
      return generateBSTInsertTrace(state, Number(params.value ?? 45));
    case "search":
      return generateBSTSearchTrace(state, Number(params.target ?? 60), "search");
    case "contains":
      return generateBSTSearchTrace(state, Number(params.target ?? 60), "contains");
    case "minimum":
      return generateBSTExtremeTrace(state, true);
    case "maximum":
      return generateBSTExtremeTrace(state, false);
    case "successor":
      return generateBSTSuccessorPredecessorTrace(state, Number(params.target ?? 50), true);
    case "predecessor":
      return generateBSTSuccessorPredecessorTrace(state, Number(params.target ?? 50), false);
    case "delete":
      return generateBSTDeleteTrace(state, Number(params.target ?? 70));
    case "insert-node":
      return generateBinaryTreeInsertNodeTrace(
        state,
        params.parentId ? String(params.parentId) : null,
        (params.direction as "left" | "right") || "left",
        Number(params.value ?? 25)
      );
    case "update":
      return generateBinaryTreeUpdateTrace(
        state,
        String(params.nodeId ?? state.rootId),
        Number(params.value ?? 99)
      );
    case "delete-node":
      return generateBSTDeleteTrace(state, Number(params.target ?? 30));
    case "inorder":
      return generateTreeTraversalTrace(state, "inorder", mode);
    case "preorder":
      return generateTreeTraversalTrace(state, "preorder", mode);
    case "postorder":
      return generateTreeTraversalTrace(state, "postorder", mode);
    case "level-order":
      return generateTreeTraversalTrace(state, "level-order", mode);
    case "clear":
      return generateClearTreeTrace();
    default:
      return generateBSTInsertTrace(state, Number(params.value ?? 45));
  }
}
