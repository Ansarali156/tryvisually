/**
 * Trace Generators for Sorting Algorithms
 *
 * Implements deterministic execution traces for:
 * 1. Bubble Sort
 * 2. Selection Sort
 * 3. Insertion Sort
 * 4. Merge Sort
 * 5. Quick Sort
 */

import { createExecutionTrace } from "@/core/execution/trace/trace-builder";
import type { ExecutionTrace } from "@/core/execution/types";
import type { SortingState } from "./types";

/**
 * 1. Bubble Sort
 */
export function generateBubbleSortTrace(
  input: readonly number[]
): ExecutionTrace<SortingState> {
  const arr = [...input];
  const n = arr.length;

  const initialState: SortingState = {
    array: [...arr],
    comparingIndices: [],
    swappedIndices: [],
    sortedIndices: [],
    phaseDescription: `Starting Bubble Sort on array of size ${n}.`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "bubble-sort",
      algorithmName: "Bubble Sort",
      category: "Sorting",
    },
  });

  if (n <= 1) {
    builder.addStep({
      operation: "call",
      codeLine: 1,
      variables: { n },
      state: {
        array: [...arr],
        comparingIndices: [],
        swappedIndices: [],
        sortedIndices: n === 1 ? [0] : [],
        phaseDescription: "Array is already sorted.",
      },
      highlightedElements: [],
      explanation: "Array has 1 or 0 elements and is trivially sorted.",
    });
    return builder.build();
  }

  const sorted: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    builder.addStep({
      operation: "call",
      codeLine: 3,
      variables: { i, passesRemaining: n - 1 - i },
      state: {
        array: [...arr],
        comparingIndices: [],
        swappedIndices: [],
        sortedIndices: [...sorted],
        phaseDescription: `Starting outer pass ${i + 1}/${n - 1}.`,
      },
      highlightedElements: [],
      explanation: `Pass ${i + 1}: Bubbling up the maximum element to position ${n - 1 - i}.`,
    });

    for (let j = 0; j < n - i - 1; j++) {
      const isGreater = arr[j] > arr[j + 1];

      builder.addStep({
        operation: "compare",
        codeLine: 5,
        variables: {
          j,
          valA: arr[j],
          valB: arr[j + 1],
          condition: `${arr[j]} > ${arr[j + 1]} (${isGreater})`,
        },
        state: {
          array: [...arr],
          comparingIndices: [j, j + 1],
          swappedIndices: [],
          sortedIndices: [...sorted],
          phaseDescription: `Comparing arr[${j}] (${arr[j]}) and arr[${j + 1}] (${arr[j + 1]}).`,
        },
        highlightedElements: [`elem-${j}`, `elem-${j + 1}`],
        explanation: isGreater
          ? `${arr[j]} > ${arr[j + 1]}: Elements out of order. Swapping.`
          : `${arr[j]} <= ${arr[j + 1]}: Elements in order. No swap needed.`,
      });

      if (isGreater) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;

        builder.addStep({
          operation: "swap",
          codeLine: 6,
          variables: {
            swappedIndices: [j, j + 1],
            newArr: [...arr],
          },
          state: {
            array: [...arr],
            comparingIndices: [],
            swappedIndices: [j, j + 1],
            sortedIndices: [...sorted],
            phaseDescription: `Swapped arr[${j}] and arr[${j + 1}].`,
          },
          highlightedElements: [`elem-${j}`, `elem-${j + 1}`],
          explanation: `Swapped misplaced elements ${arr[j]} and ${arr[j + 1]}.`,
        });
      }
    }

    sorted.unshift(n - 1 - i);

    if (!swapped) {
      builder.addStep({
        operation: "call",
        codeLine: 10,
        variables: { earlyTermination: true },
        state: {
          array: [...arr],
          comparingIndices: [],
          swappedIndices: [],
          sortedIndices: Array.from({ length: n }, (_, k) => k),
          phaseDescription: "No swaps in this pass. Array is fully sorted!",
        },
        highlightedElements: [],
        explanation: "Early termination: Zero swaps occurred. Array is completely sorted.",
      });
      return builder.build();
    }
  }

  sorted.unshift(0);

  builder.addStep({
    operation: "call",
    codeLine: 11,
    variables: { isSorted: true },
    state: {
      array: [...arr],
      comparingIndices: [],
      swappedIndices: [],
      sortedIndices: Array.from({ length: n }, (_, k) => k),
      phaseDescription: "Bubble Sort complete. All elements in ascending order.",
    },
    highlightedElements: Array.from({ length: n }, (_, k) => `elem-${k}`),
    explanation: "Sorting complete! All elements are arranged in non-decreasing order.",
  });

  return builder.build();
}

/**
 * 2. Selection Sort
 */
export function generateSelectionSortTrace(
  input: readonly number[]
): ExecutionTrace<SortingState> {
  const arr = [...input];
  const n = arr.length;

  const initialState: SortingState = {
    array: [...arr],
    comparingIndices: [],
    swappedIndices: [],
    sortedIndices: [],
    phaseDescription: `Starting Selection Sort on array of length ${n}.`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "selection-sort",
      algorithmName: "Selection Sort",
      category: "Sorting",
    },
  });

  const sorted: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    builder.addStep({
      operation: "select",
      codeLine: 4,
      variables: { i, currentMinIdx: minIdx, minVal: arr[minIdx] },
      state: {
        array: [...arr],
        comparingIndices: [minIdx],
        swappedIndices: [],
        sortedIndices: [...sorted],
        phaseDescription: `Pass ${i + 1}: Initial min candidate at index ${i} (value ${arr[i]}).`,
      },
      highlightedElements: [`elem-${i}`],
      explanation: `Assume minimum element of unsorted prefix is at index ${i}.`,
    });

    for (let j = i + 1; j < n; j++) {
      const isSmaller = arr[j] < arr[minIdx];

      builder.addStep({
        operation: "compare",
        codeLine: 6,
        variables: { j, minIdx, currentVal: arr[j], minVal: arr[minIdx] },
        state: {
          array: [...arr],
          comparingIndices: [j, minIdx],
          swappedIndices: [],
          sortedIndices: [...sorted],
          phaseDescription: `Comparing arr[${j}] (${arr[j]}) with current min arr[${minIdx}] (${arr[minIdx]}).`,
        },
        highlightedElements: [`elem-${j}`, `elem-${minIdx}`],
        explanation: isSmaller
          ? `Found smaller element! Updated minimum index to ${j} (value ${arr[j]}).`
          : `${arr[j]} >= current min (${arr[minIdx]}). Minimum index remains ${minIdx}.`,
      });

      if (isSmaller) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      builder.addStep({
        operation: "swap",
        codeLine: 9,
        variables: { swapped: [i, minIdx], array: [...arr] },
        state: {
          array: [...arr],
          comparingIndices: [],
          swappedIndices: [i, minIdx],
          sortedIndices: [...sorted, i],
          phaseDescription: `Swapped minimal element ${arr[i]} into sorted position index ${i}.`,
        },
        highlightedElements: [`elem-${i}`, `elem-${minIdx}`],
        explanation: `Moved minimum value ${arr[i]} to index ${i}.`,
      });
    }

    sorted.push(i);
  }

  sorted.push(n - 1);

  builder.addStep({
    operation: "call",
    codeLine: 12,
    variables: { isSorted: true },
    state: {
      array: [...arr],
      comparingIndices: [],
      swappedIndices: [],
      sortedIndices: Array.from({ length: n }, (_, k) => k),
      phaseDescription: "Selection Sort complete.",
    },
    highlightedElements: Array.from({ length: n }, (_, k) => `elem-${k}`),
    explanation: "Selection sort finished. All positions have their minimal elements.",
  });

  return builder.build();
}

/**
 * 3. Insertion Sort
 */
export function generateInsertionSortTrace(
  input: readonly number[]
): ExecutionTrace<SortingState> {
  const arr = [...input];
  const n = arr.length;

  const initialState: SortingState = {
    array: [...arr],
    comparingIndices: [],
    swappedIndices: [],
    sortedIndices: [0],
    phaseDescription: `Starting Insertion Sort. First element arr[0] is trivially sorted.`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "insertion-sort",
      algorithmName: "Insertion Sort",
      category: "Sorting",
    },
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    builder.addStep({
      operation: "select",
      codeLine: 3,
      variables: { i, key, sortedPrefix: arr.slice(0, i) },
      state: {
        array: [...arr],
        comparingIndices: [i],
        swappedIndices: [],
        sortedIndices: Array.from({ length: i }, (_, k) => k),
        phaseDescription: `Selected key arr[${i}] = ${key}. Inserting into sorted prefix [0..${i - 1}].`,
      },
      highlightedElements: [`elem-${i}`],
      explanation: `Taking key ${key} from index ${i} to insert into the sorted subarray.`,
    });

    while (j >= 0 && arr[j] > key) {
      builder.addStep({
        operation: "compare",
        codeLine: 5,
        variables: { j, key, currentVal: arr[j], shiftNeeded: true },
        state: {
          array: [...arr],
          comparingIndices: [j, j + 1],
          swappedIndices: [],
          sortedIndices: Array.from({ length: i }, (_, k) => k),
          phaseDescription: `arr[${j}] (${arr[j]}) > key (${key}). Shifting ${arr[j]} right to index ${j + 1}.`,
        },
        highlightedElements: [`elem-${j}`, `elem-${j + 1}`],
        explanation: `Shifted arr[${j}] (${arr[j]}) to index ${j + 1} to make room for ${key}.`,
      });

      arr[j + 1] = arr[j];
      j--;
    }

    arr[j + 1] = key;

    builder.addStep({
      operation: "insert",
      codeLine: 9,
      variables: { insertedAt: j + 1, key, newSortedLength: i + 1 },
      state: {
        array: [...arr],
        comparingIndices: [],
        swappedIndices: [j + 1],
        sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
        phaseDescription: `Inserted key ${key} into position ${j + 1}. Prefix [0..${i}] is now sorted.`,
      },
      highlightedElements: [`elem-${j + 1}`],
      explanation: `Placed key ${key} at position ${j + 1}.`,
    });
  }

  builder.addStep({
    operation: "call",
    codeLine: 11,
    variables: { isSorted: true },
    state: {
      array: [...arr],
      comparingIndices: [],
      swappedIndices: [],
      sortedIndices: Array.from({ length: n }, (_, k) => k),
      phaseDescription: "Insertion Sort complete.",
    },
    highlightedElements: Array.from({ length: n }, (_, k) => `elem-${k}`),
    explanation: "All elements inserted into their correct sorted relative positions.",
  });

  return builder.build();
}

/**
 * 4. Merge Sort
 */
export function generateMergeSortTrace(
  input: readonly number[]
): ExecutionTrace<SortingState> {
  const arr = [...input];
  const n = arr.length;

  const initialState: SortingState = {
    array: [...arr],
    comparingIndices: [],
    swappedIndices: [],
    sortedIndices: [],
    phaseDescription: `Starting Divide-and-Conquer Merge Sort on ${n} elements.`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "merge-sort",
      algorithmName: "Merge Sort",
      category: "Sorting",
    },
  });

  function merge(l: number, m: number, r: number) {
    const leftPart = arr.slice(l, m + 1);
    const rightPart = arr.slice(m + 1, r + 1);

    builder.addStep({
      operation: "call",
      codeLine: 6,
      variables: { l, m, r, leftPart, rightPart },
      state: {
        array: [...arr],
        comparingIndices: [],
        swappedIndices: [],
        sortedIndices: [],
        partitionRange: [l, r],
        phaseDescription: `Merging sorted subarrays [${l}..${m}] and [${m + 1}..${r}].`,
      },
      highlightedElements: Array.from({ length: r - l + 1 }, (_, k) => `elem-${l + k}`),
      explanation: `Merging left [${leftPart.join(", ")}] and right [${rightPart.join(", ")}].`,
    });

    let i = 0;
    let j = 0;
    let k = l;

    while (i < leftPart.length && j < rightPart.length) {
      builder.addStep({
        operation: "compare",
        codeLine: 6,
        variables: { leftVal: leftPart[i], rightVal: rightPart[j] },
        state: {
          array: [...arr],
          comparingIndices: [k],
          swappedIndices: [],
          sortedIndices: [],
          partitionRange: [l, r],
          phaseDescription: `Comparing left element ${leftPart[i]} and right element ${rightPart[j]}.`,
        },
        highlightedElements: [`elem-${k}`],
        explanation: leftPart[i] <= rightPart[j]
          ? `${leftPart[i]} <= ${rightPart[j]}: Pick ${leftPart[i]} from left.`
          : `${rightPart[j]} < ${leftPart[i]}: Pick ${rightPart[j]} from right.`,
      });

      if (leftPart[i] <= rightPart[j]) {
        arr[k] = leftPart[i];
        i++;
      } else {
        arr[k] = rightPart[j];
        j++;
      }
      k++;
    }

    while (i < leftPart.length) {
      arr[k] = leftPart[i];
      i++;
      k++;
    }
    while (j < rightPart.length) {
      arr[k] = rightPart[j];
      j++;
      k++;
    }

    builder.addStep({
      operation: "insert",
      codeLine: 6,
      variables: { mergedRange: [l, r], result: arr.slice(l, r + 1) },
      state: {
        array: [...arr],
        comparingIndices: [],
        swappedIndices: Array.from({ length: r - l + 1 }, (_, idx) => l + idx),
        sortedIndices: [],
        partitionRange: [l, r],
        phaseDescription: `Merged [${l}..${r}] into [${arr.slice(l, r + 1).join(", ")}].`,
      },
      highlightedElements: Array.from({ length: r - l + 1 }, (_, idx) => `elem-${l + idx}`),
      explanation: `Subarray [${l}..${r}] successfully merged in sorted order.`,
    });
  }

  function sort(l: number, r: number) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    sort(l, m);
    sort(m + 1, r);
    merge(l, m, r);
  }

  sort(0, n - 1);

  builder.addStep({
    operation: "call",
    codeLine: 7,
    variables: { isSorted: true },
    state: {
      array: [...arr],
      comparingIndices: [],
      swappedIndices: [],
      sortedIndices: Array.from({ length: n }, (_, k) => k),
      phaseDescription: "Merge Sort complete. Whole array sorted in O(n log n).",
    },
    highlightedElements: Array.from({ length: n }, (_, k) => `elem-${k}`),
    explanation: "Divide-and-conquer recursion completed. Full array is sorted.",
  });

  return builder.build();
}

/**
 * 5. Quick Sort
 */
export function generateQuickSortTrace(
  input: readonly number[]
): ExecutionTrace<SortingState> {
  const arr = [...input];
  const n = arr.length;

  const initialState: SortingState = {
    array: [...arr],
    comparingIndices: [],
    swappedIndices: [],
    sortedIndices: [],
    phaseDescription: `Starting Quick Sort on array of length ${n}.`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "quick-sort",
      algorithmName: "Quick Sort",
      category: "Sorting",
    },
  });

  const sorted: number[] = [];

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;

    builder.addStep({
      operation: "select",
      codeLine: 3,
      variables: { low, high, pivot, pivotIndex: high },
      state: {
        array: [...arr],
        comparingIndices: [],
        swappedIndices: [],
        sortedIndices: [...sorted],
        pivotIndex: high,
        partitionRange: [low, high],
        phaseDescription: `Selected pivot arr[${high}] = ${pivot}. Partitioning [${low}..${high}].`,
      },
      highlightedElements: [`elem-${high}`],
      explanation: `Chosen pivot is ${pivot} at index ${high}. Elements <= pivot will move left.`,
    });

    for (let j = low; j < high; j++) {
      const isSmallerOrEqual = arr[j] <= pivot;

      builder.addStep({
        operation: "compare",
        codeLine: 4,
        variables: { j, val: arr[j], pivot, condition: `${arr[j]} <= ${pivot}` },
        state: {
          array: [...arr],
          comparingIndices: [j, high],
          swappedIndices: [],
          sortedIndices: [...sorted],
          pivotIndex: high,
          partitionRange: [low, high],
          phaseDescription: `Comparing arr[${j}] (${arr[j]}) with pivot ${pivot}.`,
        },
        highlightedElements: [`elem-${j}`, `elem-${high}`],
        explanation: isSmallerOrEqual
          ? `${arr[j]} <= ${pivot}: Belongs in left partition. Advance i to ${i + 1} and swap.`
          : `${arr[j]} > ${pivot}: Remains in right partition.`,
      });

      if (isSmallerOrEqual) {
        i++;
        if (i !== j) {
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;

          builder.addStep({
            operation: "swap",
            codeLine: 4,
            variables: { swapped: [i, j], array: [...arr] },
            state: {
              array: [...arr],
              comparingIndices: [],
              swappedIndices: [i, j],
              sortedIndices: [...sorted],
              pivotIndex: high,
              partitionRange: [low, high],
              phaseDescription: `Swapped arr[${i}] and arr[${j}].`,
            },
            highlightedElements: [`elem-${i}`, `elem-${j}`],
            explanation: `Swapped smaller element into left partition boundary.`,
          });
        }
      }
    }

    // Place pivot in final sorted position i + 1
    const pIndex = i + 1;
    const temp = arr[pIndex];
    arr[pIndex] = arr[high];
    arr[high] = temp;

    sorted.push(pIndex);

    builder.addStep({
      operation: "swap",
      codeLine: 3,
      variables: { pivotPlacedIndex: pIndex, pivot, array: [...arr] },
      state: {
        array: [...arr],
        comparingIndices: [],
        swappedIndices: [pIndex, high],
        sortedIndices: [...sorted],
        pivotIndex: pIndex,
        partitionRange: [low, high],
        phaseDescription: `Placed pivot ${pivot} into its finalized sorted position at index ${pIndex}.`,
      },
      highlightedElements: [`elem-${pIndex}`],
      explanation: `Pivot ${pivot} is now in its exact, final sorted position at index ${pIndex}.`,
    });

    return pIndex;
  }

  function sort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    } else if (low === high) {
      sorted.push(low);
    }
  }

  sort(0, n - 1);

  builder.addStep({
    operation: "call",
    codeLine: 7,
    variables: { isSorted: true },
    state: {
      array: [...arr],
      comparingIndices: [],
      swappedIndices: [],
      sortedIndices: Array.from({ length: n }, (_, k) => k),
      pivotIndex: null,
      phaseDescription: "Quick Sort complete. All partitions solved.",
    },
    highlightedElements: Array.from({ length: n }, (_, k) => `elem-${k}`),
    explanation: "Quick sort finished! Every pivot partition is sorted.",
  });

  return builder.build();
}
