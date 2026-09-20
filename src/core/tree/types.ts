/**
 * Tree & Binary Search Tree (BST) Types
 *
 * Implements a strongly-typed, immutable tree data model with stable IDs
 * and execution state tracking for both general binary trees and BSTs.
 */

export interface TreeNode<T = number> {
  readonly id: string;
  readonly value: T;
  readonly leftId: string | null;
  readonly rightId: string | null;
  readonly parentId: string | null;
}

export interface CallStackFrame {
  readonly id: string;
  readonly functionName: string;
  readonly nodeId: string | null;
  readonly value?: number;
  readonly phase: "call" | "visit" | "return";
}

export interface TreeState<T = number> {
  readonly nodes: Readonly<Record<string, TreeNode<T>>>;
  readonly rootId: string | null;
  readonly traversalOutput?: readonly T[];
  readonly callStack?: readonly CallStackFrame[];
  readonly queue?: readonly string[];
}

export type TreeMode = "binary-tree" | "bst";

export type BSTOperationType =
  | "insert"
  | "search"
  | "delete"
  | "contains"
  | "minimum"
  | "maximum"
  | "successor"
  | "predecessor"
  | "inorder"
  | "preorder"
  | "postorder"
  | "level-order"
  | "clear";

export type BinaryTreeOperationType =
  | "insert-node"
  | "delete-node"
  | "search"
  | "update"
  | "inorder"
  | "preorder"
  | "postorder"
  | "level-order"
  | "clear";

export type TreeOperationType = BSTOperationType | BinaryTreeOperationType;

export interface TreeOperationDefinition {
  readonly id: TreeOperationType;
  readonly label: string;
  readonly description: string;
  readonly requiresValueInput?: boolean;
  readonly requiresTargetInput?: boolean;
  readonly requiresParentInput?: boolean;
  readonly requiresDirectionInput?: boolean;
  readonly requiresNodeInput?: boolean;
}

export const BST_OPERATIONS: readonly TreeOperationDefinition[] = [
  { id: "insert", label: "Insert", description: "Insert a new value into the BST preserving ordering", requiresValueInput: true },
  { id: "search", label: "Search", description: "Search for a value by binary branching left or right", requiresTargetInput: true },
  { id: "delete", label: "Delete", description: "Delete a node (handles leaf, 1-child, and 2-child cases)", requiresTargetInput: true },
  { id: "contains", label: "Contains", description: "Check if a value exists in the BST", requiresTargetInput: true },
  { id: "minimum", label: "Minimum", description: "Find the smallest key by following left pointers to the leaf" },
  { id: "maximum", label: "Maximum", description: "Find the largest key by following right pointers to the leaf" },
  { id: "successor", label: "Successor", description: "Find the next in-order value in the BST", requiresTargetInput: true },
  { id: "predecessor", label: "Predecessor", description: "Find the previous in-order value in the BST", requiresTargetInput: true },
  { id: "inorder", label: "Inorder", description: "Traverse Left -> Root -> Right (produces sorted keys)" },
  { id: "preorder", label: "Preorder", description: "Traverse Root -> Left -> Right" },
  { id: "postorder", label: "Postorder", description: "Traverse Left -> Right -> Root" },
  { id: "level-order", label: "Level Order", description: "Breadth-first search using a FIFO queue" },
  { id: "clear", label: "Clear", description: "Remove all nodes from the tree" },
];

export const BINARY_TREE_OPERATIONS: readonly TreeOperationDefinition[] = [
  { id: "insert-node", label: "Insert Node", description: "Insert a child node under a selected parent", requiresParentInput: true, requiresDirectionInput: true, requiresValueInput: true },
  { id: "delete-node", label: "Delete Node", description: "Remove a leaf node or node with single child", requiresNodeInput: true },
  { id: "search", label: "Search", description: "Search for a value across all tree nodes", requiresTargetInput: true },
  { id: "update", label: "Update", description: "Update the value of an existing node", requiresNodeInput: true, requiresValueInput: true },
  { id: "inorder", label: "Inorder", description: "Traverse Left -> Root -> Right" },
  { id: "preorder", label: "Preorder", description: "Traverse Root -> Left -> Right" },
  { id: "postorder", label: "Postorder", description: "Traverse Left -> Right -> Root" },
  { id: "level-order", label: "Level Order", description: "Breadth-first search level by level" },
  { id: "clear", label: "Clear", description: "Remove all nodes from the tree" },
];
