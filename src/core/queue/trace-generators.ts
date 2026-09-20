/**
 * Queue Operation Trace Generators
 *
 * Implements deterministic execution trace generators for both Linear Queue (FIFO)
 * and Circular Queue (modulo wrap-around in bounded buffer slots).
 * Invariants:
 * 1. Stable Element IDs are strictly preserved across enqueues, dequeues, and wrap-arounds.
 * 2. FRONT and REAR pointers are unambiguously tracked.
 * 3. Underflow and Overflow conditions are gracefully handled with educational feedback without crashing.
 */

import type { ExecutionTrace } from "@/core/execution/types";
import { createExecutionTrace } from "@/core/execution/trace/trace-builder";
import type { QueueElement, QueueOperationType, QueueState } from "./types";
import { generateQueueItemId } from "./validation";

/**
 * 1. ENQUEUE TRACE GENERATOR
 */
export function createEnqueueTrace(
  state: QueueState,
  value: number
): ExecutionTrace<QueueState> {
  const builder = createExecutionTrace<QueueState>({
    initialState: state,
    metadata: {
      algorithmId: "queue-enqueue",
      algorithmName: "Queue Enqueue",
      category: "Mutation",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  const isCircular = state.variant === "circular";

  // Check overflow
  if (state.size >= state.capacity) {
    builder.addStep({
      operation: "custom",
      codeLine: 2,
      variables: {
        value,
        size: state.size,
        capacity: state.capacity,
        isFull: true,
        error: "Queue Overflow",
      },
      state,
      highlightedElements: [],
      explanation: isCircular
        ? `Queue Overflow: Cannot enqueue ${value}. All ${state.capacity} circular buffer slots are currently occupied.`
        : `Queue Overflow: Cannot enqueue ${value}. The queue has reached its maximum visual limit of ${state.capacity} elements.`,
    });
    return builder.build();
  }

  // Linear Queue Enqueue
  if (!isCircular) {
    let maxId = 0;
    for (const item of state.items) {
      if (item) {
        const match = item.id.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxId) maxId = num;
        }
      }
    }
    const newElement: QueueElement = {
      id: generateQueueItemId(maxId + 1),
      value,
    };

    // Step 0: Preparation
    builder.addStep({
      operation: "custom",
      codeLine: 1,
      variables: {
        value,
        currentSize: state.size,
      },
      state,
      highlightedElements: [],
      explanation: `Preparing to enqueue value ${value} at the REAR of the linear queue.`,
    });

    // Step 1: Append to rear
    const updatedItems = [...state.items, newElement];
    const newSize = updatedItems.length;
    const finalState: QueueState = Object.freeze({
      variant: "linear",
      items: Object.freeze(updatedItems),
      frontIndex: 0,
      rearIndex: newSize - 1,
      size: newSize,
      capacity: state.capacity,
      frontId: updatedItems[0]!.id,
      rearId: newElement.id,
    });

    builder.addStep({
      operation: "insert",
      codeLine: 3,
      variables: {
        value,
        rearIndex: newSize - 1,
        frontIndex: 0,
        size: newSize,
      },
      state: finalState,
      highlightedElements: [newElement.id],
      metadata: {
        pointers: [
          { index: 0, label: "FRONT" },
          { index: newSize - 1, label: "REAR" },
        ],
      },
      explanation: `Enqueued ${value} at REAR (index ${newSize - 1}). Queue size is now ${newSize}.`,
    });

    return builder.build();
  }

  // Circular Queue Enqueue
  const newRearIndex = state.size === 0 ? 0 : (state.rearIndex + 1) % state.capacity;
  const wrappedAround = state.size > 0 && newRearIndex < state.rearIndex;

  // Step 0: Calculate wrap-around index
  builder.addStep({
    operation: "custom",
    codeLine: 3,
    variables: {
      value,
      currentRear: state.rearIndex,
      nextRear: newRearIndex,
      capacity: state.capacity,
      wrappedAround,
    },
    state,
    highlightedElements: [],
    explanation: wrappedAround
      ? `Circular Wrap-around! Rear index wrapped from slot ${state.rearIndex} to slot ${newRearIndex} via (rear + 1) % ${state.capacity}.`
      : `Advancing rear index to slot ${newRearIndex} via (${state.rearIndex} + 1) % ${state.capacity}.`,
  });

  // Step 1: Place element into calculated slot
  let maxCircularId = 0;
  for (const item of state.items) {
    if (item) {
      const match = item.id.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxCircularId) maxCircularId = num;
      }
    }
  }
  const newElement: QueueElement = {
    id: generateQueueItemId(maxCircularId + 1),
    value,
  };

  const newSlots = [...state.items];
  newSlots[newRearIndex] = newElement;

  const newFrontIndex = state.size === 0 ? 0 : state.frontIndex;
  const newSize = state.size + 1;

  const finalCircularState: QueueState = Object.freeze({
    variant: "circular",
    items: Object.freeze(newSlots),
    frontIndex: newFrontIndex,
    rearIndex: newRearIndex,
    size: newSize,
    capacity: state.capacity,
    frontId: newSlots[newFrontIndex]?.id ?? null,
    rearId: newElement.id,
  });

  builder.addStep({
    operation: "insert",
    codeLine: 4,
    variables: {
      value,
      slotIndex: newRearIndex,
      frontIndex: newFrontIndex,
      rearIndex: newRearIndex,
      size: newSize,
      wrappedAround,
    },
    state: finalCircularState,
    highlightedElements: [newElement.id],
    metadata: {
      pointers: [
        { index: newFrontIndex, label: "FRONT" },
        { index: newRearIndex, label: "REAR" },
      ],
    },
    explanation: `Enqueued ${value} into slot [${newRearIndex}]. REAR now points to slot ${newRearIndex}.${
      wrappedAround ? " (Wrapped around to start of buffer)" : ""
    }`,
  });

  return builder.build();
}

/**
 * 2. DEQUEUE TRACE GENERATOR
 */
export function createDequeueTrace(state: QueueState): ExecutionTrace<QueueState> {
  const builder = createExecutionTrace<QueueState>({
    initialState: state,
    metadata: {
      algorithmId: "queue-dequeue",
      algorithmName: "Queue Dequeue",
      category: "Mutation",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  // Check underflow
  if (state.size === 0) {
    builder.addStep({
      operation: "custom",
      codeLine: 2,
      variables: {
        error: "Queue Underflow",
        isEmpty: true,
        size: 0,
      },
      state,
      highlightedElements: [],
      explanation: "Queue Underflow: Cannot dequeue from an empty queue because there are no elements.",
    });
    return builder.build();
  }

  const isCircular = state.variant === "circular";

  // Linear Queue Dequeue
  if (!isCircular) {
    const frontElement = state.items[0]!;

    // Step 0: Identify front
    builder.addStep({
      operation: "select",
      codeLine: 4,
      variables: {
        frontValue: frontElement.value,
        frontId: frontElement.id,
        size: state.size,
      },
      state,
      highlightedElements: [frontElement.id],
      metadata: {
        pointers: [{ index: 0, label: "FRONT" }],
      },
      explanation: `Identified FRONT element: ${frontElement.value} (ID: "${frontElement.id}"). In FIFO, the oldest element exits first.`,
    });

    // Step 1: Remove front
    const remainingItems = state.items.slice(1);
    const newSize = remainingItems.length;
    const finalState: QueueState = Object.freeze({
      variant: "linear",
      items: Object.freeze(remainingItems),
      frontIndex: newSize > 0 ? 0 : -1,
      rearIndex: newSize > 0 ? newSize - 1 : -1,
      size: newSize,
      capacity: state.capacity,
      frontId: newSize > 0 ? remainingItems[0]!.id : null,
      rearId: newSize > 0 ? remainingItems[newSize - 1]!.id : null,
    });

    builder.addStep({
      operation: "delete",
      codeLine: 5,
      variables: {
        dequeuedValue: frontElement.value,
        size: newSize,
      },
      state: finalState,
      highlightedElements: newSize > 0 ? [remainingItems[0]!.id] : [],
      metadata: {
        pointers: newSize > 0 ? [
          { index: 0, label: "FRONT" },
          { index: newSize - 1, label: "REAR" },
        ] : [],
      },
      explanation: `Dequeued ${frontElement.value}. FRONT moved to next element. Remaining size: ${newSize}.`,
    });

    return builder.build();
  }

  // Circular Queue Dequeue
  const frontElement = state.items[state.frontIndex]!;

  // Step 0: Identify front slot
  builder.addStep({
    operation: "select",
    codeLine: 4,
    variables: {
      frontIndex: state.frontIndex,
      frontValue: frontElement.value,
      frontId: frontElement.id,
      size: state.size,
    },
    state,
    highlightedElements: [frontElement.id],
    metadata: {
      pointers: [{ index: state.frontIndex, label: "FRONT" }],
    },
    explanation: `Identified FRONT element at slot [${state.frontIndex}]: ${frontElement.value}.`,
  });

  // Step 1: Clear slot and advance front pointer
  const newSlots = [...state.items];
  newSlots[state.frontIndex] = null;

  const nextFrontIndex = state.size === 1 ? -1 : (state.frontIndex + 1) % state.capacity;
  const nextRearIndex = state.size === 1 ? -1 : state.rearIndex;
  const wrappedAround = state.size > 1 && nextFrontIndex < state.frontIndex;
  const newSize = state.size - 1;

  const finalCircularState: QueueState = Object.freeze({
    variant: "circular",
    items: Object.freeze(newSlots),
    frontIndex: nextFrontIndex,
    rearIndex: nextRearIndex,
    size: newSize,
    capacity: state.capacity,
    frontId: nextFrontIndex >= 0 && newSlots[nextFrontIndex] ? newSlots[nextFrontIndex]!.id : null,
    rearId: nextRearIndex >= 0 && newSlots[nextRearIndex] ? newSlots[nextRearIndex]!.id : null,
  });

  builder.addStep({
    operation: "delete",
    codeLine: 6,
    variables: {
      dequeuedValue: frontElement.value,
      newFrontIndex: nextFrontIndex,
      size: newSize,
      wrappedAround,
    },
    state: finalCircularState,
    highlightedElements: nextFrontIndex >= 0 && newSlots[nextFrontIndex] ? [newSlots[nextFrontIndex]!.id] : [],
    metadata: {
      pointers: nextFrontIndex >= 0 ? [
        { index: nextFrontIndex, label: "FRONT" },
        { index: nextRearIndex, label: "REAR" },
      ] : [],
    },
    explanation: `Dequeued ${frontElement.value} from slot [${state.frontIndex}]. ${
      wrappedAround
        ? `FRONT wrapped around to slot [${nextFrontIndex}].`
        : nextFrontIndex >= 0
        ? `FRONT advanced to slot [${nextFrontIndex}].`
        : "Queue is now empty."
    }`,
  });

  return builder.build();
}

/**
 * 3. FRONT / PEEK TRACE GENERATOR
 */
export function createFrontTrace(state: QueueState): ExecutionTrace<QueueState> {
  const builder = createExecutionTrace<QueueState>({
    initialState: state,
    metadata: {
      algorithmId: "queue-front",
      algorithmName: "Queue Front",
      category: "Inspection",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  if (state.size === 0) {
    builder.addStep({
      operation: "custom",
      codeLine: 2,
      variables: { isEmpty: true, size: 0 },
      state,
      highlightedElements: [],
      explanation: "Queue is empty: Cannot read FRONT of an empty queue.",
    });
    return builder.build();
  }

  const frontItem = state.variant === "circular"
    ? state.items[state.frontIndex]!
    : state.items[0]!;

  builder.addStep({
    operation: "select",
    codeLine: 3,
    variables: {
      frontIndex: state.frontIndex,
      frontValue: frontItem.value,
      frontId: frontItem.id,
      size: state.size,
    },
    state,
    highlightedElements: [frontItem.id],
    metadata: {
      pointers: [{ index: state.frontIndex, label: "FRONT" }],
    },
    explanation: `Front: The element at FRONT is ${frontItem.value} (ID: "${frontItem.id}"). The queue is unchanged.`,
  });

  return builder.build();
}

/**
 * 4. REAR TRACE GENERATOR
 */
export function createRearTrace(state: QueueState): ExecutionTrace<QueueState> {
  const builder = createExecutionTrace<QueueState>({
    initialState: state,
    metadata: {
      algorithmId: "queue-rear",
      algorithmName: "Queue Rear",
      category: "Inspection",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  if (state.size === 0) {
    builder.addStep({
      operation: "custom",
      codeLine: 2,
      variables: { isEmpty: true, size: 0 },
      state,
      highlightedElements: [],
      explanation: "Queue is empty: Cannot read REAR of an empty queue.",
    });
    return builder.build();
  }

  const rearItem = state.variant === "circular"
    ? state.items[state.rearIndex]!
    : state.items[state.size - 1]!;

  builder.addStep({
    operation: "select",
    codeLine: 3,
    variables: {
      rearIndex: state.rearIndex,
      rearValue: rearItem.value,
      rearId: rearItem.id,
      size: state.size,
    },
    state,
    highlightedElements: [rearItem.id],
    metadata: {
      pointers: [{ index: state.rearIndex, label: "REAR" }],
    },
    explanation: `Rear: The element at REAR is ${rearItem.value} (ID: "${rearItem.id}"). The queue is unchanged.`,
  });

  return builder.build();
}

/**
 * 5. IS EMPTY TRACE GENERATOR
 */
export function createIsEmptyTrace(state: QueueState): ExecutionTrace<QueueState> {
  const builder = createExecutionTrace<QueueState>({
    initialState: state,
    metadata: {
      algorithmId: "queue-is-empty",
      algorithmName: "Queue Is Empty",
      category: "Inspection",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  const isEmpty = state.size === 0;

  builder.addStep({
    operation: "custom",
    codeLine: 2,
    variables: { size: state.size, isEmpty },
    state,
    highlightedElements: state.frontId ? [state.frontId] : [],
    explanation: isEmpty
      ? "Queue Is Empty: The queue holds 0 elements (isEmpty = True)."
      : `Queue Is NOT Empty: The queue currently holds ${state.size} element(s) (isEmpty = False).`,
  });

  return builder.build();
}

/**
 * 6. IS FULL TRACE GENERATOR
 */
export function createIsFullTrace(state: QueueState): ExecutionTrace<QueueState> {
  const builder = createExecutionTrace<QueueState>({
    initialState: state,
    metadata: {
      algorithmId: "queue-is-full",
      algorithmName: "Queue Is Full",
      category: "Inspection",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  const isFull = state.size >= state.capacity;

  builder.addStep({
    operation: "custom",
    codeLine: 2,
    variables: { size: state.size, capacity: state.capacity, isFull },
    state,
    highlightedElements: state.rearId ? [state.rearId] : [],
    explanation: isFull
      ? `Queue Is Full: All ${state.capacity} slots are occupied (isFull = True). Next enqueue will overflow.`
      : `Queue Is NOT Full: Available space for ${state.capacity - state.size} more element(s) (isFull = False).`,
  });

  return builder.build();
}

/**
 * 7. SIZE TRACE GENERATOR
 */
export function createSizeTrace(state: QueueState): ExecutionTrace<QueueState> {
  const builder = createExecutionTrace<QueueState>({
    initialState: state,
    metadata: {
      algorithmId: "queue-size",
      algorithmName: "Queue Size",
      category: "Inspection",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  builder.addStep({
    operation: "custom",
    codeLine: 2,
    variables: { size: state.size, capacity: state.capacity },
    state,
    highlightedElements: state.frontId ? [state.frontId] : [],
    explanation: `Queue Size: The queue currently holds ${state.size} element(s) (capacity: ${state.capacity}).`,
  });

  return builder.build();
}

/**
 * 8. CLEAR TRACE GENERATOR
 */
export function createClearTrace(state: QueueState): ExecutionTrace<QueueState> {
  const builder = createExecutionTrace<QueueState>({
    initialState: state,
    metadata: {
      algorithmId: "queue-clear",
      algorithmName: "Queue Clear",
      category: "Mutation",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  if (state.size === 0) {
    builder.addStep({
      operation: "custom",
      codeLine: 1,
      variables: { size: 0, isEmpty: true },
      state,
      highlightedElements: [],
      explanation: "Queue is already empty. Nothing to clear.",
    });
    return builder.build();
  }

  const isCircular = state.variant === "circular";
  const emptyItems = isCircular ? new Array(state.capacity).fill(null) : [];

  const emptyState: QueueState = Object.freeze({
    variant: state.variant,
    items: Object.freeze(emptyItems),
    frontIndex: -1,
    rearIndex: -1,
    size: 0,
    capacity: state.capacity,
    frontId: null,
    rearId: null,
  });

  builder.addStep({
    operation: "delete",
    codeLine: 2,
    variables: { size: 0, isEmpty: true },
    state: emptyState,
    highlightedElements: [],
    explanation: "Queue cleared successfully. All elements have been removed.",
  });

  return builder.build();
}

/**
 * Universal dispatcher for all Queue operations.
 */
export function generateQueueTrace(
  state: QueueState,
  operation: QueueOperationType,
  params: Record<string, number> = {}
): ExecutionTrace<QueueState> {
  switch (operation) {
    case "enqueue":
      return createEnqueueTrace(state, params.value ?? 42);
    case "dequeue":
      return createDequeueTrace(state);
    case "front":
      return createFrontTrace(state);
    case "rear":
      return createRearTrace(state);
    case "isEmpty":
      return createIsEmptyTrace(state);
    case "isFull":
      return createIsFullTrace(state);
    case "size":
      return createSizeTrace(state);
    case "clear":
      return createClearTrace(state);
    default:
      return createFrontTrace(state);
  }
}
