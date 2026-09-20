/**
 * Queue Input Parsing, Validation, and State Factory
 *
 * Supports Linear Queue (dynamic FIFO) and Circular Queue (bounded buffer slots).
 * Enforces stable element ID generation and bounds checking.
 */

import type { QueueElement, QueueState, QueueVariant } from "./types";

export const DEFAULT_QUEUE_CAPACITY = 6;
export const MAX_QUEUE_CAPACITY = 10;
export const MIN_QUEUE_VALUE = -999;
export const MAX_QUEUE_VALUE = 9999;

export interface ValidationResult<T> {
  readonly isValid: boolean;
  readonly data?: T;
  readonly error?: string;
}

let queueItemIdCounter = 1;

/**
 * Resets the element ID counter (for deterministic tests).
 */
export function resetQueueIdCounter(start: number = 1): void {
  queueItemIdCounter = start;
}

/**
 * Generates a unique stable ID for a queue element.
 * Accepts an optional index to guarantee deterministic IDs between SSR and client hydration.
 */
export function generateQueueItemId(index?: number): string {
  if (typeof index === "number") {
    return `queue-item-${index}`;
  }
  return `queue-item-${queueItemIdCounter++}`;
}

/**
 * Creates an immutable QueueState from values and variant.
 */
export function createQueueState(
  values: readonly number[],
  variant: QueueVariant = "linear",
  capacity: number = DEFAULT_QUEUE_CAPACITY
): QueueState {
  const safeCapacity = Math.max(capacity, values.length, 1);

  if (variant === "circular") {
    // Bounded slots array of length safeCapacity
    const slots: Array<QueueElement | null> = new Array(safeCapacity).fill(null);

    values.forEach((val, i) => {
      if (i < safeCapacity) {
        slots[i] = {
          id: generateQueueItemId(i + 1),
          value: val,
        };
      }
    });

    const size = Math.min(values.length, safeCapacity);
    const frontIndex = size > 0 ? 0 : -1;
    const rearIndex = size > 0 ? size - 1 : -1;
    const frontId = frontIndex >= 0 && slots[frontIndex] ? slots[frontIndex]!.id : null;
    const rearId = rearIndex >= 0 && slots[rearIndex] ? slots[rearIndex]!.id : null;

    return Object.freeze({
      variant,
      items: Object.freeze(slots),
      frontIndex,
      rearIndex,
      size,
      capacity: safeCapacity,
      frontId,
      rearId,
    });
  }

  // Linear queue: array of items from front to rear
  const items: QueueElement[] = values.map((val, idx) => ({
    id: generateQueueItemId(idx + 1),
    value: val,
  }));

  const size = items.length;
  const frontIndex = size > 0 ? 0 : -1;
  const rearIndex = size > 0 ? size - 1 : -1;
  const frontId = size > 0 ? items[0].id : null;
  const rearId = size > 0 ? items[size - 1].id : null;

  return Object.freeze({
    variant,
    items: Object.freeze(items),
    frontIndex,
    rearIndex,
    size,
    capacity: Math.max(safeCapacity, size),
    frontId,
    rearId,
  });
}

/**
 * Parses user input string into an array of numbers for queue initialization.
 */
export function parseQueueInput(
  input: string,
  capacity: number = MAX_QUEUE_CAPACITY
): ValidationResult<number[]> {
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

  if (tokens.length > capacity) {
    return {
      isValid: false,
      error: `Please enter ${capacity} or fewer elements for this queue configuration.`,
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

    if (num < MIN_QUEUE_VALUE || num > MAX_QUEUE_VALUE) {
      return {
        isValid: false,
        error: `Value ${num} is out of display range (${MIN_QUEUE_VALUE} to ${MAX_QUEUE_VALUE}).`,
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
 * Default sample queue values for initial landing.
 */
export const DEFAULT_QUEUE_VALUES: readonly number[] = Object.freeze([10, 20, 30]);
