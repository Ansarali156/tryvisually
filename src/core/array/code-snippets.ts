/**
 * Synchronized Code Snippets for Array Operations
 *
 * Each operation provides structured SourceCode objects with verified 1-indexed line numbers
 * for Python and TypeScript.
 */

import type { SourceCode, SupportedLanguage } from "@/core/synchronization/types";
import { parseSourceCode } from "@/core/synchronization/utils/source-code";
import type { ArrayOperationType } from "./types";

interface OperationCodeDefinition {
  python: string;
  typescript: string;
}

const RAW_CODE_SNIPPETS: Record<ArrayOperationType, OperationCodeDefinition> = {
  access: {
    python: `def access_element(arr, index):
    # Direct index access in O(1) time
    value = arr[index]
    return value`,
    typescript: `function accessElement(arr: number[], index: number): number {
  // Direct index access in O(1) time
  const value = arr[index];
  return value;
}`,
  },
  update: {
    python: `def update_element(arr, index, new_val):
    # Direct index assignment in O(1) time
    arr[index] = new_val
    return arr`,
    typescript: `function updateElement(arr: number[], index: number, newVal: number): number[] {
  // Direct index assignment in O(1) time
  arr[index] = newVal;
  return arr;
}`,
  },
  insert: {
    python: `def insert_element(arr, index, value):
    # Shift elements to the right to open space
    for i in range(len(arr) - 1, index - 1, -1):
        arr[i + 1] = arr[i]
    arr[index] = value  # Insert at target position
    return arr`,
    typescript: `function insertElement(arr: number[], index: number, value: number): number[] {
  // Shift elements to the right to open space
  for (let i = arr.length - 1; i >= index; i--) {
    arr[i + 1] = arr[i];
  }
  arr[index] = value; // Insert at target position
  return arr;
}`,
  },
  delete: {
    python: `def delete_element(arr, index):
    # Shift elements to the left to close gap
    for i in range(index, len(arr) - 1):
        arr[i] = arr[i + 1]
    arr.pop()  # Remove last element
    return arr`,
    typescript: `function deleteElement(arr: number[], index: number): number[] {
  // Shift elements to the left to close gap
  for (let i = index; i < arr.length - 1; i++) {
    arr[i] = arr[i + 1];
  }
  arr.length = arr.length - 1; // Remove last element
  return arr;
}`,
  },
  "linear-search": {
    python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i  # Found at index i
    return -1  # Target not found`,
    typescript: `function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Found at index i
    }
  }
  return -1; // Target not found
}`,
  },
  compare: {
    python: `def compare_elements(arr, i, j):
    # Compare elements at indices i and j
    if arr[i] > arr[j]:
        return "greater"
    elif arr[i] < arr[j]:
        return "less"
    return "equal"`,
    typescript: `function compareElements(arr: number[], i: number, j: number): string {
  // Compare elements at indices i and j
  if (arr[i] > arr[j]) {
    return "greater";
  } else if (arr[i] < arr[j]) {
    return "less";
  }
  return "equal";
}`,
  },
  swap: {
    python: `def swap_elements(arr, i, j):
    # Exchange elements preserving stable identities
    temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
    return arr`,
    typescript: `function swapElements(arr: number[], i: number, j: number): number[] {
  // Exchange elements preserving stable identities
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
  return arr;
}`,
  },
  "bubble-sort": {
    python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    typescript: `function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
  },
};

/**
 * Returns structured SourceCode snippets for an array operation.
 */
export function getArrayOperationSourceCodes(
  operation: ArrayOperationType
): Partial<Record<SupportedLanguage, SourceCode>> {
  const def = RAW_CODE_SNIPPETS[operation];
  return {
    python: parseSourceCode(def.python, "python"),
    typescript: parseSourceCode(def.typescript, "typescript"),
  };
}
