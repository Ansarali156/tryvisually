/**
 * Core Queue Data Types & Operation Definitions
 *
 * Defines the immutable Queue state model supporting both Linear Queue (FIFO)
 * and Circular Queue (bounded buffer with modulo wrap-around), with stable element identities.
 */

export type QueueVariant = "linear" | "circular";

export interface QueueElement {
  readonly id: string; // Unique stable identity (e.g. "queue-item-1")
  readonly value: number; // Numeric payload
}

export interface QueueState {
  readonly variant: QueueVariant;
  readonly items: readonly (QueueElement | null)[]; // Fixed capacity array of slots for circular, dynamic for linear
  readonly frontIndex: number; // Index of current FRONT element (-1 if empty)
  readonly rearIndex: number; // Index of current REAR element (-1 if empty)
  readonly size: number; // Count of active elements
  readonly capacity: number; // Maximum slots (fixed for circular, default limit for linear)
  readonly frontId: string | null; // Stable ID of FRONT element
  readonly rearId: string | null; // Stable ID of REAR element
}

export type QueueOperationType =
  | "enqueue"
  | "dequeue"
  | "front"
  | "rear"
  | "isEmpty"
  | "isFull"
  | "size"
  | "clear";

export interface QueueOperationMetadata {
  readonly id: QueueOperationType;
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

export const QUEUE_OPERATIONS: readonly QueueOperationMetadata[] = Object.freeze([
  {
    id: "enqueue",
    name: "Enqueue",
    category: "Mutation",
    description: "Insert a new element at the REAR of the queue.",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "dequeue",
    name: "Dequeue",
    category: "Mutation",
    description: "Remove and return the oldest element from the FRONT of the queue.",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "front",
    name: "Front",
    category: "Inspection",
    description: "Inspect the value at the FRONT of the queue without removing it.",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "rear",
    name: "Rear",
    category: "Inspection",
    description: "Inspect the value at the REAR of the queue without removing it.",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "isEmpty",
    name: "Is Empty",
    category: "Inspection",
    description: "Check whether the queue contains zero elements.",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "isFull",
    name: "Is Full",
    category: "Inspection",
    description: "Check whether the queue has reached maximum capacity (Circular Queue).",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "size",
    name: "Size",
    category: "Inspection",
    description: "Determine the total count of elements currently stored in the queue.",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
  {
    id: "clear",
    name: "Clear",
    category: "Mutation",
    description: "Remove all elements, resetting the queue to an empty state.",
    timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
    spaceComplexity: "O(1)",
  },
]);
