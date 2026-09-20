/**
 * Variable Synchronization & Change Detection Utilities
 *
 * Compares variables between Step N-1 and Step N to detect mutations deterministically,
 * enabling the UI to visually emphasize changed variables.
 */

import type { VariableDiff } from "../types";

/**
 * Deterministic deep equality check for variable values.
 * Handles primitives, arrays, objects, null, and undefined.
 */
export function areValuesEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;

  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }

  // Compare arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!areValuesEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // If one is array and other is not
  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  // Compare objects
  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (
      !areValuesEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Computes variable diffs between previous step variables and current step variables.
 */
export function computeVariableDiffs(
  previousVars: Readonly<Record<string, unknown>> | undefined | null,
  currentVars: Readonly<Record<string, unknown>> | undefined | null
): Readonly<Record<string, VariableDiff>> {
  const diffs: Record<string, VariableDiff> = {};

  const prev = previousVars ?? {};
  const curr = currentVars ?? {};

  // Check all current variables
  for (const [key, currentValue] of Object.entries(curr)) {
    const isNew = !Object.prototype.hasOwnProperty.call(prev, key);
    const previousValue = isNew ? undefined : prev[key];
    const hasChanged = isNew || !areValuesEqual(previousValue, currentValue);

    diffs[key] = {
      key,
      previousValue,
      currentValue,
      hasChanged,
      isNew,
    };
  }

  return Object.freeze(diffs);
}

/**
 * Safe, educational formatting utility for variable values across all JavaScript data types.
 */
export function formatVariableValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  switch (typeof value) {
    case "string":
      return `"${value}"`;
    case "number":
    case "boolean":
      return String(value);
    case "object":
      if (Array.isArray(value)) {
        if (value.length === 0) return "[]";
        if (value.length <= 8) {
          return `[${value.map((v) => formatVariableValue(v)).join(", ")}]`;
        }
        return `[${value.slice(0, 6).map((v) => formatVariableValue(v)).join(", ")}, …+${value.length - 6}]`;
      }
      try {
        const entries = Object.entries(value);
        if (entries.length === 0) return "{}";
        if (entries.length <= 4) {
          return `{ ${entries.map(([k, v]) => `${k}: ${formatVariableValue(v)}`).join(", ")} }`;
        }
        return `{ ${entries.slice(0, 3).map(([k, v]) => `${k}: ${formatVariableValue(v)}`).join(", ")}, … }`;
      } catch {
        return "[Object]";
      }
    default:
      return String(value);
  }
}
