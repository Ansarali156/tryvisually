/**
 * Core Stack Data Types & Operation Definitions
 *
 * Defines the immutable Stack state model with stable element identities (LIFO)
 * and execution operation metadata.
 */

export interface StackElement {
  readonly id: string; // Unique stable identity (e.g. "stack-item-1")
  readonly value: number; // Numeric payload
}

export interface StackState {
  readonly items: readonly StackElement[]; // Bottom of stack is index 0, Top is index length - 1
  readonly topId: string | null; // ID of the top element, or null if empty
  readonly capacity: number; // Display limit (default 15)
}

export type StackOperationType =
  | "push"
  | "pop"
  | "peek"
  | "isEmpty"
  | "size"
  | "clear";

export interface StackOperationMetadata {
  readonly id: StackOperationType;
  readonly name: string;
  readonly category: "Mutation" | "Inspection";
  readonly description: string;
  readonly timeComplexity: {
    readonly best: string;
    readonly average: string;
    readonly worst: string;
  };
  readonly spaceComplexity: string;
}

export const STACK_OPERATIONS: readonly StackOperationMetadata[] = Object.freeze([
  {
    id: "push",
    name: "Push",
    category: "Mutation",
    description: "Insert a new element onto the top of the stack.",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "pop",
    name: "Pop",
    category: "Mutation",
    description: "Remove and return the most recently inserted element from the top of the stack.",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "peek",
    name: "Peek",
    category: "Inspection",
    description: "Inspect the value at the top of the stack without removing it.",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "isEmpty",
    name: "Is Empty",
    category: "Inspection",
    description: "Check whether the stack contains any elements.",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "size",
    name: "Size",
    category: "Inspection",
    description: "Determine the total count of elements currently stored in the stack.",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "clear",
    name: "Clear",
    category: "Mutation",
    description: "Remove all elements, resetting the stack to an empty state.",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
]);
