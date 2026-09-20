/**
 * Hash Table Input Validation, Parsing & State Factory
 *
 * Implements deterministic state construction for Separate Chaining and Open Addressing.
 * Enforces capacity limits and key/value sanity.
 */

import type {
  CollisionStrategy,
  HashBucket,
  HashEntry,
  HashTableState,
  OpenAddressSlot,
} from "./types";
import { computeHash } from "./hash-function";

export const DEFAULT_HASH_TABLE_CAPACITY = 7;
export const MIN_HASH_TABLE_CAPACITY = 5;
export const MAX_HASH_TABLE_CAPACITY = 15;
export const MAX_KEY_LENGTH = 16;
export const MAX_VALUE_LENGTH = 16;

export interface ValidationResult<T> {
  readonly isValid: boolean;
  readonly data?: T;
  readonly error?: string;
}

/**
 * Generates a stable deterministic ID for a hash entry based on key.
 */
export function generateHashEntryId(key: string): string {
  // Sanitize key for CSS-safe ID selector
  const sanitized = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `entry-${sanitized}`;
}

/**
 * Validates a key string.
 */
export function validateKey(key: string): ValidationResult<string> {
  if (!key || typeof key !== "string") {
    return {
      isValid: false,
      error: "Key cannot be empty.",
    };
  }

  const trimmed = key.trim();
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: "Key cannot be empty or only spaces.",
    };
  }

  if (trimmed.length > MAX_KEY_LENGTH) {
    return {
      isValid: false,
      error: `Key must be ${MAX_KEY_LENGTH} or fewer characters.`,
    };
  }

  return {
    isValid: true,
    data: trimmed,
  };
}

/**
 * Validates a value string.
 */
export function validateValue(value: string): ValidationResult<string> {
  if (value === undefined || value === null) {
    return {
      isValid: false,
      error: "Value cannot be null or undefined.",
    };
  }

  const str = String(value).trim();
  if (str.length === 0) {
    return {
      isValid: false,
      error: "Value cannot be empty.",
    };
  }

  if (str.length > MAX_VALUE_LENGTH) {
    return {
      isValid: false,
      error: `Value must be ${MAX_VALUE_LENGTH} or fewer characters.`,
    };
  }

  return {
    isValid: true,
    data: str,
  };
}

/**
 * Validates and clamps capacity.
 */
export function clampCapacity(capacity: number): number {
  if (!Number.isFinite(capacity) || capacity < MIN_HASH_TABLE_CAPACITY) {
    return DEFAULT_HASH_TABLE_CAPACITY;
  }
  return Math.min(Math.floor(capacity), MAX_HASH_TABLE_CAPACITY);
}

/**
 * Creates an empty or pre-populated HashTableState.
 */
export function createHashTableState(
  initialPairs: readonly { key: string; value: string }[] = [],
  strategy: CollisionStrategy = "chaining",
  capacity: number = DEFAULT_HASH_TABLE_CAPACITY
): HashTableState {
  const safeCapacity = clampCapacity(capacity);

  if (strategy === "chaining") {
    // Initialize buckets array with empty entries
    const buckets: HashBucket[] = Array.from({ length: safeCapacity }, (_, index) => ({
      index,
      entries: [],
    }));

    let size = 0;

    for (const pair of initialPairs) {
      const keyVal = validateKey(pair.key);
      const valVal = validateValue(pair.value);
      if (!keyVal.isValid || !valVal.isValid || !keyVal.data || !valVal.data) continue;

      const { hash } = computeHash(keyVal.data, safeCapacity);
      const bucket = buckets[hash];

      // Check if key already exists in this bucket
      const existingIdx = bucket.entries.findIndex((e) => e.key === keyVal.data);
      if (existingIdx >= 0) {
        // Update in-place
        const updatedEntries = [...bucket.entries];
        updatedEntries[existingIdx] = {
          id: generateHashEntryId(keyVal.data),
          key: keyVal.data,
          value: valVal.data,
          hash,
        };
        buckets[hash] = {
          index: hash,
          entries: Object.freeze(updatedEntries),
        };
      } else {
        const newEntry: HashEntry = {
          id: generateHashEntryId(keyVal.data),
          key: keyVal.data,
          value: valVal.data,
          hash,
        };
        buckets[hash] = {
          index: hash,
          entries: Object.freeze([...bucket.entries, newEntry]),
        };
        size++;
      }
    }

    return Object.freeze({
      capacity: safeCapacity,
      size,
      collisionStrategy: strategy,
      buckets: Object.freeze(buckets),
      loadFactor: Number((size / safeCapacity).toFixed(2)),
    });
  }

  // Open Addressing (Linear or Quadratic Probing)
  const slots: OpenAddressSlot[] = Array.from({ length: safeCapacity }, (_, index) => ({
    index,
    status: "empty",
    entry: null,
  }));

  let size = 0;

  for (const pair of initialPairs) {
    const keyVal = validateKey(pair.key);
    const valVal = validateValue(pair.value);
    if (!keyVal.isValid || !valVal.isValid || !keyVal.data || !valVal.data) continue;

    if (size >= safeCapacity) break; // Table full

    const { hash } = computeHash(keyVal.data, safeCapacity);

    // Probe sequence
    let inserted = false;
    for (let i = 0; i < safeCapacity; i++) {
      const probeOffset = strategy === "linear-probing" ? i : i * i;
      const slotIdx = (hash + probeOffset) % safeCapacity;
      const slot = slots[slotIdx];

      if (slot.status === "occupied" && slot.entry?.key === keyVal.data) {
        // Update existing
        slots[slotIdx] = {
          index: slotIdx,
          status: "occupied",
          entry: {
            id: generateHashEntryId(keyVal.data),
            key: keyVal.data,
            value: valVal.data,
            hash,
          },
        };
        inserted = true;
        break;
      }

      if (slot.status === "empty" || slot.status === "deleted") {
        slots[slotIdx] = {
          index: slotIdx,
          status: "occupied",
          entry: {
            id: generateHashEntryId(keyVal.data),
            key: keyVal.data,
            value: valVal.data,
            hash,
          },
        };
        size++;
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      // Could not find open slot
      break;
    }
  }

  return Object.freeze({
    capacity: safeCapacity,
    size,
    collisionStrategy: strategy,
    slots: Object.freeze(slots),
    loadFactor: Number((size / safeCapacity).toFixed(2)),
  });
}

/**
 * Default sample key-value entries.
 * Under capacity 7:
 * - Carol -> index 0
 * - Dave -> index 0 (COLLISION with Carol!)
 * - Alice -> index 4
 */
export const DEFAULT_HASH_ENTRIES: readonly { key: string; value: string }[] = Object.freeze([
  { key: "Carol", value: "95" },
  { key: "Dave", value: "88" },
  { key: "Alice", value: "25" },
]);
