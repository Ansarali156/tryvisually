/**
 * Tree & BST Validation and Helper Utilities
 *
 * Implements invariant validations, deterministic tree generators,
 * height calculations, and tree statistics helpers.
 */

import type { TreeNode, TreeState } from "./types";

export const MAX_TREE_NODES = 50;

/**
 * Validates a numeric tree node value.
 */
export function validateNodeValue(value: unknown): { isValid: boolean; parsedValue?: number; error?: string } {
  if (value === undefined || value === null || value === "") {
    return { isValid: false, error: "Value cannot be empty." };
  }

  const num = typeof value === "number" ? value : Number(String(value).trim());

  if (Number.isNaN(num) || !Number.isInteger(num)) {
    return { isValid: false, error: "Value must be a valid integer." };
  }

  if (num < -999 || num > 9999) {
    return { isValid: false, error: "Value must be between -999 and 9999." };
  }

  return { isValid: true, parsedValue: num };
}

/**
 * Deterministic node ID generator.
 * Invariant: Never depends on volatile memory counters or Date.now(),
 * guaranteeing 100% server/client HTML tree parity for SSR hydration.
 */
export function generateTreeNodeId(value: number, disambiguator?: string | number): string {
  if (disambiguator !== undefined) {
    return `node-${value}-${disambiguator}`;
  }
  return `node-${value}`;
}

/**
 * Returns a pristine empty tree state.
 */
export function createEmptyTreeState(): TreeState<number> {
  return {
    nodes: Object.freeze({}),
    rootId: null,
  };
}

/**
 * Creates a balanced sample Binary Search Tree (values: 50, 30, 70, 20, 40, 60, 80).
 *
 *           50
 *         /    \
 *       30      70
 *      /  \    /  \
 *     20  40  60  80
 */
export function createSampleBSTState(): TreeState<number> {
  const nodes: Record<string, TreeNode<number>> = {
    "node-50": { id: "node-50", value: 50, leftId: "node-30", rightId: "node-70", parentId: null },
    "node-30": { id: "node-30", value: 30, leftId: "node-20", rightId: "node-40", parentId: "node-50" },
    "node-70": { id: "node-70", value: 70, leftId: "node-60", rightId: "node-80", parentId: "node-50" },
    "node-20": { id: "node-20", value: 20, leftId: null, rightId: null, parentId: "node-30" },
    "node-40": { id: "node-40", value: 40, leftId: null, rightId: null, parentId: "node-30" },
    "node-60": { id: "node-60", value: 60, leftId: null, rightId: null, parentId: "node-70" },
    "node-80": { id: "node-80", value: 80, leftId: null, rightId: null, parentId: "node-70" },
  };

  return {
    nodes: Object.freeze(nodes),
    rootId: "node-50",
  };
}

/**
 * Creates a skewed sample Binary Search Tree (values: 10, 20, 30, 40, 50).
 *
 *   10
 *     \
 *      20
 *        \
 *         30
 *           \
 *            40
 *              \
 *               50
 */
export function createSkewedBSTState(): TreeState<number> {
  const nodes: Record<string, TreeNode<number>> = {
    "node-10": { id: "node-10", value: 10, leftId: null, rightId: "node-20", parentId: null },
    "node-20": { id: "node-20", value: 20, leftId: null, rightId: "node-30", parentId: "node-10" },
    "node-30": { id: "node-30", value: 30, leftId: null, rightId: "node-40", parentId: "node-20" },
    "node-40": { id: "node-40", value: 40, leftId: null, rightId: "node-50", parentId: "node-30" },
    "node-50": { id: "node-50", value: 50, leftId: null, rightId: null, parentId: "node-40" },
  };

  return {
    nodes: Object.freeze(nodes),
    rootId: "node-10",
  };
}

/**
 * Creates a sample General Binary Tree (not strictly ordered as BST).
 *
 *          10
 *         /  \
 *        5    15
 *       / \
 *      2   7
 */
export function createSampleBinaryTreeState(): TreeState<number> {
  const nodes: Record<string, TreeNode<number>> = {
    "node-10": { id: "node-10", value: 10, leftId: "node-5", rightId: "node-15", parentId: null },
    "node-5": { id: "node-5", value: 5, leftId: "node-2", rightId: "node-7", parentId: "node-10" },
    "node-15": { id: "node-15", value: 15, leftId: null, rightId: null, parentId: "node-10" },
    "node-2": { id: "node-2", value: 2, leftId: null, rightId: null, parentId: "node-5" },
    "node-7": { id: "node-7", value: 7, leftId: null, rightId: null, parentId: "node-5" },
  };

  return {
    nodes: Object.freeze(nodes),
    rootId: "node-10",
  };
}

/**
 * Constructs a valid BST by sequentially inserting raw numbers.
 * Enforces uniqueness: duplicate numbers are ignored.
 */
export function buildBSTFromValues(values: readonly number[]): TreeState<number> {
  if (!values || values.length === 0) {
    return createEmptyTreeState();
  }

  const nodes: Record<string, TreeNode<number>> = {};
  let rootId: string | null = null;

  for (const rawVal of values) {
    if (Object.keys(nodes).length >= MAX_TREE_NODES) break;

    const val = Number(rawVal);
    const id = generateTreeNodeId(val);

    if (rootId === null) {
      nodes[id] = { id, value: val, leftId: null, rightId: null, parentId: null };
      rootId = id;
      continue;
    }

    // Traverse to locate insertion spot
    let currentId = rootId;
    let placed = false;

    while (!placed) {
      const current = nodes[currentId];
      if (!current) break;

      if (val === current.value) {
        // Reject duplicate in BST
        placed = true;
      } else if (val < current.value) {
        if (current.leftId === null) {
          nodes[id] = { id, value: val, leftId: null, rightId: null, parentId: currentId };
          nodes[currentId] = { ...current, leftId: id };
          placed = true;
        } else {
          currentId = current.leftId;
        }
      } else {
        if (current.rightId === null) {
          nodes[id] = { id, value: val, leftId: null, rightId: null, parentId: currentId };
          nodes[currentId] = { ...current, rightId: id };
          placed = true;
        } else {
          currentId = current.rightId;
        }
      }
    }
  }

  return {
    nodes: Object.freeze(nodes),
    rootId,
  };
}

/**
 * Invariant Checker: Verifies if the tree satisfies all Binary Search Tree properties.
 * Invariant: For every node, all left subtree values < node.value < all right subtree values.
 */
export function isValidBST(tree: TreeState<number>): boolean {
  if (!tree.rootId) {
    return true;
  }

  function validateSubtree(nodeId: string | null, min: number, max: number): boolean {
    if (!nodeId) return true;
    const node = tree.nodes[nodeId];
    if (!node) return false;

    if (node.value <= min || node.value >= max) {
      return false;
    }

    return (
      validateSubtree(node.leftId, min, node.value) &&
      validateSubtree(node.rightId, node.value, max)
    );
  }

  return validateSubtree(tree.rootId, -Infinity, Infinity);
}

/**
 * Invariant Checker: Verifies general structural binary tree invariants.
 * Checks:
 * - Exactly one root when non-empty
 * - Parent-child pointer reciprocity (child.parentId === parent.id)
 * - No dangling child references
 * - Acyclic structure and reachability of all nodes from root
 */
export function validateTreeInvariants(tree: TreeState<number>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const nodeIds = Object.keys(tree.nodes);

  if (nodeIds.length === 0) {
    if (tree.rootId !== null) {
      errors.push("Empty tree must have null rootId.");
    }
    return { valid: errors.length === 0, errors };
  }

  if (!tree.rootId || !tree.nodes[tree.rootId]) {
    errors.push("Non-empty tree must have a valid root node in nodes record.");
    return { valid: false, errors };
  }

  const rootNode = tree.nodes[tree.rootId];
  if (rootNode.parentId !== null) {
    errors.push("Root node must have parentId === null.");
  }

  const visited = new Set<string>();

  function dfs(nodeId: string, expectedParentId: string | null) {
    if (visited.has(nodeId)) {
      errors.push(`Cycle detected at node '${nodeId}'.`);
      return;
    }
    visited.add(nodeId);

    const node = tree.nodes[nodeId];
    if (!node) {
      errors.push(`Referenced node '${nodeId}' does not exist in nodes record.`);
      return;
    }

    if (node.parentId !== expectedParentId) {
      errors.push(
        `Pointer mismatch: node '${nodeId}' has parentId '${node.parentId}', expected '${expectedParentId}'.`
      );
    }

    if (node.leftId) {
      if (node.leftId === nodeId) {
        errors.push(`Node '${nodeId}' has itself as its left child.`);
      } else {
        dfs(node.leftId, nodeId);
      }
    }

    if (node.rightId) {
      if (node.rightId === nodeId) {
        errors.push(`Node '${nodeId}' has itself as its right child.`);
      } else {
        dfs(node.rightId, nodeId);
      }
    }
  }

  dfs(tree.rootId, null);

  for (const id of nodeIds) {
    if (!visited.has(id)) {
      errors.push(`Unreachable disconnected node '${id}' found in tree state.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates tree height using the standard edge-count convention:
 * - Empty tree = -1
 * - Single root leaf = 0
 * - Height = max edges along any root-to-leaf path
 */
export function calculateTreeHeight(tree: TreeState<number>): number {
  if (!tree.rootId || !tree.nodes[tree.rootId]) {
    return -1;
  }

  function getNodeHeight(nodeId: string | null): number {
    if (!nodeId) return -1;
    const node = tree.nodes[nodeId];
    if (!node) return -1;

    const leftH = getNodeHeight(node.leftId);
    const rightH = getNodeHeight(node.rightId);
    return Math.max(leftH, rightH) + 1;
  }

  return getNodeHeight(tree.rootId);
}

/**
 * Gathers comprehensive tree statistics for educational UI cards.
 */
export function getTreeStatistics(tree: TreeState<number>) {
  const nodeCount = Object.keys(tree.nodes).length;
  const height = calculateTreeHeight(tree);

  let leafCount = 0;
  let minVal: number | null = null;
  let maxVal: number | null = null;

  for (const node of Object.values(tree.nodes)) {
    if (!node.leftId && !node.rightId) {
      leafCount++;
    }
    if (minVal === null || node.value < minVal) {
      minVal = node.value;
    }
    if (maxVal === null || node.value > maxVal) {
      maxVal = node.value;
    }
  }

  const isBst = isValidBST(tree);
  const invariants = validateTreeInvariants(tree);

  return {
    nodeCount,
    height,
    leafCount,
    minValue: minVal,
    maxValue: maxVal,
    rootValue: tree.rootId && tree.nodes[tree.rootId] ? tree.nodes[tree.rootId].value : null,
    isBST: isBst,
    isValidStructure: invariants.valid,
  };
}
