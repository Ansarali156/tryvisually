/**
 * Heap & Priority Queue Execution Trace Generators
 *
 * Implements pure, deterministic trace generation for Min/Max Binary Heaps
 * and Priority Queues.
 *
 * Generates immutable ExecutionStep sequences containing:
 * - state snapshot (HeapState / PriorityQueueState)
 * - highlighted element IDs
 * - operation metadata & variables
 * - 1-indexed code line mappings
 * - beginner-friendly explanations
 */

import type { ExecutionTrace } from "@/core/execution/types";
import { createExecutionTrace } from "@/core/execution/trace/trace-builder";
import type {
  HeapState,
  HeapElement,
  HeapType,
  HeapOperationType,
  PriorityQueueState,
  PriorityQueueElement,
  PriorityQueueOperationType,
} from "./types";
import {
  getParentIndex,
  getLeftChildIndex,
  getRightChildIndex,
  generateHeapElementId,
  generatePQElementId,
  createEmptyHeapState,
} from "./validation";

// ============================================================================
// CLONING UTILITIES
// ============================================================================

function cloneHeapState(state: HeapState<number>): HeapState<number> {
  return {
    heapType: state.heapType,
    items: state.items.map((item) => ({ ...item })),
  };
}

function clonePQState(state: PriorityQueueState): PriorityQueueState {
  return {
    mode: state.mode,
    items: state.items.map((item) => ({ ...item })),
  };
}

function shouldSwapHeap(
  parentVal: number,
  childVal: number,
  heapType: HeapType
): boolean {
  if (heapType === "min") {
    return childVal < parentVal;
  }
  return childVal > parentVal;
}

function shouldSwapPQ(
  parentPri: number,
  childPri: number,
  mode: "min" | "max"
): boolean {
  if (mode === "min") {
    return childPri < parentPri;
  }
  return childPri > parentPri;
}

// ============================================================================
// 1. HEAP INSERT TRACE
// ============================================================================

export function generateHeapInsertTrace(
  initialState: HeapState<number>,
  value: number
): ExecutionTrace<HeapState<number>> {
  const builder = createExecutionTrace({
    initialState,
    metadata: { algorithmName: `${initialState.heapType.toUpperCase()} Heap Insert` },
  });

  const state = cloneHeapState(initialState);
  const heapType = state.heapType;
  const newElem: HeapElement<number> = {
    id: generateHeapElementId(value),
    value,
  };

  // Step 1: Append to end of array / tree
  const mutableItems = [...state.items, newElem];
  let currentState: HeapState<number> = { ...state, items: mutableItems };
  let currentIndex = mutableItems.length - 1;

  builder.addStep({
    operation: "insert",
    codeLine: 2,
    state: cloneHeapState(currentState),
    explanation: `Inserted ${value} at index ${currentIndex} (the next available leaf position in complete binary tree).`,
    highlightedElements: [newElem.id],
    variables: {
      val: value,
      index: currentIndex,
      parentIndex: getParentIndex(currentIndex),
      heapType,
    },
  });

  // Step 2: Sift Up
  while (currentIndex > 0) {
    const parentIndex = getParentIndex(currentIndex);
    const currentElem = mutableItems[currentIndex];
    const parentElem = mutableItems[parentIndex];

    // Compare with parent
    builder.addStep({
      operation: "compare",
      codeLine: 5,
      state: cloneHeapState(currentState),
      explanation: `Comparing node ${currentElem.value} at index ${currentIndex} with parent ${parentElem.value} at index ${parentIndex}.`,
      highlightedElements: [currentElem.id, parentElem.id],
      variables: {
        currentIndex,
        currentVal: currentElem.value,
        parentIndex,
        parentVal: parentElem.value,
        violatesHeap: shouldSwapHeap(parentElem.value, currentElem.value, heapType),
      },
    });

    if (shouldSwapHeap(parentElem.value, currentElem.value, heapType)) {
      // Swap with parent
      const temp = mutableItems[currentIndex];
      mutableItems[currentIndex] = mutableItems[parentIndex];
      mutableItems[parentIndex] = temp;
      currentState = { ...state, items: [...mutableItems] };

      builder.addStep({
        operation: "swap",
        codeLine: 6,
        state: cloneHeapState(currentState),
        explanation: `${heapType === "min" ? `${currentElem.value} < ${parentElem.value}` : `${currentElem.value} > ${parentElem.value}`}: Swapped node with parent to maintain ${heapType}-heap property.`,
        highlightedElements: [currentElem.id, parentElem.id],
        variables: {
          newIndex: parentIndex,
          oldIndex: currentIndex,
        },
      });

      currentIndex = parentIndex;
    } else {
      builder.addStep({
        operation: "compare",
        codeLine: 8,
        state: cloneHeapState(currentState),
        explanation: `Node ${currentElem.value} satisfies the ${heapType}-heap property with parent ${parentElem.value}. Sift up complete.`,
        highlightedElements: [currentElem.id],
        variables: {
          index: currentIndex,
          heapPropertySatisfied: true,
        },
      });
      break;
    }
  }

  return builder.build();
}

// ============================================================================
// 2. HEAP EXTRACT ROOT TRACE
// ============================================================================

export function generateHeapExtractRootTrace(
  initialState: HeapState<number>
): ExecutionTrace<HeapState<number>> {
  const builder = createExecutionTrace({
    initialState,
    metadata: { algorithmName: `${initialState.heapType.toUpperCase()} Heap Extract Root` },
  });

  const state = cloneHeapState(initialState);
  const heapType = state.heapType;

  if (state.items.length === 0) {
    builder.addStep({
      operation: "visit",
      codeLine: 2,
      state: cloneHeapState(state),
      explanation: "Heap is empty. Nothing to extract.",
      highlightedElements: [],
      variables: { isEmpty: true },
    });
    return builder.build();
  }

  const rootElem = state.items[0];

  // If only 1 element
  if (state.items.length === 1) {
    builder.addStep({
      operation: "delete",
      codeLine: 3,
      state: cloneHeapState(state),
      explanation: `Extracting only root element ${rootElem.value}.`,
      highlightedElements: [rootElem.id],
      variables: { extracted: rootElem.value },
    });

    const finalEmptyState: HeapState<number> = { ...state, items: [] };
    builder.addStep({
      operation: "delete",
      codeLine: 4,
      state: finalEmptyState,
      explanation: "Heap is now empty.",
      highlightedElements: [],
      variables: { size: 0 },
    });
    return builder.build();
  }

  // Step 1: Identify root to extract
  const lastElem = state.items[state.items.length - 1];
  builder.addStep({
    operation: "visit",
    codeLine: 3,
    state: cloneHeapState(state),
    explanation: `Identified root ${rootElem.value} at index 0 for extraction. Last element is ${lastElem.value} at index ${state.items.length - 1}.`,
    highlightedElements: [rootElem.id, lastElem.id],
    variables: { rootValue: rootElem.value, lastValue: lastElem.value },
  });

  // Step 2: Replace root with last element and pop last
  const mutableItems = [...state.items];
  const lastItem = mutableItems.pop()!;
  mutableItems[0] = lastItem;
  let currentState: HeapState<number> = { ...state, items: [...mutableItems] };

  builder.addStep({
    operation: "swap",
    codeLine: 5,
    state: cloneHeapState(currentState),
    explanation: `Replaced root with last element ${lastItem.value} and reduced heap size to ${mutableItems.length}. Now sifting down.`,
    highlightedElements: [lastItem.id],
    variables: { currentIndex: 0, currentVal: lastItem.value },
  });

  // Step 3: Sift Down from root
  let currentIndex = 0;
  const n = mutableItems.length;

  while (true) {
    let targetIndex = currentIndex;
    const leftIndex = getLeftChildIndex(currentIndex);
    const rightIndex = getRightChildIndex(currentIndex);

    const checkHighlights = [mutableItems[currentIndex].id];
    if (leftIndex < n) checkHighlights.push(mutableItems[leftIndex].id);
    if (rightIndex < n) checkHighlights.push(mutableItems[rightIndex].id);

    builder.addStep({
      operation: "compare",
      codeLine: 12,
      state: cloneHeapState(currentState),
      explanation: `Evaluating children for node ${mutableItems[currentIndex].value} at index ${currentIndex}. Left: ${leftIndex < n ? mutableItems[leftIndex].value : "none"}, Right: ${rightIndex < n ? mutableItems[rightIndex].value : "none"}.`,
      highlightedElements: checkHighlights,
      variables: {
        currentIndex,
        leftIndex: leftIndex < n ? leftIndex : null,
        rightIndex: rightIndex < n ? rightIndex : null,
      },
    });

    // Check left child
    if (
      leftIndex < n &&
      shouldSwapHeap(mutableItems[targetIndex].value, mutableItems[leftIndex].value, heapType)
    ) {
      targetIndex = leftIndex;
    }

    // Check right child (against whichever is currently targetIndex)
    if (
      rightIndex < n &&
      shouldSwapHeap(mutableItems[targetIndex].value, mutableItems[rightIndex].value, heapType)
    ) {
      targetIndex = rightIndex;
    }

    if (targetIndex !== currentIndex) {
      const parentNode = mutableItems[currentIndex];
      const targetChildNode = mutableItems[targetIndex];

      // Swap
      const temp = mutableItems[currentIndex];
      mutableItems[currentIndex] = mutableItems[targetIndex];
      mutableItems[targetIndex] = temp;
      currentState = { ...state, items: [...mutableItems] };

      builder.addStep({
        operation: "swap",
        codeLine: 16,
        state: cloneHeapState(currentState),
        explanation: `Swapped node ${parentNode.value} at index ${currentIndex} with ${heapType === "min" ? "smaller" : "larger"} child ${targetChildNode.value} at index ${targetIndex}.`,
        highlightedElements: [parentNode.id, targetChildNode.id],
        variables: {
          currentIndex: targetIndex,
          swappedWith: targetIndex,
        },
      });

      currentIndex = targetIndex;
    } else {
      builder.addStep({
        operation: "compare",
        codeLine: 18,
        state: cloneHeapState(currentState),
        explanation: `Node ${mutableItems[currentIndex].value} satisfies the ${heapType}-heap property with its children. Sift down complete.`,
        highlightedElements: [mutableItems[currentIndex].id],
        variables: { currentIndex, heapPropertySatisfied: true },
      });
      break;
    }
  }

  return builder.build();
}

// ============================================================================
// 3. HEAP PEEK TRACE
// ============================================================================

export function generateHeapPeekTrace(
  initialState: HeapState<number>
): ExecutionTrace<HeapState<number>> {
  const builder = createExecutionTrace({
    initialState,
    metadata: { algorithmName: `${initialState.heapType.toUpperCase()} Heap Peek` },
  });

  if (initialState.items.length === 0) {
    builder.addStep({
      operation: "visit",
      codeLine: 2,
      state: cloneHeapState(initialState),
      explanation: "Heap is empty. Root element does not exist.",
      highlightedElements: [],
      variables: { root: null },
    });
    return builder.build();
  }

  const root = initialState.items[0];
  builder.addStep({
    operation: "visit",
    codeLine: 3,
    state: cloneHeapState(initialState),
    explanation: `Peek root at index 0: value is ${root.value} (${initialState.heapType === "min" ? "minimum" : "maximum"} element in O(1) time).`,
    highlightedElements: [root.id],
    variables: { rootValue: root.value, index: 0 },
  });

  return builder.build();
}

// ============================================================================
// 4. HEAP DELETE ARBITRARY TRACE
// ============================================================================

export function generateHeapDeleteTrace(
  initialState: HeapState<number>,
  index: number
): ExecutionTrace<HeapState<number>> {
  const builder = createExecutionTrace({
    initialState,
    metadata: { algorithmName: `${initialState.heapType.toUpperCase()} Heap Delete` },
  });

  const state = cloneHeapState(initialState);
  const heapType = state.heapType;

  if (index < 0 || index >= state.items.length) {
    builder.addStep({
      operation: "visit",
      codeLine: 2,
      state: cloneHeapState(state),
      explanation: `Index ${index} is out of bounds [0, ${state.items.length - 1}].`,
      highlightedElements: [],
      variables: { error: "Index out of bounds", index },
    });
    return builder.build();
  }

  // If deleting root, delegate to extract root logic or execute here
  if (index === state.items.length - 1) {
    const target = state.items[index];
    builder.addStep({
      operation: "delete",
      codeLine: 3,
      state: cloneHeapState(state),
      explanation: `Removing last element ${target.value} at index ${index}. No sift needed.`,
      highlightedElements: [target.id],
      variables: { deletedValue: target.value, index },
    });
    const finalItems = state.items.slice(0, -1);
    builder.addStep({
      operation: "delete",
      codeLine: 4,
      state: { ...state, items: finalItems },
      explanation: `Element removed. Heap size is now ${finalItems.length}.`,
      highlightedElements: [],
      variables: { size: finalItems.length },
    });
    return builder.build();
  }

  const targetElem = state.items[index];
  const lastElem = state.items[state.items.length - 1];

  builder.addStep({
    operation: "visit",
    codeLine: 3,
    state: cloneHeapState(state),
    explanation: `Deleting element ${targetElem.value} at index ${index}. Will replace with last element ${lastElem.value}.`,
    highlightedElements: [targetElem.id, lastElem.id],
    variables: { targetIndex: index, targetVal: targetElem.value, lastVal: lastElem.value },
  });

  const mutableItems = [...state.items];
  const replacement = mutableItems.pop()!;
  mutableItems[index] = replacement;
  let currentState: HeapState<number> = { ...state, items: [...mutableItems] };

  builder.addStep({
    operation: "swap",
    codeLine: 5,
    state: cloneHeapState(currentState),
    explanation: `Replaced element at index ${index} with last element ${replacement.value}. Determining whether to sift up or sift down.`,
    highlightedElements: [replacement.id],
    variables: { index, val: replacement.value },
  });

  // Determine whether to sift up or down
  const parentIndex = getParentIndex(index);
  const shouldSiftUp =
    index > 0 &&
    shouldSwapHeap(mutableItems[parentIndex].value, mutableItems[index].value, heapType);

  if (shouldSiftUp) {
    // Sift Up
    let currentIndex = index;
    while (currentIndex > 0) {
      const pIdx = getParentIndex(currentIndex);
      const cur = mutableItems[currentIndex];
      const par = mutableItems[pIdx];

      builder.addStep({
        operation: "compare",
        codeLine: 8,
        state: cloneHeapState(currentState),
        explanation: `Sift-up comparison: Node ${cur.value} at ${currentIndex} with parent ${par.value} at ${pIdx}.`,
        highlightedElements: [cur.id, par.id],
        variables: { currentIndex, parentIndex: pIdx },
      });

      if (shouldSwapHeap(par.value, cur.value, heapType)) {
        const temp = mutableItems[currentIndex];
        mutableItems[currentIndex] = mutableItems[pIdx];
        mutableItems[pIdx] = temp;
        currentState = { ...state, items: [...mutableItems] };

        builder.addStep({
          operation: "swap",
          codeLine: 9,
          state: cloneHeapState(currentState),
          explanation: `Swapped node with parent to restore ${heapType}-heap order.`,
          highlightedElements: [cur.id, par.id],
          variables: { newIndex: pIdx },
        });
        currentIndex = pIdx;
      } else {
        break;
      }
    }
  } else {
    // Sift Down
    let currentIndex = index;
    const n = mutableItems.length;

    while (true) {
      let targetIdx = currentIndex;
      const leftIndex = getLeftChildIndex(currentIndex);
      const rightIndex = getRightChildIndex(currentIndex);

      const highlights = [mutableItems[currentIndex].id];
      if (leftIndex < n) highlights.push(mutableItems[leftIndex].id);
      if (rightIndex < n) highlights.push(mutableItems[rightIndex].id);

      builder.addStep({
        operation: "compare",
        codeLine: 12,
        state: cloneHeapState(currentState),
        explanation: `Sift-down comparison for node ${mutableItems[currentIndex].value} at index ${currentIndex}.`,
        highlightedElements: highlights,
        variables: { currentIndex, leftIndex: leftIndex < n ? leftIndex : null, rightIndex: rightIndex < n ? rightIndex : null },
      });

      if (
        leftIndex < n &&
        shouldSwapHeap(mutableItems[targetIdx].value, mutableItems[leftIndex].value, heapType)
      ) {
        targetIdx = leftIndex;
      }

      if (
        rightIndex < n &&
        shouldSwapHeap(mutableItems[targetIdx].value, mutableItems[rightIndex].value, heapType)
      ) {
        targetIdx = rightIndex;
      }

      if (targetIdx !== currentIndex) {
        const pNode = mutableItems[currentIndex];
        const cNode = mutableItems[targetIdx];
        const temp = mutableItems[currentIndex];
        mutableItems[currentIndex] = mutableItems[targetIdx];
        mutableItems[targetIdx] = temp;
        currentState = { ...state, items: [...mutableItems] };

        builder.addStep({
          operation: "swap",
          codeLine: 16,
          state: cloneHeapState(currentState),
          explanation: `Swapped node ${pNode.value} with child ${cNode.value}.`,
          highlightedElements: [pNode.id, cNode.id],
          variables: { currentIndex: targetIdx },
        });
        currentIndex = targetIdx;
      } else {
        break;
      }
    }
  }

  return builder.build();
}

// ============================================================================
// 5. HEAP UPDATE VALUE TRACE
// ============================================================================

export function generateHeapUpdateTrace(
  initialState: HeapState<number>,
  index: number,
  newValue: number
): ExecutionTrace<HeapState<number>> {
  const builder = createExecutionTrace({
    initialState,
    metadata: { algorithmName: `${initialState.heapType.toUpperCase()} Heap Update` },
  });

  const state = cloneHeapState(initialState);
  const heapType = state.heapType;

  if (index < 0 || index >= state.items.length) {
    builder.addStep({
      operation: "visit",
      codeLine: 2,
      state: cloneHeapState(state),
      explanation: `Index ${index} is out of bounds [0, ${state.items.length - 1}].`,
      highlightedElements: [],
      variables: { error: "Index out of bounds", index },
    });
    return builder.build();
  }

  const mutableItems = [...state.items];
  const oldVal = mutableItems[index].value;
  const updatedElem: HeapElement<number> = {
    id: mutableItems[index].id,
    value: newValue,
  };
  mutableItems[index] = updatedElem;
  let currentState: HeapState<number> = { ...state, items: [...mutableItems] };

  builder.addStep({
    operation: "update",
    codeLine: 3,
    state: cloneHeapState(currentState),
    explanation: `Updated element at index ${index} from ${oldVal} to ${newValue}. Evaluating heap property.`,
    highlightedElements: [updatedElem.id],
    variables: { index, oldValue: oldVal, newValue },
  });

  const parentIndex = getParentIndex(index);
  const shouldSiftUp =
    index > 0 &&
    shouldSwapHeap(mutableItems[parentIndex].value, mutableItems[index].value, heapType);

  if (shouldSiftUp) {
    // Sift Up
    let currentIndex = index;
    while (currentIndex > 0) {
      const pIdx = getParentIndex(currentIndex);
      const cur = mutableItems[currentIndex];
      const par = mutableItems[pIdx];

      builder.addStep({
        operation: "compare",
        codeLine: 6,
        state: cloneHeapState(currentState),
        explanation: `Comparing node ${cur.value} at index ${currentIndex} with parent ${par.value} at index ${pIdx}.`,
        highlightedElements: [cur.id, par.id],
        variables: { currentIndex, parentIndex: pIdx },
      });

      if (shouldSwapHeap(par.value, cur.value, heapType)) {
        const temp = mutableItems[currentIndex];
        mutableItems[currentIndex] = mutableItems[pIdx];
        mutableItems[pIdx] = temp;
        currentState = { ...state, items: [...mutableItems] };

        builder.addStep({
          operation: "swap",
          codeLine: 7,
          state: cloneHeapState(currentState),
          explanation: `Swapped node ${cur.value} with parent ${par.value}.`,
          highlightedElements: [cur.id, par.id],
          variables: { currentIndex: pIdx },
        });
        currentIndex = pIdx;
      } else {
        break;
      }
    }
  } else {
    // Sift Down
    let currentIndex = index;
    const n = mutableItems.length;

    while (true) {
      let targetIdx = currentIndex;
      const leftIndex = getLeftChildIndex(currentIndex);
      const rightIndex = getRightChildIndex(currentIndex);

      const highlights = [mutableItems[currentIndex].id];
      if (leftIndex < n) highlights.push(mutableItems[leftIndex].id);
      if (rightIndex < n) highlights.push(mutableItems[rightIndex].id);

      builder.addStep({
        operation: "compare",
        codeLine: 12,
        state: cloneHeapState(currentState),
        explanation: `Sift-down check for node ${mutableItems[currentIndex].value} at index ${currentIndex}.`,
        highlightedElements: highlights,
        variables: { currentIndex },
      });

      if (
        leftIndex < n &&
        shouldSwapHeap(mutableItems[targetIdx].value, mutableItems[leftIndex].value, heapType)
      ) {
        targetIdx = leftIndex;
      }

      if (
        rightIndex < n &&
        shouldSwapHeap(mutableItems[targetIdx].value, mutableItems[rightIndex].value, heapType)
      ) {
        targetIdx = rightIndex;
      }

      if (targetIdx !== currentIndex) {
        const pNode = mutableItems[currentIndex];
        const cNode = mutableItems[targetIdx];
        const temp = mutableItems[currentIndex];
        mutableItems[currentIndex] = mutableItems[targetIdx];
        mutableItems[targetIdx] = temp;
        currentState = { ...state, items: [...mutableItems] };

        builder.addStep({
          operation: "swap",
          codeLine: 16,
          state: cloneHeapState(currentState),
          explanation: `Swapped node ${pNode.value} with child ${cNode.value}.`,
          highlightedElements: [pNode.id, cNode.id],
          variables: { currentIndex: targetIdx },
        });
        currentIndex = targetIdx;
      } else {
        break;
      }
    }
  }

  return builder.build();
}

// ============================================================================
// 6. BUILD HEAP TRACE (O(n) bottom-up heapify)
// ============================================================================

export function generateBuildHeapTrace(
  initialState: HeapState<number>,
  values: number[]
): ExecutionTrace<HeapState<number>> {
  const heapType = initialState.heapType;
  const initialElements: HeapElement<number>[] = values.map((val) => ({
    id: generateHeapElementId(val),
    value: val,
  }));

  const startState: HeapState<number> = {
    heapType,
    items: initialElements,
  };

  const builder = createExecutionTrace({
    initialState: startState,
    metadata: { algorithmName: `Build ${heapType.toUpperCase()} Heap` },
  });

  const mutableItems = [...initialElements];
  let currentState: HeapState<number> = { heapType, items: [...mutableItems] };
  const n = mutableItems.length;

  if (n <= 1) {
    builder.addStep({
      operation: "visit",
      codeLine: 2,
      state: cloneHeapState(currentState),
      explanation: `Array with ${n} elements is already a valid heap.`,
      highlightedElements: mutableItems.map((m) => m.id),
      variables: { size: n },
    });
    return builder.build();
  }

  const startInternalNode = Math.floor(n / 2) - 1;

  builder.addStep({
    operation: "visit",
    codeLine: 3,
    state: cloneHeapState(currentState),
    explanation: `Starting bottom-up buildHeap from last non-leaf node at index ${startInternalNode} (floor(n/2) - 1) down to 0. Time complexity: O(n).`,
    highlightedElements: [mutableItems[startInternalNode].id],
    variables: { totalNodes: n, startNode: startInternalNode },
  });

  // Sift down from startInternalNode down to 0
  for (let i = startInternalNode; i >= 0; i--) {
    let currentIndex = i;

    builder.addStep({
      operation: "compare",
      codeLine: 4,
      state: cloneHeapState(currentState),
      explanation: `Heapifying subtree rooted at index ${i} (value ${mutableItems[i].value}).`,
      highlightedElements: [mutableItems[i].id],
      variables: { rootIndex: i, rootVal: mutableItems[i].value },
    });

    while (true) {
      let targetIdx = currentIndex;
      const leftIndex = getLeftChildIndex(currentIndex);
      const rightIndex = getRightChildIndex(currentIndex);

      if (
        leftIndex < n &&
        shouldSwapHeap(mutableItems[targetIdx].value, mutableItems[leftIndex].value, heapType)
      ) {
        targetIdx = leftIndex;
      }

      if (
        rightIndex < n &&
        shouldSwapHeap(mutableItems[targetIdx].value, mutableItems[rightIndex].value, heapType)
      ) {
        targetIdx = rightIndex;
      }

      if (targetIdx !== currentIndex) {
        const pNode = mutableItems[currentIndex];
        const cNode = mutableItems[targetIdx];
        const temp = mutableItems[currentIndex];
        mutableItems[currentIndex] = mutableItems[targetIdx];
        mutableItems[targetIdx] = temp;
        currentState = { heapType, items: [...mutableItems] };

        builder.addStep({
          operation: "swap",
          codeLine: 5,
          state: cloneHeapState(currentState),
          explanation: `Sift down: swapped ${pNode.value} at index ${currentIndex} with child ${cNode.value} at index ${targetIdx}.`,
          highlightedElements: [pNode.id, cNode.id],
          variables: { currentIndex: targetIdx },
        });

        currentIndex = targetIdx;
      } else {
        break;
      }
    }
  }

  builder.addStep({
    operation: "visit",
    codeLine: 6,
    state: cloneHeapState(currentState),
    explanation: `Build Heap complete! All subtrees satisfy the ${heapType}-heap invariant.`,
    highlightedElements: mutableItems.map((m) => m.id),
    variables: { completed: true, size: n },
  });

  return builder.build();
}

// ============================================================================
// 7. HEAPIFY TRACE (re-heapify existing elements)
// ============================================================================

export function generateHeapifyTrace(
  initialState: HeapState<number>
): ExecutionTrace<HeapState<number>> {
  const currentValues = initialState.items.map((it) => it.value);
  return generateBuildHeapTrace(initialState, currentValues);
}

// ============================================================================
// 8. CLEAR HEAP TRACE
// ============================================================================

export function generateClearHeapTrace(
  initialState: HeapState<number>
): ExecutionTrace<HeapState<number>> {
  const builder = createExecutionTrace({
    initialState,
    metadata: { algorithmName: "Clear Heap" },
  });

  builder.addStep({
    operation: "delete",
    codeLine: 1,
    state: cloneHeapState(initialState),
    explanation: `Clearing heap of ${initialState.items.length} elements.`,
    highlightedElements: initialState.items.map((it) => it.id),
    variables: { previousSize: initialState.items.length },
  });

  const emptyState = createEmptyHeapState(initialState.heapType);

  builder.addStep({
    operation: "delete",
    codeLine: 2,
    state: emptyState,
    explanation: "Heap has been cleared.",
    highlightedElements: [],
    variables: { size: 0 },
  });

  return builder.build();
}

// ============================================================================
// 9. PRIORITY QUEUE TRACES
// ============================================================================

export function generatePQEnqueueTrace(
  initialState: PriorityQueueState,
  task: string,
  priority: number
): ExecutionTrace<PriorityQueueState> {
  const mode = initialState.mode;
  const builder = createExecutionTrace({
    initialState,
    metadata: { algorithmName: `Priority Queue (${mode.toUpperCase()}) Enqueue` },
  });

  const state = clonePQState(initialState);
  const newElem: PriorityQueueElement = {
    id: generatePQElementId(task, priority),
    value: task,
    priority,
  };

  const mutableItems = [...state.items, newElem];
  let currentState: PriorityQueueState = { ...state, items: mutableItems };
  let currentIndex = mutableItems.length - 1;

  builder.addStep({
    operation: "insert",
    codeLine: 2,
    state: clonePQState(currentState),
    explanation: `Enqueued task "${task}" with priority ${priority} at index ${currentIndex}.`,
    highlightedElements: [newElem.id],
    variables: { task, priority, index: currentIndex },
  });

  // Sift Up according to priority
  while (currentIndex > 0) {
    const parentIndex = getParentIndex(currentIndex);
    const cur = mutableItems[currentIndex];
    const par = mutableItems[parentIndex];

    builder.addStep({
      operation: "compare",
      codeLine: 5,
      state: clonePQState(currentState),
      explanation: `Comparing task "${cur.value}" (pri: ${cur.priority}) with parent "${par.value}" (pri: ${par.priority}).`,
      highlightedElements: [cur.id, par.id],
      variables: {
        currentIndex,
        currentPriority: cur.priority,
        parentIndex,
        parentPriority: par.priority,
      },
    });

    if (shouldSwapPQ(par.priority, cur.priority, mode)) {
      const temp = mutableItems[currentIndex];
      mutableItems[currentIndex] = mutableItems[parentIndex];
      mutableItems[parentIndex] = temp;
      currentState = { ...state, items: [...mutableItems] };

      builder.addStep({
        operation: "swap",
        codeLine: 6,
        state: clonePQState(currentState),
        explanation: `Swapped "${cur.value}" with parent "${par.value}" because priority ${cur.priority} has higher precedence in ${mode}-priority queue.`,
        highlightedElements: [cur.id, par.id],
        variables: { newIndex: parentIndex },
      });

      currentIndex = parentIndex;
    } else {
      builder.addStep({
        operation: "compare",
        codeLine: 8,
        state: clonePQState(currentState),
        explanation: `Task "${cur.value}" priority is in valid order relative to parent. Enqueue complete.`,
        highlightedElements: [cur.id],
        variables: { currentIndex, valid: true },
      });
      break;
    }
  }

  return builder.build();
}

export function generatePQDequeueTrace(
  initialState: PriorityQueueState
): ExecutionTrace<PriorityQueueState> {
  const mode = initialState.mode;
  const builder = createExecutionTrace({
    initialState,
    metadata: { algorithmName: `Priority Queue (${mode.toUpperCase()}) Dequeue` },
  });

  const state = clonePQState(initialState);

  if (state.items.length === 0) {
    builder.addStep({
      operation: "visit",
      codeLine: 2,
      state: clonePQState(state),
      explanation: "Priority Queue is empty. Nothing to dequeue.",
      highlightedElements: [],
      variables: { empty: true },
    });
    return builder.build();
  }

  const rootElem = state.items[0];

  if (state.items.length === 1) {
    builder.addStep({
      operation: "delete",
      codeLine: 3,
      state: clonePQState(state),
      explanation: `Dequeued highest priority task "${rootElem.value}" (pri: ${rootElem.priority}).`,
      highlightedElements: [rootElem.id],
      variables: { dequeued: rootElem.value, priority: rootElem.priority },
    });
    builder.addStep({
      operation: "delete",
      codeLine: 4,
      state: { ...state, items: [] },
      explanation: "Priority Queue is now empty.",
      highlightedElements: [],
      variables: { size: 0 },
    });
    return builder.build();
  }

  const lastElem = state.items[state.items.length - 1];
  builder.addStep({
    operation: "visit",
    codeLine: 3,
    state: clonePQState(state),
    explanation: `Dequeuing root task "${rootElem.value}" (pri: ${rootElem.priority}). Moving last task "${lastElem.value}" to root.`,
    highlightedElements: [rootElem.id, lastElem.id],
    variables: { dequeued: rootElem.value, priority: rootElem.priority },
  });

  const mutableItems = [...state.items];
  const lastItem = mutableItems.pop()!;
  mutableItems[0] = lastItem;
  let currentState: PriorityQueueState = { ...state, items: [...mutableItems] };

  builder.addStep({
    operation: "swap",
    codeLine: 5,
    state: clonePQState(currentState),
    explanation: `Moved "${lastItem.value}" to root. Sifting down to restore priority order.`,
    highlightedElements: [lastItem.id],
    variables: { rootTask: lastItem.value, rootPriority: lastItem.priority },
  });

  let currentIndex = 0;
  const n = mutableItems.length;

  while (true) {
    let targetIndex = currentIndex;
    const leftIndex = getLeftChildIndex(currentIndex);
    const rightIndex = getRightChildIndex(currentIndex);

    const checkHighlights = [mutableItems[currentIndex].id];
    if (leftIndex < n) checkHighlights.push(mutableItems[leftIndex].id);
    if (rightIndex < n) checkHighlights.push(mutableItems[rightIndex].id);

    builder.addStep({
      operation: "compare",
      codeLine: 12,
      state: clonePQState(currentState),
      explanation: `Evaluating child priorities for "${mutableItems[currentIndex].value}" at index ${currentIndex}.`,
      highlightedElements: checkHighlights,
      variables: { currentIndex },
    });

    if (
      leftIndex < n &&
      shouldSwapPQ(mutableItems[targetIndex].priority, mutableItems[leftIndex].priority, mode)
    ) {
      targetIndex = leftIndex;
    }

    if (
      rightIndex < n &&
      shouldSwapPQ(mutableItems[targetIndex].priority, mutableItems[rightIndex].priority, mode)
    ) {
      targetIndex = rightIndex;
    }

    if (targetIndex !== currentIndex) {
      const pNode = mutableItems[currentIndex];
      const cNode = mutableItems[targetIndex];
      const temp = mutableItems[currentIndex];
      mutableItems[currentIndex] = mutableItems[targetIndex];
      mutableItems[targetIndex] = temp;
      currentState = { ...state, items: [...mutableItems] };

      builder.addStep({
        operation: "swap",
        codeLine: 16,
        state: clonePQState(currentState),
        explanation: `Swapped "${pNode.value}" (pri: ${pNode.priority}) with higher priority child "${cNode.value}" (pri: ${cNode.priority}).`,
        highlightedElements: [pNode.id, cNode.id],
        variables: { currentIndex: targetIndex },
      });

      currentIndex = targetIndex;
    } else {
      builder.addStep({
        operation: "compare",
        codeLine: 18,
        state: clonePQState(currentState),
        explanation: `Task "${mutableItems[currentIndex].value}" is correctly positioned. Dequeue complete.`,
        highlightedElements: [mutableItems[currentIndex].id],
        variables: { completed: true },
      });
      break;
    }
  }

  return builder.build();
}

export function generatePQPeekTrace(
  initialState: PriorityQueueState
): ExecutionTrace<PriorityQueueState> {
  const builder = createExecutionTrace({
    initialState,
    metadata: { algorithmName: "Priority Queue Peek" },
  });

  if (initialState.items.length === 0) {
    builder.addStep({
      operation: "visit",
      codeLine: 2,
      state: clonePQState(initialState),
      explanation: "Priority Queue is empty.",
      highlightedElements: [],
      variables: { root: null },
    });
    return builder.build();
  }

  const root = initialState.items[0];
  builder.addStep({
    operation: "visit",
    codeLine: 3,
    state: clonePQState(initialState),
    explanation: `Peek highest priority task: "${root.value}" with priority ${root.priority}.`,
    highlightedElements: [root.id],
    variables: { task: root.value, priority: root.priority },
  });

  return builder.build();
}

export function generatePQChangePriorityTrace(
  initialState: PriorityQueueState,
  elementId: string,
  newPriority: number
): ExecutionTrace<PriorityQueueState> {
  const mode = initialState.mode;
  const builder = createExecutionTrace({
    initialState,
    metadata: { algorithmName: "Change Priority" },
  });

  const state = clonePQState(initialState);
  const index = state.items.findIndex((it) => it.id === elementId);

  if (index === -1) {
    builder.addStep({
      operation: "visit",
      codeLine: 2,
      state: clonePQState(state),
      explanation: `Element with id "${elementId}" not found in Priority Queue.`,
      highlightedElements: [],
      variables: { error: "Not found", id: elementId },
    });
    return builder.build();
  }

  const mutableItems = [...state.items];
  const oldPriority = mutableItems[index].priority;
  mutableItems[index] = {
    ...mutableItems[index],
    priority: newPriority,
  };
  let currentState: PriorityQueueState = { ...state, items: [...mutableItems] };

  builder.addStep({
    operation: "update",
    codeLine: 3,
    state: clonePQState(currentState),
    explanation: `Changed priority of task "${mutableItems[index].value}" from ${oldPriority} to ${newPriority}.`,
    highlightedElements: [mutableItems[index].id],
    variables: { task: mutableItems[index].value, oldPriority, newPriority },
  });

  // Determine sift-up vs sift-down
  const parentIndex = getParentIndex(index);
  const shouldSiftUp =
    index > 0 &&
    shouldSwapPQ(mutableItems[parentIndex].priority, mutableItems[index].priority, mode);

  if (shouldSiftUp) {
    let currentIndex = index;
    while (currentIndex > 0) {
      const pIdx = getParentIndex(currentIndex);
      const cur = mutableItems[currentIndex];
      const par = mutableItems[pIdx];

      builder.addStep({
        operation: "compare",
        codeLine: 6,
        state: clonePQState(currentState),
        explanation: `Sift-up: comparing task "${cur.value}" (pri: ${cur.priority}) with parent "${par.value}" (pri: ${par.priority}).`,
        highlightedElements: [cur.id, par.id],
        variables: { currentIndex, parentIndex: pIdx },
      });

      if (shouldSwapPQ(par.priority, cur.priority, mode)) {
        const temp = mutableItems[currentIndex];
        mutableItems[currentIndex] = mutableItems[pIdx];
        mutableItems[pIdx] = temp;
        currentState = { ...state, items: [...mutableItems] };

        builder.addStep({
          operation: "swap",
          codeLine: 7,
          state: clonePQState(currentState),
          explanation: `Swapped with parent due to higher priority precedence.`,
          highlightedElements: [cur.id, par.id],
          variables: { currentIndex: pIdx },
        });
        currentIndex = pIdx;
      } else {
        break;
      }
    }
  } else {
    let currentIndex = index;
    const n = mutableItems.length;

    while (true) {
      let targetIdx = currentIndex;
      const leftIndex = getLeftChildIndex(currentIndex);
      const rightIndex = getRightChildIndex(currentIndex);

      if (
        leftIndex < n &&
        shouldSwapPQ(mutableItems[targetIdx].priority, mutableItems[leftIndex].priority, mode)
      ) {
        targetIdx = leftIndex;
      }

      if (
        rightIndex < n &&
        shouldSwapPQ(mutableItems[targetIdx].priority, mutableItems[rightIndex].priority, mode)
      ) {
        targetIdx = rightIndex;
      }

      if (targetIdx !== currentIndex) {
        const pNode = mutableItems[currentIndex];
        const cNode = mutableItems[targetIdx];
        const temp = mutableItems[currentIndex];
        mutableItems[currentIndex] = mutableItems[targetIdx];
        mutableItems[targetIdx] = temp;
        currentState = { ...state, items: [...mutableItems] };

        builder.addStep({
          operation: "swap",
          codeLine: 12,
          state: clonePQState(currentState),
          explanation: `Sift-down: swapped "${pNode.value}" with "${cNode.value}".`,
          highlightedElements: [pNode.id, cNode.id],
          variables: { currentIndex: targetIdx },
        });
        currentIndex = targetIdx;
      } else {
        break;
      }
    }
  }

  return builder.build();
}

export function generatePQRemoveTrace(
  initialState: PriorityQueueState,
  elementId: string
): ExecutionTrace<PriorityQueueState> {
  const mode = initialState.mode;
  const builder = createExecutionTrace({
    initialState,
    metadata: { algorithmName: "Remove Task from Priority Queue" },
  });

  const state = clonePQState(initialState);
  const index = state.items.findIndex((it) => it.id === elementId);

  if (index === -1) {
    builder.addStep({
      operation: "visit",
      codeLine: 2,
      state: clonePQState(state),
      explanation: `Element with id "${elementId}" not found.`,
      highlightedElements: [],
      variables: { error: "Not found", id: elementId },
    });
    return builder.build();
  }

  const target = state.items[index];
  if (index === state.items.length - 1) {
    builder.addStep({
      operation: "delete",
      codeLine: 3,
      state: clonePQState(state),
      explanation: `Removing last task "${target.value}" at index ${index}.`,
      highlightedElements: [target.id],
      variables: { task: target.value },
    });
    builder.addStep({
      operation: "delete",
      codeLine: 4,
      state: { ...state, items: state.items.slice(0, -1) },
      explanation: `Task removed.`,
      highlightedElements: [],
      variables: { size: state.items.length - 1 },
    });
    return builder.build();
  }

  const mutableItems = [...state.items];
  const lastItem = mutableItems.pop()!;
  mutableItems[index] = lastItem;
  let currentState: PriorityQueueState = { ...state, items: [...mutableItems] };

  builder.addStep({
    operation: "swap",
    codeLine: 5,
    state: clonePQState(currentState),
    explanation: `Replaced deleted task "${target.value}" with last task "${lastItem.value}". Sifting to restore heap order.`,
    highlightedElements: [lastItem.id],
    variables: { replaced: target.value, replacement: lastItem.value },
  });

  // Check sift up vs sift down
  const parentIndex = getParentIndex(index);
  const shouldSiftUp =
    index > 0 &&
    shouldSwapPQ(mutableItems[parentIndex].priority, mutableItems[index].priority, mode);

  if (shouldSiftUp) {
    let currentIndex = index;
    while (currentIndex > 0) {
      const pIdx = getParentIndex(currentIndex);
      const cur = mutableItems[currentIndex];
      const par = mutableItems[pIdx];

      if (shouldSwapPQ(par.priority, cur.priority, mode)) {
        const temp = mutableItems[currentIndex];
        mutableItems[currentIndex] = mutableItems[pIdx];
        mutableItems[pIdx] = temp;
        currentState = { ...state, items: [...mutableItems] };

        builder.addStep({
          operation: "swap",
          codeLine: 7,
          state: clonePQState(currentState),
          explanation: `Sift-up swap with parent.`,
          highlightedElements: [cur.id, par.id],
          variables: { currentIndex: pIdx },
        });
        currentIndex = pIdx;
      } else {
        break;
      }
    }
  } else {
    let currentIndex = index;
    const n = mutableItems.length;

    while (true) {
      let targetIdx = currentIndex;
      const leftIndex = getLeftChildIndex(currentIndex);
      const rightIndex = getRightChildIndex(currentIndex);

      if (
        leftIndex < n &&
        shouldSwapPQ(mutableItems[targetIdx].priority, mutableItems[leftIndex].priority, mode)
      ) {
        targetIdx = leftIndex;
      }

      if (
        rightIndex < n &&
        shouldSwapPQ(mutableItems[targetIdx].priority, mutableItems[rightIndex].priority, mode)
      ) {
        targetIdx = rightIndex;
      }

      if (targetIdx !== currentIndex) {
        const pNode = mutableItems[currentIndex];
        const cNode = mutableItems[targetIdx];
        const temp = mutableItems[currentIndex];
        mutableItems[currentIndex] = mutableItems[targetIdx];
        mutableItems[targetIdx] = temp;
        currentState = { ...state, items: [...mutableItems] };

        builder.addStep({
          operation: "swap",
          codeLine: 12,
          state: clonePQState(currentState),
          explanation: `Sift-down swap.`,
          highlightedElements: [pNode.id, cNode.id],
          variables: { currentIndex: targetIdx },
        });
        currentIndex = targetIdx;
      } else {
        break;
      }
    }
  }

  return builder.build();
}

export function generatePQSizeTrace(
  initialState: PriorityQueueState
): ExecutionTrace<PriorityQueueState> {
  const builder = createExecutionTrace({
    initialState,
    metadata: { algorithmName: "Priority Queue Size" },
  });

  builder.addStep({
    operation: "visit",
    codeLine: 1,
    state: clonePQState(initialState),
    explanation: `Priority Queue has ${initialState.items.length} active tasks. (isEmpty = ${initialState.items.length === 0}).`,
    highlightedElements: initialState.items.map((i) => i.id),
    variables: { size: initialState.items.length, isEmpty: initialState.items.length === 0 },
  });

  return builder.build();
}

export function generateClearPQTrace(
  initialState: PriorityQueueState
): ExecutionTrace<PriorityQueueState> {
  const builder = createExecutionTrace({
    initialState,
    metadata: { algorithmName: "Clear Priority Queue" },
  });

  builder.addStep({
    operation: "delete",
    codeLine: 1,
    state: clonePQState(initialState),
    explanation: `Clearing ${initialState.items.length} tasks from Priority Queue.`,
    highlightedElements: initialState.items.map((i) => i.id),
    variables: { previousSize: initialState.items.length },
  });

  const emptyState: PriorityQueueState = {
    mode: initialState.mode,
    items: [],
  };

  builder.addStep({
    operation: "delete",
    codeLine: 2,
    state: emptyState,
    explanation: "Priority Queue has been cleared.",
    highlightedElements: [],
    variables: { size: 0 },
  });

  return builder.build();
}

// ============================================================================
// UNIVERSAL DISPATCHERS
// ============================================================================

export function generateHeapTrace(
  operation: HeapOperationType,
  state: HeapState<number>,
  args?: { value?: number; index?: number; values?: number[] }
): ExecutionTrace<HeapState<number>> {
  switch (operation) {
    case "insert":
      return generateHeapInsertTrace(state, args?.value ?? 0);
    case "extract-root":
      return generateHeapExtractRootTrace(state);
    case "peek":
      return generateHeapPeekTrace(state);
    case "delete":
      return generateHeapDeleteTrace(state, args?.index ?? 0);
    case "update":
      return generateHeapUpdateTrace(state, args?.index ?? 0, args?.value ?? 0);
    case "build-heap":
      return generateBuildHeapTrace(state, args?.values ?? [40, 20, 10, 50, 30]);
    case "heapify":
      return generateHeapifyTrace(state);
    case "clear":
      return generateClearHeapTrace(state);
    default:
      throw new Error(`Unsupported heap operation: ${operation}`);
  }
}

export function generatePriorityQueueTrace(
  operation: PriorityQueueOperationType,
  state: PriorityQueueState,
  args?: { task?: string; priority?: number; elementId?: string }
): ExecutionTrace<PriorityQueueState> {
  switch (operation) {
    case "enqueue":
      return generatePQEnqueueTrace(state, args?.task ?? "Task", args?.priority ?? 1);
    case "dequeue":
      return generatePQDequeueTrace(state);
    case "peek":
      return generatePQPeekTrace(state);
    case "change-priority":
      return generatePQChangePriorityTrace(
        state,
        args?.elementId ?? (state.items[0]?.id || ""),
        args?.priority ?? 1
      );
    case "remove":
      return generatePQRemoveTrace(state, args?.elementId ?? (state.items[0]?.id || ""));
    case "size":
      return generatePQSizeTrace(state);
    case "clear":
      return generateClearPQTrace(state);
    default:
      throw new Error(`Unsupported priority queue operation: ${operation}`);
  }
}
