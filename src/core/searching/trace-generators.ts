/**
 * Searching Algorithms Trace Generators
 *
 * Deterministic execution traces for:
 * 1. Linear Search
 * 2. Binary Search
 */

import { createExecutionTrace } from "@/core/execution/trace/trace-builder";
import type { ExecutionTrace } from "@/core/execution/types";

export interface SearchingState {
  readonly array: readonly number[];
  readonly target: number;
  readonly currentIndex: number | null;
  readonly low?: number;
  readonly mid?: number;
  readonly high?: number;
  readonly foundIndex?: number | null;
  readonly eliminatedIndices?: readonly number[];
  readonly phaseDescription: string;
}

/**
 * Generates deterministic ExecutionTrace for Linear Search
 */
export function generateLinearSearchTrace(
  array: readonly number[],
  target: number
): ExecutionTrace<SearchingState> {
  const initialState: SearchingState = {
    array,
    target,
    currentIndex: null,
    foundIndex: null,
    phaseDescription: `Ready to search for target value ${target} in array of length ${array.length}.`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "linear-search",
      algorithmName: "Linear Search",
      category: "Searching",
    },
  });

  if (array.length === 0) {
    builder.addStep({
      operation: "compare",
      codeLine: 7,
      variables: { target, arrayLength: 0, result: -1 },
      state: {
        ...initialState,
        phaseDescription: `Array is empty. Target ${target} not found.`,
      },
      highlightedElements: [],
      explanation: `Array is empty. Terminating search with -1.`,
    });
    return builder.build();
  }

  let found = false;

  for (let i = 0; i < array.length; i++) {
    const val = array[i];
    const isMatch = val === target;

    builder.addStep({
      operation: "compare",
      codeLine: 3,
      variables: {
        i,
        currentValue: val,
        target,
        match: isMatch,
      },
      state: {
        array,
        target,
        currentIndex: i,
        foundIndex: null,
        phaseDescription: `Index ${i}: Comparing array[${i}] = ${val} with target ${target}.`,
      },
      highlightedElements: [`elem-${i}`],
      explanation: isMatch
        ? `Match found! array[${i}] (${val}) == ${target}.`
        : `array[${i}] (${val}) != ${target}. Advancing to next index.`,
    });

    if (isMatch) {
      found = true;
      builder.addStep({
        operation: "select",
        codeLine: 4,
        variables: {
          foundIndex: i,
          target,
          totalComparisons: i + 1,
        },
        state: {
          array,
          target,
          currentIndex: i,
          foundIndex: i,
          phaseDescription: `Search successful! Found target ${target} at index ${i} in ${i + 1} comparison(s).`,
        },
        highlightedElements: [`elem-${i}`],
        explanation: `Linear search successful! Returned index ${i}.`,
      });
      break;
    }
  }

  if (!found) {
    builder.addStep({
      operation: "compare",
      codeLine: 7,
      variables: {
        target,
        result: -1,
        totalComparisons: array.length,
      },
      state: {
        array,
        target,
        currentIndex: null,
        foundIndex: -1,
        phaseDescription: `Linear search ended: Target ${target} does not exist in array. Returned -1.`,
      },
      highlightedElements: [],
      explanation: `Target ${target} not found after checking all ${array.length} elements.`,
    });
  }

  return builder.build();
}

/**
 * Generates deterministic ExecutionTrace for Binary Search
 */
export function generateBinarySearchTrace(
  rawArray: readonly number[],
  target: number
): ExecutionTrace<SearchingState> {
  // Ensure array is sorted for binary search
  const array = [...rawArray].sort((a, b) => a - b);

  const initialState: SearchingState = {
    array,
    target,
    currentIndex: null,
    low: 0,
    mid: undefined,
    high: array.length - 1,
    foundIndex: null,
    eliminatedIndices: [],
    phaseDescription: `Sorted array. Ready to perform Binary Search for target ${target} within [0, ${array.length - 1}].`,
  };

  const builder = createExecutionTrace({
    initialState,
    metadata: {
      algorithmId: "binary-search",
      algorithmName: "Binary Search",
      category: "Searching",
    },
  });

  if (array.length === 0) return builder.build();

  let low = 0;
  let high = array.length - 1;
  const eliminated = new Set<number>();
  let found = false;

  builder.addStep({
    operation: "call",
    codeLine: 2,
    variables: {
      low,
      high,
      target,
      searchRange: `[${low}..${high}]`,
    },
    state: {
      array,
      target,
      currentIndex: null,
      low,
      high,
      foundIndex: null,
      eliminatedIndices: [],
      phaseDescription: `Initialize search bounds: low = 0, high = ${high}. Search space = ${array.length} elements.`,
    },
    highlightedElements: [`elem-${low}`, `elem-${high}`],
    explanation: `Initialized low = 0 and high = ${high}.`,
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = array[mid];

    builder.addStep({
      operation: "select",
      codeLine: 5,
      variables: {
        low,
        mid,
        high,
        midVal,
        target,
      },
      state: {
        array,
        target,
        currentIndex: mid,
        low,
        mid,
        high,
        foundIndex: null,
        eliminatedIndices: Array.from(eliminated),
        phaseDescription: `Calculated mid = ⌊(${low} + ${high}) / 2⌋ = ${mid}. array[mid] = ${midVal}.`,
      },
      highlightedElements: [`elem-${mid}`],
      explanation: `Inspecting middle element array[${mid}] = ${midVal}.`,
    });

    if (midVal === target) {
      found = true;
      builder.addStep({
        operation: "select",
        codeLine: 6,
        variables: {
          foundIndex: mid,
          target,
          midVal,
        },
        state: {
          array,
          target,
          currentIndex: mid,
          low,
          mid,
          high,
          foundIndex: mid,
          eliminatedIndices: Array.from(eliminated),
          phaseDescription: `Target found! array[${mid}] == ${target}. Binary search finished.`,
        },
        highlightedElements: [`elem-${mid}`],
        explanation: `Match confirmed at index ${mid}. Return ${mid}.`,
      });
      break;
    } else if (midVal < target) {
      builder.addStep({
        operation: "compare",
        codeLine: 8,
        variables: {
          midVal,
          target,
          condition: `${midVal} < ${target}`,
          action: "Search right half (low = mid + 1)",
        },
        state: {
          array,
          target,
          currentIndex: mid,
          low,
          mid,
          high,
          foundIndex: null,
          eliminatedIndices: Array.from(eliminated),
          phaseDescription: `array[mid] (${midVal}) < target (${target}). Eliminating left half [${low}..${mid}].`,
        },
        highlightedElements: [`elem-${mid}`],
        explanation: `Target is greater than middle value. We discard the left half and update low to ${mid + 1}.`,
      });

      for (let k = low; k <= mid; k++) eliminated.add(k);
      low = mid + 1;
    } else {
      builder.addStep({
        operation: "compare",
        codeLine: 10,
        variables: {
          midVal,
          target,
          condition: `${midVal} > ${target}`,
          action: "Search left half (high = mid - 1)",
        },
        state: {
          array,
          target,
          currentIndex: mid,
          low,
          mid,
          high,
          foundIndex: null,
          eliminatedIndices: Array.from(eliminated),
          phaseDescription: `array[mid] (${midVal}) > target (${target}). Eliminating right half [${mid}..${high}].`,
        },
        highlightedElements: [`elem-${mid}`],
        explanation: `Target is smaller than middle value. We discard the right half and update high to ${mid - 1}.`,
      });

      for (let k = mid; k <= high; k++) eliminated.add(k);
      high = mid - 1;
    }
  }

  if (!found) {
    builder.addStep({
      operation: "compare",
      codeLine: 13,
      variables: {
        low,
        high,
        result: -1,
        target,
      },
      state: {
        array,
        target,
        currentIndex: null,
        low,
        high,
        foundIndex: -1,
        eliminatedIndices: array.map((_, i) => i),
        phaseDescription: `Search range exhausted (low ${low} > high ${high}). Target ${target} not in array. Returned -1.`,
      },
      highlightedElements: [],
      explanation: `Binary search terminated with -1. Target not present.`,
    });
  }

  return builder.build();
}
