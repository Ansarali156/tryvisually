/**
 * Array Operation Trace Generators
 *
 * Requirements:
 * 1. Produces ExecutionTrace<ArrayState> via ExecutionTraceBuilder.
 * 2. Stable IDs remain attached to their logical elements across all operations.
 * 3. 100% deterministic execution: no random values during trace creation.
 * 4. All steps map to valid code lines, variables, and learner-friendly explanations.
 */

import type { ExecutionTrace } from "@/core/execution/types";
import { createExecutionTrace } from "@/core/execution/trace/trace-builder";
import type { ArrayElement, ArrayState } from "./types";
import { generateElementId } from "./validation";

/**
 * 1. ACCESS OPERATION TRACE GENERATOR
 */
export function createAccessTrace(
  input: ArrayState,
  index: number
): ExecutionTrace<ArrayState> {
  const builder = createExecutionTrace<ArrayState>({
    initialState: input,
    metadata: {
      algorithmId: "array-access",
      algorithmName: "Array Access",
      category: "Basic Operations",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  const n = input.items.length;
  if (n === 0 || index < 0 || index >= n) {
    builder.addStep({
      operation: "custom",
      codeLine: 1,
      variables: { index, length: n, error: "Index out of bounds" },
      state: input,
      highlightedElements: [],
      explanation: `Cannot access index ${index}: Array length is ${n}. Index is out of bounds.`,
    });
    return builder.build();
  }

  const targetElem = input.items[index];

  // Step 0: Initial state
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { index, length: n },
    state: input,
    highlightedElements: [],
    explanation: `Array loaded with ${n} elements. Preparing direct access at index ${index}.`,
  });

  // Step 1: Select element by direct index offset
  builder.addStep({
    operation: "select",
    codeLine: 3,
    variables: { index, value: targetElem.value },
    state: input,
    highlightedElements: [targetElem.id],
    metadata: {
      pointers: [{ index, label: "index" }],
    },
    explanation: `Located index ${index} via direct memory offset [Base + ${index} * element_size]. Value is ${targetElem.value}.`,
  });

  // Step 2: Return value
  builder.addStep({
    operation: "return",
    codeLine: 4,
    variables: { index, value: targetElem.value, returnValue: targetElem.value },
    state: input,
    highlightedElements: [targetElem.id],
    metadata: {
      pointers: [{ index, label: "index" }],
    },
    explanation: `Access complete in O(1) time: Returned value ${targetElem.value} at index ${index}.`,
  });

  return builder.build();
}

/**
 * 2. UPDATE OPERATION TRACE GENERATOR
 */
export function createUpdateTrace(
  input: ArrayState,
  index: number,
  newValue: number
): ExecutionTrace<ArrayState> {
  const builder = createExecutionTrace<ArrayState>({
    initialState: input,
    metadata: {
      algorithmId: "array-update",
      algorithmName: "Array Update",
      category: "Basic Operations",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  const n = input.items.length;
  if (n === 0 || index < 0 || index >= n) {
    builder.addStep({
      operation: "custom",
      codeLine: 1,
      variables: { index, newValue, length: n, error: "Index out of bounds" },
      state: input,
      highlightedElements: [],
      explanation: `Cannot update index ${index}: Array length is ${n}. Index is out of bounds.`,
    });
    return builder.build();
  }

  const currentElem = input.items[index];

  // Step 0: Initial state
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { index, currentValue: currentElem.value, newValue },
    state: input,
    highlightedElements: [],
    explanation: `Current array state. Preparing to update element at index ${index} (currently ${currentElem.value}) to ${newValue}.`,
  });

  // Step 1: Select element
  builder.addStep({
    operation: "select",
    codeLine: 3,
    variables: { index, currentValue: currentElem.value, newValue },
    state: input,
    highlightedElements: [currentElem.id],
    metadata: {
      pointers: [{ index, label: "target" }],
    },
    explanation: `Targeting element at index ${index}. Preserving stable element ID "${currentElem.id}".`,
  });

  // Step 2: Mutate value while strictly preserving element ID
  const updatedItems = input.items.map((item, idx) =>
    idx === index ? { id: item.id, value: newValue } : item
  );
  const updatedState: ArrayState = { items: Object.freeze(updatedItems) };

  builder.addStep({
    operation: "update",
    codeLine: 3,
    variables: { index, previousValue: currentElem.value, newValue },
    state: updatedState,
    highlightedElements: [currentElem.id],
    metadata: {
      pointers: [{ index, label: "updated" }],
    },
    explanation: `Overwrote value at index ${index} from ${currentElem.value} to ${newValue}. Logical identity preserved.`,
  });

  // Step 3: Return
  builder.addStep({
    operation: "return",
    codeLine: 4,
    variables: { index, finalValue: newValue },
    state: updatedState,
    highlightedElements: [currentElem.id],
    explanation: `Update operation completed in O(1) time.`,
  });

  return builder.build();
}

/**
 * 3. INSERT OPERATION TRACE GENERATOR
 */
export function createInsertTrace(
  input: ArrayState,
  index: number,
  value: number
): ExecutionTrace<ArrayState> {
  const builder = createExecutionTrace<ArrayState>({
    initialState: input,
    metadata: {
      algorithmId: "array-insert",
      algorithmName: "Array Insert",
      category: "Basic Operations",
      complexity: {
        time: index === input.items.length ? "O(1)" : "O(n)",
        space: "O(1)",
      },
    },
  });

  const n = input.items.length;
  if (index < 0 || index > n) {
    builder.addStep({
      operation: "custom",
      codeLine: 1,
      variables: { index, value, length: n, error: "Index out of bounds" },
      state: input,
      highlightedElements: [],
      explanation: `Cannot insert at index ${index}: Valid insertion index range is 0 to ${n}.`,
    });
    return builder.build();
  }

  // Step 0: Initial state
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { index, value, initialLength: n },
    state: input,
    highlightedElements: [],
    explanation: `Preparing to insert value ${value} at index ${index}. Initial length is ${n}.`,
  });

  // Step 1: Identify target insertion position
  builder.addStep({
    operation: "select",
    codeLine: 2,
    variables: { index, value, initialLength: n },
    state: input,
    highlightedElements: index < n ? [input.items[index].id] : [],
    metadata: {
      pointers: [{ index, label: "insertAt" }],
    },
    explanation:
      index < n
        ? `Target insertion slot is index ${index}. Existing elements from index ${index} to ${n - 1} must shift right.`
        : `Target insertion slot is at the end of the array (index ${index}). No shifting required.`,
  });

  // Simulate right shifting step-by-step for educational visualization
  const currentItems: ArrayElement[] = [...input.items];

  for (let shiftIdx = n - 1; shiftIdx >= index; shiftIdx--) {
    const shiftingElem = currentItems[shiftIdx];
    builder.addStep({
      operation: "custom",
      codeLine: 4,
      variables: { shiftFrom: shiftIdx, shiftTo: shiftIdx + 1, shiftingValue: shiftingElem.value },
      state: { items: Object.freeze([...currentItems]) },
      highlightedElements: [shiftingElem.id],
      metadata: {
        pointers: [
          { index: shiftIdx, label: "from" },
          { index: shiftIdx + 1, label: "to" },
        ],
      },
      explanation: `Shift element ${shiftingElem.value} right from index ${shiftIdx} to index ${shiftIdx + 1}.`,
    });
  }

  // Insert the new element with a unique deterministic stable ID
  let maxId = 0;
  for (const item of input.items) {
    const match = item.id.match(/\d+$/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num > maxId) maxId = num;
    }
  }
  const newElement: ArrayElement = {
    id: generateElementId(maxId + 1),
    value,
  };

  currentItems.splice(index, 0, newElement);
  const insertedState: ArrayState = { items: Object.freeze([...currentItems]) };

  // Step: New element placed
  builder.addStep({
    operation: "insert",
    codeLine: 5,
    variables: { index, insertedValue: value, newLength: currentItems.length },
    state: insertedState,
    highlightedElements: [newElement.id],
    metadata: {
      pointers: [{ index, label: "inserted" }],
    },
    explanation: `Inserted new element ${value} at index ${index} with new stable identity.`,
  });

  // Step Final: Return
  builder.addStep({
    operation: "return",
    codeLine: 6,
    variables: { newLength: currentItems.length },
    state: insertedState,
    highlightedElements: [newElement.id],
    explanation: `Insert operation complete. Array expanded to ${currentItems.length} elements.`,
  });

  return builder.build();
}

/**
 * 4. DELETE OPERATION TRACE GENERATOR
 */
export function createDeleteTrace(
  input: ArrayState,
  index: number
): ExecutionTrace<ArrayState> {
  const builder = createExecutionTrace<ArrayState>({
    initialState: input,
    metadata: {
      algorithmId: "array-delete",
      algorithmName: "Array Delete",
      category: "Basic Operations",
      complexity: {
        time: index === input.items.length - 1 ? "O(1)" : "O(n)",
        space: "O(1)",
      },
    },
  });

  const n = input.items.length;
  if (n === 0 || index < 0 || index >= n) {
    builder.addStep({
      operation: "custom",
      codeLine: 1,
      variables: { index, length: n, error: "Index out of bounds" },
      state: input,
      highlightedElements: [],
      explanation: `Cannot delete at index ${index}: Array length is ${n}.`,
    });
    return builder.build();
  }

  const targetElem = input.items[index];

  // Step 0: Initial state
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { index, deletedValue: targetElem.value, initialLength: n },
    state: input,
    highlightedElements: [],
    explanation: `Preparing to delete element at index ${index} (value: ${targetElem.value}).`,
  });

  // Step 1: Select element for removal
  builder.addStep({
    operation: "delete",
    codeLine: 2,
    variables: { index, deletedValue: targetElem.value },
    state: input,
    highlightedElements: [targetElem.id],
    metadata: {
      pointers: [{ index, label: "delete" }],
    },
    explanation: `Identified element at index ${index} (value: ${targetElem.value}) for removal.`,
  });

  // Simulate left shifting step-by-step
  for (let shiftIdx = index + 1; shiftIdx < n; shiftIdx++) {
    const shiftingElem = input.items[shiftIdx];
    builder.addStep({
      operation: "custom",
      codeLine: 4,
      variables: { shiftFrom: shiftIdx, shiftTo: shiftIdx - 1, shiftingValue: shiftingElem.value },
      state: input,
      highlightedElements: [shiftingElem.id],
      metadata: {
        pointers: [
          { index: shiftIdx, label: "from" },
          { index: shiftIdx - 1, label: "to" },
        ],
      },
      explanation: `Shift element ${shiftingElem.value} left from index ${shiftIdx} to index ${shiftIdx - 1} to close gap.`,
    });
  }

  // Final state without the deleted element (ID completely removed)
  const remainingItems = input.items.filter((_, idx) => idx !== index);
  const deletedState: ArrayState = { items: Object.freeze(remainingItems) };

  // Step 2: Pop / Shrink
  builder.addStep({
    operation: "delete",
    codeLine: 5,
    variables: { removedValue: targetElem.value, remainingLength: remainingItems.length },
    state: deletedState,
    highlightedElements: [],
    explanation: `Removed element from array. Deleted element ID "${targetElem.id}" discarded from state.`,
  });

  // Step Final: Return
  builder.addStep({
    operation: "return",
    codeLine: 6,
    variables: { newLength: remainingItems.length },
    state: deletedState,
    highlightedElements: [],
    explanation: `Delete complete. Array size reduced from ${n} to ${remainingItems.length}.`,
  });

  return builder.build();
}

/**
 * 5. LINEAR SEARCH TRACE GENERATOR
 */
export function createLinearSearchTrace(
  input: ArrayState,
  target: number
): ExecutionTrace<ArrayState> {
  const builder = createExecutionTrace<ArrayState>({
    initialState: input,
    metadata: {
      algorithmId: "linear-search",
      algorithmName: "Linear Search",
      category: "Searching",
      complexity: { time: "O(n)", space: "O(1)" },
    },
  });

  const n = input.items.length;

  // Step 0: Initial state
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { target, arrayLength: n },
    state: input,
    highlightedElements: [],
    explanation: `Initiating linear search for target value ${target} across ${n} elements.`,
  });

  if (n === 0) {
    builder.addStep({
      operation: "return",
      codeLine: 5,
      variables: { target, resultIndex: -1 },
      state: input,
      highlightedElements: [],
      explanation: `Array is empty. Target ${target} not found. Returning -1.`,
    });
    return builder.build();
  }

  let foundIndex = -1;

  for (let i = 0; i < n; i++) {
    const currentElem = input.items[i];
    const isMatch = currentElem.value === target;

    // Step: Compare current element with target
    builder.addStep({
      operation: "compare",
      codeLine: 3,
      variables: {
        i,
        currentValue: currentElem.value,
        target,
        isMatch,
      },
      state: input,
      highlightedElements: [currentElem.id],
      metadata: {
        pointers: [{ index: i, label: "i" }],
      },
      explanation: `Inspect index ${i}: Element value is ${currentElem.value}. Comparing ${currentElem.value} == ${target}.`,
    });

    if (isMatch) {
      foundIndex = i;
      // Step: Match found!
      builder.addStep({
        operation: "found",
        codeLine: 4,
        variables: {
          i,
          foundValue: currentElem.value,
          target,
          resultIndex: i,
        },
        state: input,
        highlightedElements: [currentElem.id],
        metadata: {
          pointers: [{ index: i, label: "found!" }],
        },
        explanation: `Target ${target} matches element at index ${i}! Returning index ${i}.`,
      });
      break;
    }
  }

  // If search exhausted without finding target
  if (foundIndex === -1) {
    builder.addStep({
      operation: "return",
      codeLine: 5,
      variables: {
        target,
        resultIndex: -1,
        scannedCount: n,
      },
      state: input,
      highlightedElements: [],
      explanation: `Target ${target} not found in array after inspecting all ${n} elements. Returning -1.`,
    });
  }

  return builder.build();
}

/**
 * 6. COMPARE OPERATION TRACE GENERATOR
 */
export function createCompareTrace(
  input: ArrayState,
  indexA: number,
  indexB: number
): ExecutionTrace<ArrayState> {
  const builder = createExecutionTrace<ArrayState>({
    initialState: input,
    metadata: {
      algorithmId: "array-compare",
      algorithmName: "Array Compare",
      category: "Basic Operations",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  const n = input.items.length;
  if (indexA < 0 || indexA >= n || indexB < 0 || indexB >= n) {
    builder.addStep({
      operation: "custom",
      codeLine: 1,
      variables: { indexA, indexB, length: n, error: "Index out of bounds" },
      state: input,
      highlightedElements: [],
      explanation: `Indices [${indexA}, ${indexB}] out of bounds for array of length ${n}.`,
    });
    return builder.build();
  }

  const elemA = input.items[indexA];
  const elemB = input.items[indexB];
  const comparisonResult =
    elemA.value > elemB.value
      ? "greater"
      : elemA.value < elemB.value
      ? "less"
      : "equal";

  // Step 0: Initial state
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { indexA, indexB, leftValue: elemA.value, rightValue: elemB.value },
    state: input,
    highlightedElements: [],
    explanation: `Preparing comparison between index ${indexA} (${elemA.value}) and index ${indexB} (${elemB.value}).`,
  });

  // Step 1: Perform comparison
  builder.addStep({
    operation: "compare",
    codeLine: 3,
    variables: {
      leftIndex: indexA,
      rightIndex: indexB,
      leftValue: elemA.value,
      rightValue: elemB.value,
      comparisonResult,
    },
    state: input,
    highlightedElements: [elemA.id, elemB.id],
    metadata: {
      pointers: [
        { index: indexA, label: "i" },
        { index: indexB, label: "j" },
      ],
    },
    explanation: `Compared index ${indexA} (${elemA.value}) and index ${indexB} (${elemB.value}): ${elemA.value} is ${comparisonResult} than ${elemB.value}.`,
  });

  return builder.build();
}

/**
 * 7. SWAP OPERATION TRACE GENERATOR
 */
export function createSwapTrace(
  input: ArrayState,
  indexA: number,
  indexB: number
): ExecutionTrace<ArrayState> {
  const builder = createExecutionTrace<ArrayState>({
    initialState: input,
    metadata: {
      algorithmId: "array-swap",
      algorithmName: "Array Swap",
      category: "Basic Operations",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  const n = input.items.length;
  if (indexA < 0 || indexA >= n || indexB < 0 || indexB >= n) {
    builder.addStep({
      operation: "custom",
      codeLine: 1,
      variables: { indexA, indexB, length: n, error: "Index out of bounds" },
      state: input,
      highlightedElements: [],
      explanation: `Indices [${indexA}, ${indexB}] out of bounds for array of length ${n}.`,
    });
    return builder.build();
  }

  const elemA = input.items[indexA];
  const elemB = input.items[indexB];

  // Step 0: Initial state
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { indexA, indexB, valueA: elemA.value, valueB: elemB.value },
    state: input,
    highlightedElements: [],
    explanation: `Preparing to swap elements at index ${indexA} (${elemA.value}) and index ${indexB} (${elemB.value}).`,
  });

  // Step 1: Select elements to swap
  builder.addStep({
    operation: "select",
    codeLine: 3,
    variables: { indexA, indexB, temp: elemA.value },
    state: input,
    highlightedElements: [elemA.id, elemB.id],
    metadata: {
      pointers: [
        { index: indexA, label: "i" },
        { index: indexB, label: "j" },
      ],
    },
    explanation: `Selected indices ${indexA} and ${indexB}. Storing value ${elemA.value} in temporary buffer.`,
  });

  // Step 2: Swap elements while strictly preserving stable IDs!
  const swappedItems = [...input.items];
  swappedItems[indexA] = elemB;
  swappedItems[indexB] = elemA;
  const swappedState: ArrayState = { items: Object.freeze(swappedItems) };

  builder.addStep({
    operation: "swap",
    codeLine: 4,
    variables: {
      indexA,
      indexB,
      newValueA: elemB.value,
      newValueB: elemA.value,
    },
    state: swappedState,
    highlightedElements: [elemA.id, elemB.id],
    metadata: {
      pointers: [
        { index: indexA, label: "swapped" },
        { index: indexB, label: "swapped" },
      ],
    },
    explanation: `Swapped positions: index ${indexA} now holds ${elemB.value} (id: ${elemB.id}), index ${indexB} holds ${elemA.value} (id: ${elemA.id}). Stable element IDs followed their logical elements.`,
  });

  // Step Final: Return
  builder.addStep({
    operation: "return",
    codeLine: 6,
    variables: { indexA, indexB },
    state: swappedState,
    highlightedElements: [elemA.id, elemB.id],
    explanation: `Swap complete in O(1) time.`,
  });

  return builder.build();
}

/**
 * 8. BUBBLE SORT TRACE GENERATOR
 */
export function createBubbleSortTrace(input: ArrayState): ExecutionTrace<ArrayState> {
  const builder = createExecutionTrace<ArrayState>({
    initialState: input,
    metadata: {
      algorithmId: "bubble-sort",
      algorithmName: "Bubble Sort",
      category: "Sorting",
      complexity: { time: "O(n²)", space: "O(1)" },
    },
  });

  const n = input.items.length;

  // Step 0: Initial state
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { n },
    state: input,
    highlightedElements: [],
    explanation: `Starting Bubble Sort on ${n} elements.`,
  });

  if (n <= 1) {
    builder.addStep({
      operation: "return",
      codeLine: 7,
      variables: { n, sorted: true },
      state: input,
      highlightedElements: input.items.map((i) => i.id),
      explanation: `Array with ${n} element(s) is trivially sorted.`,
    });
    return builder.build();
  }

  const currentItems: ArrayElement[] = [...input.items];

  for (let i = 0; i < n; i++) {
    let swappedInPass = false;

    for (let j = 0; j < n - i - 1; j++) {
      const leftElem = currentItems[j];
      const rightElem = currentItems[j + 1];
      const shouldSwap = leftElem.value > rightElem.value;

      // Step: Compare adjacent pair
      builder.addStep({
        operation: "compare",
        codeLine: 5,
        variables: {
          i,
          j,
          leftValue: leftElem.value,
          rightValue: rightElem.value,
          shouldSwap,
          pass: i + 1,
        },
        state: { items: Object.freeze([...currentItems]) },
        highlightedElements: [leftElem.id, rightElem.id],
        metadata: {
          pointers: [
            { index: j, label: "j" },
            { index: j + 1, label: "j+1" },
          ],
          pass: i + 1,
        },
        explanation: `Pass ${i + 1}: Compare index ${j} (${leftElem.value}) and index ${j + 1} (${rightElem.value}). ${
          shouldSwap
            ? `${leftElem.value} > ${rightElem.value}, so they must be swapped.`
            : `${leftElem.value} <= ${rightElem.value}, already in order.`
        }`,
      });

      if (shouldSwap) {
        // Swap adjacent pair preserving element IDs
        currentItems[j] = rightElem;
        currentItems[j + 1] = leftElem;
        swappedInPass = true;

        builder.addStep({
          operation: "swap",
          codeLine: 6,
          variables: {
            i,
            j,
            swappedLeft: rightElem.value,
            swappedRight: leftElem.value,
            pass: i + 1,
          },
          state: { items: Object.freeze([...currentItems]) },
          highlightedElements: [leftElem.id, rightElem.id],
          metadata: {
            pointers: [
              { index: j, label: "j" },
              { index: j + 1, label: "j+1" },
            ],
            pass: i + 1,
          },
          explanation: `Swapped ${leftElem.value} and ${rightElem.value}. Stable IDs preserved.`,
        });
      }
    }

    // Mark the element that settled into its final sorted position at the end of the pass
    const settledIndex = n - 1 - i;
    const settledElem = currentItems[settledIndex];
    builder.addStep({
      operation: "custom",
      codeLine: 4,
      variables: {
        i,
        settledIndex,
        settledValue: settledElem.value,
        pass: i + 1,
      },
      state: { items: Object.freeze([...currentItems]) },
      highlightedElements: [settledElem.id],
      metadata: {
        pointers: [{ index: settledIndex, label: "sorted" }],
        settledId: settledElem.id,
        pass: i + 1,
      },
      explanation: `Pass ${i + 1} complete. Element ${settledElem.value} is now locked in its final sorted position at index ${settledIndex}.`,
    });

    if (!swappedInPass) {
      builder.addStep({
        operation: "custom",
        codeLine: 4,
        variables: { pass: i + 1, earlyTermination: true },
        state: { items: Object.freeze([...currentItems]) },
        highlightedElements: currentItems.map((e) => e.id),
        explanation: `No swaps occurred during pass ${i + 1}. Array is already fully sorted (early termination optimization).`,
      });
      break;
    }
  }

  // Final sorted completion step
  builder.addStep({
    operation: "return",
    codeLine: 7,
    variables: { totalElements: n, isSorted: true },
    state: { items: Object.freeze([...currentItems]) },
    highlightedElements: currentItems.map((item) => item.id),
    explanation: `Bubble Sort complete! All ${n} elements are sorted in non-decreasing order.`,
  });

  return builder.build();
}
