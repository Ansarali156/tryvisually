/**
 * Core Array Visualizer Types
 *
 * Requirements:
 * 1. Strongly typed Array model with stable element IDs.
 * 2. Element ID represents the logical element; array index represents current position.
 * 3. Array operations: Access, Update, Insert, Delete, Linear Search, Compare, Swap, Bubble Sort.
 */

export interface ArrayElement {
  /** Stable string identifier representing the logical element (e.g., "array-item-1") */
  readonly id: string;
  /** Numeric payload stored in this element */
  readonly value: number;
}

export interface ArrayState {
  /** Current contiguous sequence of array elements */
  readonly items: readonly ArrayElement[];
}

export type ArrayOperationType =
  | "access"
  | "update"
  | "insert"
  | "delete"
  | "linear-search"
  | "compare"
  | "swap"
  | "bubble-sort";

export interface ArrayOperationMetadata {
  readonly id: ArrayOperationType;
  readonly name: string;
  readonly description: string;
  readonly category: "Basic Operations" | "Searching" | "Sorting";
  readonly timeComplexity: {
    readonly best: string;
    readonly average: string;
    readonly worst: string;
  };
  readonly spaceComplexity: string;
}

export const ARRAY_OPERATIONS: readonly ArrayOperationMetadata[] = Object.freeze([
  {
    id: "access",
    name: "Access",
    description: "Read an element directly by its zero-based index in constant time O(1).",
    category: "Basic Operations",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "update",
    name: "Update",
    description: "Overwrite the value of an element at a given index in constant time O(1).",
    category: "Basic Operations",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "insert",
    name: "Insert",
    description: "Insert a new element at an index, shifting all subsequent elements right in O(n) time.",
    category: "Basic Operations",
    timeComplexity: { best: "O(1) (at end)", average: "O(n)", worst: "O(n) (at beginning)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "delete",
    name: "Delete",
    description: "Remove an element from an index, shifting all subsequent elements left in O(n) time.",
    category: "Basic Operations",
    timeComplexity: { best: "O(1) (at end)", average: "O(n)", worst: "O(n) (at beginning)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "linear-search",
    name: "Linear Search",
    description: "Inspect elements sequentially from index 0 until the target is found or array ends.",
    category: "Searching",
    timeComplexity: { best: "O(1)", average: "O(n)", worst: "O(n)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "compare",
    name: "Compare",
    description: "Examine and evaluate the relative ordering of two elements at distinct indices.",
    category: "Basic Operations",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "swap",
    name: "Swap",
    description: "Exchange the positions of two elements while preserving their stable logical IDs.",
    category: "Basic Operations",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    description: "Repeatedly step through the list, compare adjacent elements, and swap them if out of order.",
    category: "Sorting",
    timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)",
  },
]);
