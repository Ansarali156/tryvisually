/**
 * Linked List Input Parsing, Validation, and State Factory
 *
 * Requirements:
 * 1. Supports Singly, Doubly, and Circular linked list structures.
 * 2. Enforces maximum 30 nodes limit with friendly messaging.
 * 3. Builds immutable LinkedListState with stable node IDs and explicit pointer mappings.
 */

import type { LinkedListNode, LinkedListState, LinkedListVariant } from "./types";

export const MAX_LINKED_LIST_SIZE = 30;
export const MIN_NODE_VALUE = -999;
export const MAX_NODE_VALUE = 9999;

export interface ValidationResult<T> {
  readonly isValid: boolean;
  readonly data?: T;
  readonly error?: string;
}

let nodeIdCounter = 1;

/**
 * Resets the node ID counter (for deterministic testing).
 */
export function resetNodeIdCounter(start: number = 1): void {
  nodeIdCounter = start;
}

/**
 * Generates a unique stable ID for a node.
 * Accepts an optional index to guarantee deterministic IDs between SSR and client hydration.
 */
export function generateNodeId(index?: number): string {
  if (typeof index === "number") {
    return `node-${index}`;
  }
  return `node-${nodeIdCounter++}`;
}

/**
 * Creates an immutable LinkedListState from an array of numbers and variant.
 */
export function createLinkedListState(
  values: readonly number[],
  variant: LinkedListVariant = "singly"
): LinkedListState {
  if (values.length === 0) {
    return Object.freeze({
      nodes: Object.freeze([]),
      headId: null,
      tailId: null,
      next: Object.freeze({}),
      previous: variant === "doubly" ? Object.freeze({}) : undefined,
      variant,
    });
  }

  const nodes: LinkedListNode[] = values.map((val, idx) => ({
    id: generateNodeId(idx + 1),
    value: val,
  }));

  const nextMap: Record<string, string | null> = {};
  const prevMap: Record<string, string | null> = {};

  for (let i = 0; i < nodes.length; i++) {
    const currId = nodes[i].id;
    const nextId = i < nodes.length - 1 ? nodes[i + 1].id : null;
    const prevId = i > 0 ? nodes[i - 1].id : null;

    nextMap[currId] = nextId;
    if (variant === "doubly") {
      prevMap[currId] = prevId;
    }
  }

  const headId = nodes[0].id;
  const tailId = nodes[nodes.length - 1].id;

  // For circular lists, tail connects back to head!
  if (variant === "circular") {
    nextMap[tailId] = headId;
  }

  return Object.freeze({
    nodes: Object.freeze(nodes),
    headId,
    tailId,
    next: Object.freeze(nextMap),
    previous: variant === "doubly" ? Object.freeze(prevMap) : undefined,
    variant,
  });
}

/**
 * Parses user string input into an array of numbers.
 */
export function parseLinkedListInput(input: string): ValidationResult<number[]> {
  if (!input || typeof input !== "string") {
    return {
      isValid: false,
      error: "Please enter at least one node value.",
    };
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: "Please enter at least one node value.",
    };
  }

  const tokens = trimmed.split(/[\s,]+/).filter((t) => t.length > 0);

  if (tokens.length === 0) {
    return {
      isValid: false,
      error: "Please enter at least one node value.",
    };
  }

  if (tokens.length > MAX_LINKED_LIST_SIZE) {
    return {
      isValid: false,
      error: `Please enter ${MAX_LINKED_LIST_SIZE} or fewer nodes for the interactive visualization.`,
    };
  }

  const parsedNumbers: number[] = [];

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
        error: `Value "${token}" is not a valid finite number.`,
      };
    }

    if (num < MIN_NODE_VALUE || num > MAX_NODE_VALUE) {
      return {
        isValid: false,
        error: `Value ${num} is out of display range (${MIN_NODE_VALUE} to ${MAX_NODE_VALUE}).`,
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
 * Validates position index for linked list operations.
 */
export function validateNodePosition(
  position: number,
  nodeCount: number,
  isInsert: boolean = false
): ValidationResult<number> {
  if (typeof position !== "number" || !Number.isInteger(position)) {
    return {
      isValid: false,
      error: "Position must be an integer.",
    };
  }

  if (position < 0) {
    return {
      isValid: false,
      error: `Position cannot be negative (received ${position}).`,
    };
  }

  const maxAllowed = isInsert ? nodeCount : nodeCount - 1;

  if (nodeCount === 0 && !isInsert) {
    return {
      isValid: false,
      error: "Cannot perform operation on an empty list.",
    };
  }

  if (position > maxAllowed) {
    return {
      isValid: false,
      error: `Position ${position} is out of bounds (valid range: 0 to ${maxAllowed}).`,
    };
  }

  return {
    isValid: true,
    data: position,
  };
}

export const validateIndex = validateNodePosition;

/**
 * Default sample lists for initial landing.
 */
export const DEFAULT_LINKED_LIST_VALUES: readonly number[] = Object.freeze([
  10, 20, 30, 40,
]);
