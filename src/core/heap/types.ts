/**
 * Heap & Priority Queue Type Definitions
 *
 * Implements strongly typed data models for binary heaps (Min/Max)
 * and Priority Queues with stable element identities.
 */

export type HeapType = "min" | "max";

export interface HeapElement<T = number> {
  readonly id: string;
  readonly value: T;
}

export interface HeapState<T = number> {
  readonly items: readonly HeapElement<T>[];
  readonly heapType: HeapType;
}

export interface PriorityQueueElement {
  readonly id: string;
  readonly value: string;
  readonly priority: number;
}

export interface PriorityQueueState {
  readonly items: readonly PriorityQueueElement[];
  readonly mode: "min" | "max";
}

export type HeapOperationType =
  | "insert"
  | "extract-root"
  | "peek"
  | "delete"
  | "update"
  | "build-heap"
  | "heapify"
  | "clear";

export type PriorityQueueOperationType =
  | "enqueue"
  | "dequeue"
  | "peek"
  | "change-priority"
  | "remove"
  | "size"
  | "clear";

export interface HeapOperationDefinition {
  readonly id: HeapOperationType;
  readonly label: string;
  readonly description: string;
  readonly requiresValueInput?: boolean;
  readonly requiresIndexInput?: boolean;
  readonly requiresArrayInput?: boolean;
}

export interface PriorityQueueOperationDefinition {
  readonly id: PriorityQueueOperationType;
  readonly label: string;
  readonly description: string;
  readonly requiresTaskInput?: boolean;
  readonly requiresPriorityInput?: boolean;
  readonly requiresIdInput?: boolean;
}

export const HEAP_OPERATIONS: readonly HeapOperationDefinition[] = [
  { id: "insert", label: "Insert", description: "Append element to the end and sift up", requiresValueInput: true },
  { id: "extract-root", label: "Extract Root", description: "Remove root, move last element to root, and sift down" },
  { id: "peek", label: "Peek", description: "Inspect root element without mutation" },
  { id: "delete", label: "Delete", description: "Delete arbitrary element by index and restore heap property", requiresIndexInput: true },
  { id: "update", label: "Update", description: "Update element value at index and restore heap property", requiresIndexInput: true, requiresValueInput: true },
  { id: "build-heap", label: "Build Heap", description: "Bottom-up heap construction from arbitrary values", requiresArrayInput: true },
  { id: "heapify", label: "Heapify", description: "Run bottom-up sift-down across all internal nodes" },
  { id: "clear", label: "Clear", description: "Remove all elements from the heap" },
];

export const PRIORITY_QUEUE_OPERATIONS: readonly PriorityQueueOperationDefinition[] = [
  { id: "enqueue", label: "Enqueue", description: "Insert new task with priority into priority queue", requiresTaskInput: true, requiresPriorityInput: true },
  { id: "dequeue", label: "Dequeue", description: "Extract highest-priority task according to mode" },
  { id: "peek", label: "Peek", description: "Inspect highest-priority task at root" },
  { id: "change-priority", label: "Change Priority", description: "Update priority of a task and restore heap order", requiresIdInput: true, requiresPriorityInput: true },
  { id: "remove", label: "Remove", description: "Remove a task by ID", requiresIdInput: true },
  { id: "size", label: "Size", description: "Inspect total number of queued tasks" },
  { id: "clear", label: "Clear", description: "Remove all tasks from the priority queue" },
];
