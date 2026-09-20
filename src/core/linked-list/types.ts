/**
 * Core Linked List Types & Data Model
 *
 * Requirements:
 * 1. Supports Singly, Doubly, and Circular Linked Lists.
 * 2. Stable string IDs for nodes (e.g. "node-1", "node-2"), independent of position.
 * 3. Explicit reference mapping (next and previous pointers).
 */

export type LinkedListVariant = "singly" | "doubly" | "circular";

export interface LinkedListNode {
  /** Stable string identifier representing the logical node (e.g. "node-1") */
  readonly id: string;
  /** Value payload stored in the node */
  readonly value: number;
}

export interface LinkedListState {
  /** Sequential ordered list of nodes currently in the list */
  readonly nodes: readonly LinkedListNode[];

  /** ID of the first node, or null if list is empty */
  readonly headId: string | null;

  /** ID of the last node, or null if list is empty */
  readonly tailId: string | null;

  /** Map of nodeId -> nextNodeId (or null if terminating) */
  readonly next: Readonly<Record<string, string | null>>;

  /** Map of nodeId -> previousNodeId (for doubly linked lists) */
  readonly previous?: Readonly<Record<string, string | null>>;

  /** Active variant of the linked list */
  readonly variant: LinkedListVariant;
}

export type LinkedListOperationType =
  | "traverse"
  | "search"
  | "access"
  | "insert-beginning"
  | "insert-end"
  | "insert-position"
  | "delete-beginning"
  | "delete-end"
  | "delete-position"
  | "update"
  | "reverse";

export interface LinkedListOperationMetadata {
  readonly id: LinkedListOperationType;
  readonly name: string;
  readonly description: string;
  readonly category: "Traversal & Search" | "Insertion" | "Deletion" | "Transformation";
  readonly timeComplexity: {
    readonly best: string;
    readonly average: string;
    readonly worst: string;
  };
  readonly spaceComplexity: string;
}

export const LINKED_LIST_OPERATIONS: readonly LinkedListOperationMetadata[] = Object.freeze([
  {
    id: "traverse",
    name: "Traverse",
    description: "Visit every node sequentially from HEAD to end following pointer links.",
    category: "Traversal & Search",
    timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "search",
    name: "Search",
    description: "Scan nodes sequentially looking for a target value.",
    category: "Traversal & Search",
    timeComplexity: { best: "O(1)", average: "O(n)", worst: "O(n)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "access",
    name: "Access by Position",
    description: "Traverse the list from HEAD to reach the node at a specified zero-based index.",
    category: "Traversal & Search",
    timeComplexity: { best: "O(1) (at head)", average: "O(n)", worst: "O(n) (at tail)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "insert-beginning",
    name: "Insert at Beginning",
    description: "Create a new node, point it to old HEAD, and update HEAD in O(1) constant time.",
    category: "Insertion",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "insert-end",
    name: "Insert at End",
    description: "Append a new node to the TAIL in O(1) time when tail pointer is maintained.",
    category: "Insertion",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "insert-position",
    name: "Insert at Position",
    description: "Traverse to target position and splice the new node into the pointer chain.",
    category: "Insertion",
    timeComplexity: { best: "O(1) (at head)", average: "O(n)", worst: "O(n)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "delete-beginning",
    name: "Delete from Beginning",
    description: "Advance HEAD to the next node and detach the old head in O(1) constant time.",
    category: "Deletion",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "delete-end",
    name: "Delete from End",
    description: "Remove the tail node; requires O(n) traversal in singly linked, O(1) in doubly linked.",
    category: "Deletion",
    timeComplexity: { best: "O(1)", average: "O(n) / O(1)*", worst: "O(n)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "delete-position",
    name: "Delete at Position",
    description: "Traverse to target node, bypass it by rewiring adjacent pointers, and remove it.",
    category: "Deletion",
    timeComplexity: { best: "O(1) (at head)", average: "O(n)", worst: "O(n)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "update",
    name: "Update Value",
    description: "Traverse to target node and modify its value in-place while keeping its stable ID.",
    category: "Transformation",
    timeComplexity: { best: "O(1)", average: "O(n)", worst: "O(n)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "reverse",
    name: "Reverse List",
    description: "Reverse all pointer directions so TAIL becomes HEAD and HEAD becomes TAIL.",
    category: "Transformation",
    timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
    spaceComplexity: "O(1)",
  },
]);
