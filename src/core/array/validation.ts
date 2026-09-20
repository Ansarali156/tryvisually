/**
 * Array Input Parser and Validation Utilities
 *
 * Enforces learner-friendly input sanitation and visualization limits (max 30 elements).
 */

import type { ArrayElement, ArrayState } from "./types";

export const MAX_ARRAY_SIZE = 30;
export const MIN_ARRAY_VALUE = -999;
export const MAX_ARRAY_VALUE = 9999;

export interface ValidationResult<T> {
  readonly isValid: boolean;
  readonly data?: T;
  readonly error?: string;
}

let elementIdCounter = 1;

/**
 * Resets the ID counter (useful for deterministic testing).
 */
export function resetElementIdCounter(start: number = 1): void {
  elementIdCounter = start;
}

/**
 * Generates a unique stable string ID for an array element.
 * Accepts an optional index to guarantee deterministic IDs between SSR and client hydration.
 */
export function generateElementId(index?: number): string {
  if (typeof index === "number") {
    return `array-item-${index}`;
  }
  return `array-item-${elementIdCounter++}`;
}

/**
 * Creates an immutable ArrayState from an array of numbers with stable element IDs.
 */
export function createArrayState(values: readonly number[]): ArrayState {
  const items: ArrayElement[] = values.map((val, idx) => ({
    id: generateElementId(idx + 1),
    value: val,
  }));

  return Object.freeze({
    items: Object.freeze(items),
  });
}

/**
 * Parses a comma- or space-separated string of numbers into a numeric array with validation.
 */
export function parseArrayInput(input: string): ValidationResult<number[]> {
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

  // Split on commas and/or whitespace
  const tokens = trimmed.split(/[\s,]+/).filter((t) => t.length > 0);

  if (tokens.length === 0) {
    return {
      isValid: false,
      error: "Please enter at least one number.",
    };
  }

  if (tokens.length > MAX_ARRAY_SIZE) {
    return {
      isValid: false,
      error: `Please enter ${MAX_ARRAY_SIZE} or fewer elements for the interactive visualization.`,
    };
  }

  const parsedNumbers: number[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    // Strict integer check
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
        error: `Value "${token}" is not a valid finite number.`,
      };
    }

    if (num < MIN_ARRAY_VALUE || num > MAX_ARRAY_VALUE) {
      return {
        isValid: false,
        error: `Value ${num} is out of display range (${MIN_ARRAY_VALUE} to ${MAX_ARRAY_VALUE}).`,
      };
    }

    parsedNumbers.push(num);
  }

  return {
    isValid: true,
    data: parsedNumbers,
  };
}

/**
 * Validates operation index boundaries.
 */
export function validateIndex(
  index: number,
  arrayLength: number,
  isInsert: boolean = false
): ValidationResult<number> {
  if (typeof index !== "number" || !Number.isInteger(index)) {
    return {
      isValid: false,
      error: "Index must be an integer.",
    };
  }

  if (index < 0) {
    return {
      isValid: false,
      error: `Index cannot be negative (received ${index}).`,
    };
  }

  const maxAllowed = isInsert ? arrayLength : arrayLength - 1;

  if (arrayLength === 0 && !isInsert) {
    return {
      isValid: false,
      error: "Cannot perform operation on an empty array.",
    };
  }

  if (index > maxAllowed) {
    return {
      isValid: false,
      error: `Index ${index} is out of bounds (valid range: 0 to ${maxAllowed}).`,
    };
  }

  return {
    isValid: true,
    data: index,
  };
}
