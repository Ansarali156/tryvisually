/**
 * Heap & Priority Queue Validation & Helper Utilities
 *
 * Implements deterministic ID generators, complete binary tree index formulas,
 * invariant validators, builders, and statistics calculators.
 */

import type {
  HeapElement,
  HeapState,
  HeapType,
  PriorityQueueElement,
  PriorityQueueState,
} from "./types";

export const MAX_HEAP_ELEMENTS = 50;

/**
 * Validates a numeric heap value.
 */
export function validateHeapValue(value: unknown): { isValid: boolean; parsedValue?: number; sanitizedValue?: number; error?: string } {
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

  return { isValid: true, parsedValue: num, sanitizedValue: num };
}

/**
 * Validates a task name.
 */
export function validateTaskName(name: unknown): { isValid: boolean; parsedName?: string; sanitizedValue?: string; error?: string } {
  if (typeof name !== "string" || name.trim().length === 0) {
    return { isValid: false, error: "Task name cannot be empty." };
  }
  const clean = name.trim();
  if (clean.length > 24) {
    return { isValid: false, error: "Task name must be 24 characters or less." };
  }
  return { isValid: true, parsedName: clean, sanitizedValue: clean };
}

/**
 * Validates a numeric priority (1 to 999).
 */
export function validatePriority(priority: unknown): { isValid: boolean; parsedPriority?: number; sanitizedValue?: number; error?: string } {
  const res = validateHeapValue(priority);
  if (!res.isValid || res.sanitizedValue === undefined) {
    return res;
  }
  if (res.sanitizedValue < 1 || res.sanitizedValue > 999) {
    return { isValid: false, error: "Priority must be between 1 and 999." };
  }
  return { isValid: true, parsedPriority: res.sanitizedValue, sanitizedValue: res.sanitizedValue };
}

/**
 * Complete Binary Tree Array Index Relationships
 */
export function getParentIndex(i: number): number {
  return Math.floor((i - 1) / 2);
}

export function getLeftChildIndex(i: number): number {
  return 2 * i + 1;
}

export function getRightChildIndex(i: number): number {
  return 2 * i + 2;
}

/**
 * Deterministic element ID generator.
 * Invariant: Never depends on volatile memory counters or Date.now()
 * to guarantee 100% server/client HTML tree parity for SSR hydration.
 */
export function generateHeapElementId(value: number, disambiguator?: string | number): string {
  if (disambiguator !== undefined) {
    return `heap-node-${value}-${disambiguator}`;
  }
  return `heap-node-${value}`;
}

export function generatePQElementId(task: string, priority: number, disambiguator?: string | number): string {
  const clean = task.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "task";
  if (disambiguator !== undefined) {
    return `pq-task-${priority}-${clean}-${disambiguator}`;
  }
  return `pq-task-${priority}-${clean}`;
}

/**
 * Returns an empty heap state.
 */
export function createEmptyHeapState(type: HeapType = "min"): HeapState<number> {
  return {
    items: Object.freeze([]),
    heapType: type,
  };
}

/**
 * Returns a standard sample Min or Max heap state.
 */
export function createSampleHeapState(type: HeapType = "min"): HeapState<number> {
  if (type === "min") {
    // Valid Min Heap: [10, 20, 30, 40, 50, 60, 70]
    //         10
    //       /    \
    //     20      30
    //    /  \    /  \
    //   40  50  60  70
    const values = [10, 20, 30, 40, 50, 60, 70];
    const items: HeapElement<number>[] = values.map((val, idx) => ({
      id: generateHeapElementId(val, idx),
      value: val,
    }));
    return {
      items: Object.freeze(items),
      heapType: "min",
    };
  } else {
    // Valid Max Heap: [70, 60, 50, 40, 30, 20, 10]
    //         70
    //       /    \
    //     60      50
    //    /  \    /  \
    //   40  30  20  10
    const values = [70, 60, 50, 40, 30, 20, 10];
    const items: HeapElement<number>[] = values.map((val, idx) => ({
      id: generateHeapElementId(val, idx),
      value: val,
    }));
    return {
      items: Object.freeze(items),
      heapType: "max",
    };
  }
}

/**
 * Returns a standard sample Priority Queue state.
 */
export function createSamplePriorityQueueState(mode: "min" | "max" = "min"): PriorityQueueState {
  if (mode === "min") {
    // Min-Priority: lower priority number = higher urgency
    const rawTasks = [
      { task: "Task B", priority: 1 },
      { task: "Task C", priority: 2 },
      { task: "Task A", priority: 3 },
      { task: "Task D", priority: 4 },
      { task: "Task E", priority: 5 },
    ];
    const items: PriorityQueueElement[] = rawTasks.map((t, idx) => ({
      id: generatePQElementId(t.task, t.priority, idx),
      value: t.task,
      priority: t.priority,
    }));
    return {
      items: Object.freeze(items),
      mode: "min",
    };
  } else {
    // Max-Priority: higher priority number = higher urgency
    const rawTasks = [
      { task: "Task E", priority: 5 },
      { task: "Task D", priority: 4 },
      { task: "Task A", priority: 3 },
      { task: "Task C", priority: 2 },
      { task: "Task B", priority: 1 },
    ];
    const items: PriorityQueueElement[] = rawTasks.map((t, idx) => ({
      id: generatePQElementId(t.task, t.priority, idx),
      value: t.task,
      priority: t.priority,
    }));
    return {
      items: Object.freeze(items),
      mode: "max",
    };
  }
}

/**
 * Invariant Validator: Verifies whether an array satisfies the Complete Binary Tree & Heap Property.
 */
export function validateHeapInvariants(state: HeapState<number>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const { items, heapType } = state;
  const n = items.length;

  if (n === 0) {
    return { valid: true, errors: [] };
  }

  // Check unique stable IDs
  const idSet = new Set<string>();
  for (let i = 0; i < n; i++) {
    const el = items[i];
    if (!el || typeof el.id !== "string" || typeof el.value !== "number") {
      errors.push(`Invalid element structure at index ${i}.`);
      continue;
    }
    if (idSet.has(el.id)) {
      errors.push(`Duplicate element ID '${el.id}' detected at index ${i}.`);
    }
    idSet.add(el.id);
  }

  // Check heap property for every parent-child pair
  for (let i = 0; i < n; i++) {
    const leftIdx = getLeftChildIndex(i);
    const rightIdx = getRightChildIndex(i);
    const parentVal = items[i].value;

    if (leftIdx < n) {
      const leftVal = items[leftIdx].value;
      if (heapType === "min" && parentVal > leftVal) {
        errors.push(`Min Heap violation: parent at index ${i} (${parentVal}) > left child at index ${leftIdx} (${leftVal}).`);
      } else if (heapType === "max" && parentVal < leftVal) {
        errors.push(`Max Heap violation: parent at index ${i} (${parentVal}) < left child at index ${leftIdx} (${leftVal}).`);
      }
    }

    if (rightIdx < n) {
      const rightVal = items[rightIdx].value;
      if (heapType === "min" && parentVal > rightVal) {
        errors.push(`Min Heap violation: parent at index ${i} (${parentVal}) > right child at index ${rightIdx} (${rightVal}).`);
      } else if (heapType === "max" && parentVal < rightVal) {
        errors.push(`Max Heap violation: parent at index ${i} (${parentVal}) < right child at index ${rightIdx} (${rightVal}).`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isValidHeap(state: HeapState<number>): boolean {
  return validateHeapInvariants(state).valid;
}

/**
 * Invariant Validator for Priority Queue.
 */
export function validatePriorityQueueInvariants(state: PriorityQueueState): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const { items, mode } = state;
  const n = items.length;

  if (n === 0) return { valid: true, errors: [] };

  for (let i = 0; i < n; i++) {
    const leftIdx = getLeftChildIndex(i);
    const rightIdx = getRightChildIndex(i);
    const parentPriority = items[i].priority;

    if (leftIdx < n) {
      const leftP = items[leftIdx].priority;
      if (mode === "min" && parentPriority > leftP) {
        errors.push(`Min PQ violation: parent priority ${parentPriority} > child priority ${leftP}.`);
      } else if (mode === "max" && parentPriority < leftP) {
        errors.push(`Max PQ violation: parent priority ${parentPriority} < child priority ${leftP}.`);
      }
    }

    if (rightIdx < n) {
      const rightP = items[rightIdx].priority;
      if (mode === "min" && parentPriority > rightP) {
        errors.push(`Min PQ violation: parent priority ${parentPriority} > child priority ${rightP}.`);
      } else if (mode === "max" && parentPriority < rightP) {
        errors.push(`Max PQ violation: parent priority ${parentPriority} < child priority ${rightP}.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function isValidPriorityQueue(state: PriorityQueueState): boolean {
  return validatePriorityQueueInvariants(state).valid;
}

/**
 * Calculates heap height using the edge-based convention:
 * - Empty = -1
 * - Single element = 0
 * - Height = floor(log2(n))
 */
export function calculateHeapHeight(itemCountOrState: number | HeapState<number> | readonly unknown[]): number {
  const count = typeof itemCountOrState === "number"
    ? itemCountOrState
    : "items" in itemCountOrState
    ? itemCountOrState.items.length
    : itemCountOrState.length;

  if (count <= 0) return -1;
  return Math.floor(Math.log2(count));
}

/**
 * Gathers live statistics for Heap visualization cards.
 */
export function getHeapStatistics(state: HeapState<number>) {
  const count = state.items.length;
  const height = calculateHeapHeight(count);
  const root = count > 0 ? state.items[0].value : null;

  // In complete binary tree of size n, leaves start from floor(n/2) to n-1
  const leaves = count === 0 ? 0 : count - Math.floor(count / 2);

  const inv = validateHeapInvariants(state);

  return {
    size: count,
    height,
    root,
    min: root,
    leaves,
    leafCount: leaves,
    isComplete: true, // Complete binary tree representation is always structurally complete
    heapType: state.heapType,
    isValid: inv.valid,
    errors: inv.errors,
  };
}

/**
 * Gathers live statistics for Priority Queue visualization cards.
 */
export function getPriorityQueueStatistics(state: PriorityQueueState) {
  const count = state.items.length;
  const front = count > 0 ? state.items[0] : null;
  const inv = validatePriorityQueueInvariants(state);

  return {
    size: count,
    front,
    highestPriorityTask: front,
    mode: state.mode,
    isEmpty: count === 0,
    isValid: inv.valid,
    errors: inv.errors,
  };
}
