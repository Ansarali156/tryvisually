/**
 * Stack Input Parsing, Validation, and State Factory
 *
 * Enforces LIFO stack invariants, maximum size constraints,
 * and stable element ID generation.
 */

import type { StackElement, StackState } from "./types";

export const MAX_STACK_SIZE = 15;
export const MIN_STACK_VALUE = -999;
export const MAX_STACK_VALUE = 9999;

export interface ValidationResult<T> {
  readonly isValid: boolean;
  readonly data?: T;
  readonly error?: string;
}

let stackItemIdCounter = 1;

/**
 * Resets the element ID counter (for deterministic tests).
 */
export function resetStackIdCounter(start: number = 1): void {
  stackItemIdCounter = start;
}

/**
 * Generates a unique stable ID for a stack element.
 * Accepts an optional index to guarantee deterministic IDs between SSR and client hydration.
 */
export function generateStackItemId(index?: number): string {
  if (typeof index === "number") {
    return `stack-item-${index}`;
  }
  return `stack-item-${stackItemIdCounter++}`;
}

/**
 * Creates an immutable StackState from numeric values.
 * Values are placed in array order: values[0] is bottom, values[length-1] is TOP.
 */
export function createStackState(
  values: readonly number[],
  capacity: number = MAX_STACK_SIZE
): StackState {
  if (values.length === 0) {
    return Object.freeze({
      items: Object.freeze([]),
      topId: null,
      capacity,
    });
  }

  const items: StackElement[] = values.map((val, idx) => ({
    id: generateStackItemId(idx + 1),
    value: val,
  }));

  const topId = items[items.length - 1].id;

  return Object.freeze({
    items: Object.freeze(items),
    topId,
    capacity,
  });
}

/**
 * Parses user input string into an array of numbers for stack initialization.
 */
export function parseStackInput(input: string): ValidationResult<number[]> {
  if (!input || typeof input !== "string") {
    return {
      isValid: false,
      error: "Please enter at least one number.",
    };
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: "Please enter at least one number.",
    };
  }

  const tokens = trimmed.split(/[\s,]+/).filter((t) => t.length > 0);

  if (tokens.length === 0) {
    return {
      isValid: false,
      error: "Please enter at least one number.",
    };
  }

  if (tokens.length > MAX_STACK_SIZE) {
    return {
      isValid: false,
      error: `Please enter ${MAX_STACK_SIZE} or fewer elements for the vertical stack visualization.`,
    };
  }

  const numbers: number[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!/^-?\d+$/.test(token)) {
      return {
        isValid: false,
        error: `Invalid value "${token}" at position ${i + 1}. Please enter integers only.`,
      };
    }

    const num = Number.parseInt(token, 10);
    if (!Number.isFinite(num)) {
      return {
        isValid: false,
        error: `Value "${token}" is not a valid number.`,
      };
    }

    if (num < MIN_STACK_VALUE || num > MAX_STACK_VALUE) {
      return {
        isValid: false,
        error: `Value ${num} is out of display range (${MIN_STACK_VALUE} to ${MAX_STACK_VALUE}).`,
      };
    }

    numbers.push(num);
  }

  return {
    isValid: true,
    data: numbers,
  };
}

/**
 * Default sample stack values for initial landing.
 * Bottom: 10, Middle: 20, Top: 30
 */
export const DEFAULT_STACK_VALUES: readonly number[] = Object.freeze([10, 20, 30]);
