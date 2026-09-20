/**
 * Stack Operation Trace Generators
 *
 * Implements deterministic execution trace generators for LIFO Stack operations.
 * Invariants:
 * 1. Stable Element IDs are strictly preserved across all operations.
 * 2. TOP pointer is unambiguously tracked at all times.
 * 3. Underflow and Overflow conditions are gracefully handled with educational feedback without crashing.
 */

import type { ExecutionTrace } from "@/core/execution/types";
import { createExecutionTrace } from "@/core/execution/trace/trace-builder";
import type { StackElement, StackOperationType, StackState } from "./types";
import { generateStackItemId } from "./validation";

/**
 * 1. PUSH TRACE GENERATOR
 */
export function createPushTrace(
  state: StackState,
  value: number
): ExecutionTrace<StackState> {
  const builder = createExecutionTrace<StackState>({
    initialState: state,
    metadata: {
      algorithmId: "stack-push",
      algorithmName: "Stack Push",
      category: "Mutation",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  // Check overflow
  if (state.items.length >= state.capacity) {
    builder.addStep({
      operation: "custom",
      codeLine: 2,
      variables: {
        value,
        size: state.items.length,
        capacity: state.capacity,
        error: "Stack Overflow",
      },
      state,
      highlightedElements: [],
      explanation: `Stack Overflow: Cannot push ${value}. The stack has reached its maximum visual capacity of ${state.capacity} elements.`,
    });
    return builder.build();
  }

  // Step 0: Initial preparation
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: {
      value,
      currentTop: state.topId,
      size: state.items.length,
    },
    state,
    highlightedElements: [],
    explanation: `Preparing to push new value ${value} onto the stack.`,
  });

  // Step 1: Allocate new stack element with deterministic ID
  let maxId = 0;
  for (const item of state.items) {
    const match = item.id.match(/\d+$/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num > maxId) maxId = num;
    }
  }
  const newElement: StackElement = {
    id: generateStackItemId(maxId + 1),
    value,
  };

  builder.addStep({
    operation: "insert",
    codeLine: 3,
    variables: {
      value,
      newElementId: newElement.id,
      size: state.items.length,
    },
    state,
    highlightedElements: [],
    metadata: {
      pointers: [{ index: state.items.length, label: "new" }],
    },
    explanation: `Created new element with value ${value} (ID: "${newElement.id}").`,
  });

  // Step 2: Place on top of stack
  const updatedItems = [...state.items, newElement];
  const finalState: StackState = Object.freeze({
    items: Object.freeze(updatedItems),
    topId: newElement.id,
    capacity: state.capacity,
  });

  builder.addStep({
    operation: "insert",
    codeLine: 4,
    variables: {
      value,
      top: updatedItems.length - 1,
      topId: newElement.id,
      size: updatedItems.length,
    },
    state: finalState,
    highlightedElements: [newElement.id],
    metadata: {
      pointers: [{ index: updatedItems.length - 1, label: "TOP" }],
    },
    explanation: `Pushed ${value} onto TOP of stack. New stack size is ${updatedItems.length}.`,
  });

  return builder.build();
}

/**
 * 2. POP TRACE GENERATOR
 */
export function createPopTrace(state: StackState): ExecutionTrace<StackState> {
  const builder = createExecutionTrace<StackState>({
    initialState: state,
    metadata: {
      algorithmId: "stack-pop",
      algorithmName: "Stack Pop",
      category: "Mutation",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  // Check underflow
  if (state.items.length === 0) {
    builder.addStep({
      operation: "custom",
      codeLine: 2,
      variables: {
        error: "Stack Underflow",
        isEmpty: true,
        size: 0,
      },
      state,
      highlightedElements: [],
      explanation: "Stack Underflow: Cannot pop from an empty stack because there are no elements to remove.",
    });
    return builder.build();
  }

  const topIndex = state.items.length - 1;
  const topElement = state.items[topIndex];

  // Step 0: Identify TOP element
  builder.addStep({
    operation: "select",
    codeLine: 4,
    variables: {
      topIndex,
      topValue: topElement.value,
      topId: topElement.id,
      size: state.items.length,
    },
    state,
    highlightedElements: [topElement.id],
    metadata: {
      pointers: [{ index: topIndex, label: "TOP" }],
    },
    explanation: `Identified top element: value ${topElement.value} (ID: "${topElement.id}"). In LIFO, this will be removed first.`,
  });

  // Step 1: Pop the element and update TOP pointer
  const remainingItems = state.items.slice(0, topIndex);
  const newTopId = remainingItems.length > 0 ? remainingItems[remainingItems.length - 1].id : null;

  const finalState: StackState = Object.freeze({
    items: Object.freeze(remainingItems),
    topId: newTopId,
    capacity: state.capacity,
  });

  builder.addStep({
    operation: "delete",
    codeLine: 5,
    variables: {
      poppedValue: topElement.value,
      newTop: remainingItems.length > 0 ? remainingItems.length - 1 : -1,
      newTopId,
      size: remainingItems.length,
    },
    state: finalState,
    highlightedElements: newTopId ? [newTopId] : [],
    metadata: {
      pointers: remainingItems.length > 0 ? [{ index: remainingItems.length - 1, label: "TOP" }] : [],
    },
    explanation: `Popped ${topElement.value} from the stack. ${
      newTopId
        ? `New TOP is ${remainingItems[remainingItems.length - 1].value}.`
        : "The stack is now empty."
    }`,
  });

  return builder.build();
}

/**
 * 3. PEEK TRACE GENERATOR
 */
export function createPeekTrace(state: StackState): ExecutionTrace<StackState> {
  const builder = createExecutionTrace<StackState>({
    initialState: state,
    metadata: {
      algorithmId: "stack-peek",
      algorithmName: "Stack Peek",
      category: "Inspection",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  if (state.items.length === 0) {
    builder.addStep({
      operation: "custom",
      codeLine: 2,
      variables: {
        isEmpty: true,
        size: 0,
      },
      state,
      highlightedElements: [],
      explanation: "Stack is empty: Cannot peek into an empty stack.",
    });
    return builder.build();
  }

  const topIndex = state.items.length - 1;
  const topElement = state.items[topIndex];

  builder.addStep({
    operation: "select",
    codeLine: 4,
    variables: {
      topIndex,
      topValue: topElement.value,
      topId: topElement.id,
      size: state.items.length,
    },
    state,
    highlightedElements: [topElement.id],
    metadata: {
      pointers: [{ index: topIndex, label: "TOP" }],
    },
    explanation: `Peek: Current TOP element is ${topElement.value} (ID: "${topElement.id}"). The stack remains unchanged.`,
  });

  return builder.build();
}

/**
 * 4. IS EMPTY TRACE GENERATOR
 */
export function createIsEmptyTrace(state: StackState): ExecutionTrace<StackState> {
  const builder = createExecutionTrace<StackState>({
    initialState: state,
    metadata: {
      algorithmId: "stack-is-empty",
      algorithmName: "Stack Is Empty",
      category: "Inspection",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  const isEmpty = state.items.length === 0;

  builder.addStep({
    operation: "custom",
    codeLine: 2,
    variables: {
      size: state.items.length,
      isEmpty,
    },
    state,
    highlightedElements: state.topId ? [state.topId] : [],
    explanation: isEmpty
      ? "Stack Is Empty: The stack contains 0 elements (isEmpty = True)."
      : `Stack Is NOT Empty: The stack currently holds ${state.items.length} element(s) (isEmpty = False).`,
  });

  return builder.build();
}

/**
 * 5. SIZE TRACE GENERATOR
 */
export function createSizeTrace(state: StackState): ExecutionTrace<StackState> {
  const builder = createExecutionTrace<StackState>({
    initialState: state,
    metadata: {
      algorithmId: "stack-size",
      algorithmName: "Stack Size",
      category: "Inspection",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  builder.addStep({
    operation: "custom",
    codeLine: 2,
    variables: {
      size: state.items.length,
      capacity: state.capacity,
    },
    state,
    highlightedElements: state.topId ? [state.topId] : [],
    explanation: `Stack Size: The stack currently contains ${state.items.length} element(s).`,
  });

  return builder.build();
}

/**
 * 6. CLEAR TRACE GENERATOR
 */
export function createClearTrace(state: StackState): ExecutionTrace<StackState> {
  const builder = createExecutionTrace<StackState>({
    initialState: state,
    metadata: {
      algorithmId: "stack-clear",
      algorithmName: "Stack Clear",
      category: "Mutation",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  if (state.items.length === 0) {
    builder.addStep({
      operation: "custom",
      codeLine: 1,
      variables: { size: 0, isEmpty: true },
      state,
      highlightedElements: [],
      explanation: "Stack is already empty. Nothing to clear.",
    });
    return builder.build();
  }

  // Step 0: Indicate clearing
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { itemsToClear: state.items.length },
    state,
    highlightedElements: state.items.map((it) => it.id),
    explanation: `Clearing all ${state.items.length} elements from the stack.`,
  });

  // Step 1: Empty state
  const emptyState: StackState = Object.freeze({
    items: Object.freeze([]),
    topId: null,
    capacity: state.capacity,
  });

  builder.addStep({
    operation: "delete",
    codeLine: 2,
    variables: { size: 0, isEmpty: true },
    state: emptyState,
    highlightedElements: [],
    explanation: "Stack cleared successfully. All elements have been removed.",
  });

  return builder.build();
}

/**
 * Universal dispatcher for all Stack operations.
 */
export function generateStackTrace(
  state: StackState,
  operation: StackOperationType,
  params: Record<string, number> = {}
): ExecutionTrace<StackState> {
  switch (operation) {
    case "push":
      return createPushTrace(state, params.value ?? 42);
    case "pop":
      return createPopTrace(state);
    case "peek":
      return createPeekTrace(state);
    case "isEmpty":
      return createIsEmptyTrace(state);
    case "size":
      return createSizeTrace(state);
    case "clear":
      return createClearTrace(state);
    default:
      return createPeekTrace(state);
  }
}
