/**
 * Hash Table Pure Deterministic Trace Generators
 *
 * Implements step-by-step execution traces for:
 * - Separate Chaining
 * - Linear Probing (Open Addressing)
 * - Quadratic Probing (Open Addressing)
 *
 * Invariants:
 * 1. Stable Entry IDs (`entry-${key}`) are strictly preserved on update/re-probe.
 * 2. Open addressing deletion sets status to "deleted" (tombstone) to prevent breaking probe chains.
 * 3. Exact character-by-character hash calculation is displayed at step 1 of key-based operations.
 * 4. Step IDs are sequential integers starting at 0.
 */

import type { ExecutionTrace } from "@/core/execution/types";
import { createExecutionTrace } from "@/core/execution/trace/trace-builder";
import type {
  CollisionStrategy,
  HashBucket,
  HashEntry,
  HashTableOperationType,
  HashTableState,
  OpenAddressSlot,
} from "./types";
import { computeHash } from "./hash-function";
import { generateHashEntryId, validateKey, validateValue } from "./validation";

/**
 * Calculates probing offset based on strategy.
 */
export function getProbeOffset(strategy: CollisionStrategy, i: number): number {
  if (strategy === "quadratic-probing") {
    return i * i;
  }
  return i; // linear probing
}

/**
 * Main trace generator entry point routing to operation handlers.
 */
export function generateHashTableTrace(
  state: HashTableState,
  operation: HashTableOperationType,
  params: Record<string, string | number> = {}
): ExecutionTrace<HashTableState> {
  const key = typeof params.key === "string" ? params.key.trim() : "";
  const value = typeof params.value === "string" ? params.value.trim() : "";
  const newValue = typeof params.newValue === "string" ? params.newValue.trim() : value;

  switch (operation) {
    case "insert":
      return generateInsertTrace(state, key, value);
    case "search":
      return generateSearchTrace(state, key);
    case "update":
      return generateUpdateTrace(state, key, newValue);
    case "delete":
      return generateDeleteTrace(state, key);
    case "contains":
      return generateContainsTrace(state, key);
    case "size":
      return generateSizeTrace(state);
    case "clear":
      return generateClearTrace(state);
    default:
      return generateSizeTrace(state);
  }
}

/**
 * 1. INSERT TRACE GENERATOR
 */
export function generateInsertTrace(
  initialState: HashTableState,
  rawKey: string,
  rawValue: string
): ExecutionTrace<HashTableState> {
  const keyValidation = validateKey(rawKey);
  const valueValidation = validateValue(rawValue);

  const key = keyValidation.isValid && keyValidation.data ? keyValidation.data : "Key";
  const value = valueValidation.isValid && valueValidation.data ? valueValidation.data : "Val";

  const builder = createExecutionTrace<HashTableState>({
    initialState,
    metadata: {
      algorithmId: "hash-table-insert",
      algorithmName: "Hash Table Insert",
      category: "Mutation",
      complexity: { time: "O(1) avg / O(n) worst", space: "O(1)" },
    },
  });

  const capacity = initialState.capacity;
  const hashResult = computeHash(key, capacity);
  const hash = hashResult.hash;

  // Step 0: Read key & value
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: {
      key,
      value,
      capacity,
      strategy: initialState.collisionStrategy,
    },
    state: initialState,
    highlightedElements: [],
    explanation: `Preparing to insert key "${key}" with value "${value}".`,
  });

  // Step 1: Compute hash
  builder.addStep({
    operation: "custom",
    codeLine: 2,
    variables: {
      key,
      value,
      computedHash: hash,
      capacity,
    },
    state: initialState,
    highlightedElements: [`bucket-${hash}`, `slot-${hash}`],
    explanation: `Computed hash for "${key}": ${hashResult.explanation}. Target bucket/slot index is ${hash}.`,
  });

  // SEPARATE CHAINING INSERTION
  if (initialState.collisionStrategy === "chaining") {
    const buckets = initialState.buckets || [];
    const currentBucket = buckets[hash] || { index: hash, entries: [] };
    const existingIndex = currentBucket.entries.findIndex((e) => e.key === key);

    // Step 2: Navigate to target bucket
    builder.addStep({
      operation: "select",
      codeLine: 3,
      variables: {
        key,
        bucketIndex: hash,
        chainLength: currentBucket.entries.length,
      },
      state: initialState,
      highlightedElements: [`bucket-${hash}`],
      explanation: `Navigating to bucket [${hash}]. It currently holds ${currentBucket.entries.length} chained entry/entries.`,
    });

    if (existingIndex >= 0) {
      // Key exists -> Update in place
      const existingEntry = currentBucket.entries[existingIndex];
      builder.addStep({
        operation: "compare",
        codeLine: 5,
        variables: {
          key,
          existingValue: existingEntry.value,
          newValue: value,
          match: true,
        },
        state: initialState,
        highlightedElements: [existingEntry.id],
        explanation: `Key "${key}" already exists in bucket [${hash}] with value "${existingEntry.value}". Updating value in-place to "${value}".`,
      });

      const updatedEntries = [...currentBucket.entries];
      updatedEntries[existingIndex] = {
        id: existingEntry.id, // Preserved ID
        key,
        value,
        hash,
      };

      const newBuckets = [...buckets];
      newBuckets[hash] = {
        index: hash,
        entries: Object.freeze(updatedEntries),
      };

      const finalState: HashTableState = Object.freeze({
        ...initialState,
        buckets: Object.freeze(newBuckets),
        activeKey: key,
        activeIndex: hash,
      });

      builder.addStep({
        operation: "update",
        codeLine: 6,
        variables: {
          key,
          updatedValue: value,
          bucketIndex: hash,
        },
        state: finalState,
        highlightedElements: [existingEntry.id],
        explanation: `Successfully updated value for key "${key}" to "${value}".`,
      });

      return builder.build();
    }

    // Key does not exist
    if (currentBucket.entries.length > 0) {
      // Collision detected!
      builder.addStep({
        operation: "custom",
        codeLine: 4,
        variables: {
          key,
          bucketIndex: hash,
          collision: true,
          existingKeys: currentBucket.entries.map((e) => e.key).join(", "),
        },
        state: initialState,
        highlightedElements: currentBucket.entries.map((e) => e.id),
        explanation: `COLLISION DETECTED at bucket [${hash}]! Bucket already contains ${currentBucket.entries.length} element(s). Separate chaining appends this new entry to the chain.`,
      });
    }

    // Append new entry
    const newEntry: HashEntry = {
      id: generateHashEntryId(key),
      key,
      value,
      hash,
    };

    const updatedEntries = [...currentBucket.entries, newEntry];
    const newBuckets = [...buckets];
    newBuckets[hash] = {
      index: hash,
      entries: Object.freeze(updatedEntries),
    };

    const newSize = initialState.size + 1;
    const finalState: HashTableState = Object.freeze({
      ...initialState,
      buckets: Object.freeze(newBuckets),
      size: newSize,
      loadFactor: Number((newSize / capacity).toFixed(2)),
      activeKey: key,
      activeIndex: hash,
    });

    builder.addStep({
      operation: "insert",
      codeLine: 8,
      variables: {
        key,
        value,
        bucketIndex: hash,
        newChainLength: updatedEntries.length,
        size: newSize,
        loadFactor: finalState.loadFactor,
      },
      state: finalState,
      highlightedElements: [newEntry.id, `bucket-${hash}`],
      explanation: `Inserted entry ["${key}": "${value}"] into bucket [${hash}]. Table size is now ${newSize} (load factor: ${finalState.loadFactor}).`,
    });

    return builder.build();
  }

  // OPEN ADDRESSING (Linear or Quadratic Probing)
  const slots = initialState.slots || [];
  const probeSequence: number[] = [];
  let firstDeletedIndex = -1;

  for (let i = 0; i < capacity; i++) {
    const offset = getProbeOffset(initialState.collisionStrategy, i);
    const slotIndex = (hash + offset) % capacity;
    probeSequence.push(slotIndex);
    const slot = slots[slotIndex];

    // Inspect slot
    builder.addStep({
      operation: "select",
      codeLine: 5,
      variables: {
        key,
        probe: i,
        offset,
        slotIndex,
        slotStatus: slot.status,
      },
      state: {
        ...initialState,
        probeSequence: Object.freeze([...probeSequence]),
      },
      highlightedElements: [`slot-${slotIndex}`],
      explanation:
        i === 0
          ? `Initial probe (i=0): Inspecting primary slot [${slotIndex}]. Status is ${slot.status.toUpperCase()}.`
          : `Probe step i=${i} (${initialState.collisionStrategy === "quadratic-probing" ? `i²=${offset}` : `i=${offset}`}): Inspecting slot [${slotIndex}]. Status is ${slot.status.toUpperCase()}.`,
    });

    // Check match for update
    if (slot.status === "occupied" && slot.entry?.key === key) {
      builder.addStep({
        operation: "compare",
        codeLine: 12,
        variables: {
          key,
          slotIndex,
          existingValue: slot.entry.value,
          newValue: value,
          match: true,
        },
        state: initialState,
        highlightedElements: [slot.entry.id, `slot-${slotIndex}`],
        explanation: `Key "${key}" matches existing entry in slot [${slotIndex}]. Updating value in-place.`,
      });

      const updatedSlots = [...slots];
      updatedSlots[slotIndex] = {
        index: slotIndex,
        status: "occupied",
        entry: {
          id: slot.entry.id,
          key,
          value,
          hash,
        },
      };

      const finalState: HashTableState = Object.freeze({
        ...initialState,
        slots: Object.freeze(updatedSlots),
        activeKey: key,
        activeIndex: slotIndex,
        probeSequence: Object.freeze([...probeSequence]),
      });

      builder.addStep({
        operation: "update",
        codeLine: 13,
        variables: {
          key,
          slotIndex,
          updatedValue: value,
        },
        state: finalState,
        highlightedElements: [slot.entry.id, `slot-${slotIndex}`],
        explanation: `Updated key "${key}" to "${value}" at slot [${slotIndex}].`,
      });

      return builder.build();
    }

    // Record first tombstone for potential insertion
    if (slot.status === "deleted" && firstDeletedIndex === -1) {
      firstDeletedIndex = slotIndex;
      builder.addStep({
        operation: "custom",
        codeLine: 10,
        variables: {
          firstDeletedIndex,
          probe: i,
        },
        state: initialState,
        highlightedElements: [`slot-${slotIndex}`],
        explanation: `Slot [${slotIndex}] is a TOMBSTONE (DELETED). Marking it as candidate slot for insertion while continuing search to ensure key does not exist further in probe sequence.`,
      });
      continue;
    }

    // Empty slot found -> Search stops, insert here or in first deleted
    if (slot.status === "empty") {
      const targetIndex = firstDeletedIndex !== -1 ? firstDeletedIndex : slotIndex;
      const wasTombstone = firstDeletedIndex !== -1;

      if (wasTombstone) {
        builder.addStep({
          operation: "select",
          codeLine: 7,
          variables: {
            targetIndex,
            reason: "reusing_tombstone",
          },
          state: initialState,
          highlightedElements: [`slot-${targetIndex}`],
          explanation: `Hit empty slot at [${slotIndex}]. We can now safely reuse previously passed tombstone slot [${targetIndex}] for insertion.`,
        });
      }

      const newEntry: HashEntry = {
        id: generateHashEntryId(key),
        key,
        value,
        hash,
      };

      const updatedSlots = [...slots];
      updatedSlots[targetIndex] = {
        index: targetIndex,
        status: "occupied",
        entry: newEntry,
      };

      const newSize = initialState.size + 1;
      const finalState: HashTableState = Object.freeze({
        ...initialState,
        slots: Object.freeze(updatedSlots),
        size: newSize,
        loadFactor: Number((newSize / capacity).toFixed(2)),
        activeKey: key,
        activeIndex: targetIndex,
        probeSequence: Object.freeze([...probeSequence]),
      });

      builder.addStep({
        operation: "insert",
        codeLine: 8,
        variables: {
          key,
          value,
          slotIndex: targetIndex,
          probesTaken: i + 1,
          size: newSize,
          loadFactor: finalState.loadFactor,
        },
        state: finalState,
        highlightedElements: [newEntry.id, `slot-${targetIndex}`],
        explanation: `Successfully inserted ["${key}": "${value}"] into slot [${targetIndex}] after ${i + 1} probe(s). Table size is now ${newSize} (load factor: ${finalState.loadFactor}).`,
      });

      return builder.build();
    }

    // Occupied by different key -> Collision!
    builder.addStep({
      operation: "custom",
      codeLine: 4,
      variables: {
        slotIndex,
        occupiedBy: slot.entry?.key,
        collision: true,
      },
      state: {
        ...initialState,
        probeSequence: Object.freeze([...probeSequence]),
      },
      highlightedElements: [`slot-${slotIndex}`],
      explanation: `COLLISION: Slot [${slotIndex}] is occupied by "${slot.entry?.key}". Probing next candidate position...`,
    });
  }

  // All slots probed without empty slot found
  if (firstDeletedIndex !== -1) {
    // We can use the tombstone slot
    const newEntry: HashEntry = {
      id: generateHashEntryId(key),
      key,
      value,
      hash,
    };

    const updatedSlots = [...slots];
    updatedSlots[firstDeletedIndex] = {
      index: firstDeletedIndex,
      status: "occupied",
      entry: newEntry,
    };

    const newSize = initialState.size + 1;
    const finalState: HashTableState = Object.freeze({
      ...initialState,
      slots: Object.freeze(updatedSlots),
      size: newSize,
      loadFactor: Number((newSize / capacity).toFixed(2)),
      activeKey: key,
      activeIndex: firstDeletedIndex,
      probeSequence: Object.freeze([...probeSequence]),
    });

    builder.addStep({
      operation: "insert",
      codeLine: 8,
      variables: {
        key,
        value,
        slotIndex: firstDeletedIndex,
        reusedTombstone: true,
      },
      state: finalState,
      highlightedElements: [newEntry.id, `slot-${firstDeletedIndex}`],
      explanation: `Inserted ["${key}": "${value}"] into tombstone slot [${firstDeletedIndex}]. Table size is now ${newSize}.`,
    });

    return builder.build();
  }

  // Table Overflow
  builder.addStep({
    operation: "custom",
    codeLine: 16,
    variables: {
      key,
      error: "Table Overflow",
      capacity,
    },
    state: initialState,
    highlightedElements: [],
    explanation: `Table Overflow: All ${capacity} slots in the hash table are fully occupied. Cannot insert key "${key}".`,
  });

  return builder.build();
}

/**
 * 2. SEARCH TRACE GENERATOR
 */
export function generateSearchTrace(
  initialState: HashTableState,
  rawKey: string
): ExecutionTrace<HashTableState> {
  const keyValidation = validateKey(rawKey);
  const key = keyValidation.isValid && keyValidation.data ? keyValidation.data : "Key";

  const builder = createExecutionTrace<HashTableState>({
    initialState,
    metadata: {
      algorithmId: "hash-table-search",
      algorithmName: "Hash Table Search",
      category: "Query",
      complexity: { time: "O(1) avg / O(n) worst", space: "O(1)" },
    },
  });

  const capacity = initialState.capacity;
  const hashResult = computeHash(key, capacity);
  const hash = hashResult.hash;

  // Step 0: Read key
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { key, capacity },
    state: initialState,
    highlightedElements: [],
    explanation: `Searching for key "${key}".`,
  });

  // Step 1: Compute hash
  builder.addStep({
    operation: "custom",
    codeLine: 2,
    variables: { key, hash, capacity },
    state: initialState,
    highlightedElements: [`bucket-${hash}`, `slot-${hash}`],
    explanation: `Computed hash for "${key}": ${hashResult.explanation}. Looking at index ${hash}.`,
  });

  // SEPARATE CHAINING SEARCH
  if (initialState.collisionStrategy === "chaining") {
    const buckets = initialState.buckets || [];
    const currentBucket = buckets[hash] || { index: hash, entries: [] };

    builder.addStep({
      operation: "select",
      codeLine: 3,
      variables: { key, bucketIndex: hash, entriesCount: currentBucket.entries.length },
      state: initialState,
      highlightedElements: [`bucket-${hash}`],
      explanation: `Inspecting bucket [${hash}]. It contains ${currentBucket.entries.length} entries.`,
    });

    if (currentBucket.entries.length === 0) {
      builder.addStep({
        operation: "return",
        codeLine: 7,
        variables: { key, found: false },
        state: initialState,
        highlightedElements: [`bucket-${hash}`],
        explanation: `Bucket [${hash}] is empty. Key "${key}" does not exist in the hash table.`,
      });
      return builder.build();
    }

    for (let i = 0; i < currentBucket.entries.length; i++) {
      const entry = currentBucket.entries[i];
      const match = entry.key === key;

      builder.addStep({
        operation: "compare",
        codeLine: 5,
        variables: {
          key,
          currentEntryKey: entry.key,
          currentEntryValue: entry.value,
          chainIndex: i,
          match,
        },
        state: initialState,
        highlightedElements: [entry.id],
        explanation: match
          ? `MATCH FOUND: Key "${entry.key}" matches search key "${key}"! Associated value is "${entry.value}".`
          : `Checking entry ${i + 1}/${currentBucket.entries.length}: "${entry.key}" does not match "${key}".`,
      });

      if (match) {
        builder.addStep({
          operation: "found",
          codeLine: 6,
          variables: { key, value: entry.value, found: true },
          state: initialState,
          highlightedElements: [entry.id],
          explanation: `Search successful! Found "${key}" with value "${entry.value}" in bucket [${hash}].`,
        });
        return builder.build();
      }
    }

    builder.addStep({
      operation: "return",
      codeLine: 7,
      variables: { key, found: false },
      state: initialState,
      highlightedElements: [`bucket-${hash}`],
      explanation: `Reached end of chain in bucket [${hash}]. Key "${key}" was not found in the hash table.`,
    });

    return builder.build();
  }

  // OPEN ADDRESSING SEARCH
  const slots = initialState.slots || [];
  const probeSequence: number[] = [];

  for (let i = 0; i < capacity; i++) {
    const offset = getProbeOffset(initialState.collisionStrategy, i);
    const slotIndex = (hash + offset) % capacity;
    probeSequence.push(slotIndex);
    const slot = slots[slotIndex];

    builder.addStep({
      operation: "select",
      codeLine: 4,
      variables: {
        key,
        probe: i,
        slotIndex,
        slotStatus: slot.status,
      },
      state: {
        ...initialState,
        probeSequence: Object.freeze([...probeSequence]),
      },
      highlightedElements: [`slot-${slotIndex}`],
      explanation: `Probe ${i}: Inspecting slot [${slotIndex}]. Status is ${slot.status.toUpperCase()}.`,
    });

    if (slot.status === "empty") {
      builder.addStep({
        operation: "return",
        codeLine: 6,
        variables: { key, slotIndex, found: false },
        state: {
          ...initialState,
          probeSequence: Object.freeze([...probeSequence]),
        },
        highlightedElements: [`slot-${slotIndex}`],
        explanation: `Slot [${slotIndex}] is EMPTY. In open addressing, an empty slot guarantees "${key}" was never inserted past this point. Search terminates: NOT FOUND.`,
      });
      return builder.build();
    }

    if (slot.status === "deleted") {
      builder.addStep({
        operation: "custom",
        codeLine: 4,
        variables: {
          key,
          slotIndex,
          isTombstone: true,
        },
        state: {
          ...initialState,
          probeSequence: Object.freeze([...probeSequence]),
        },
        highlightedElements: [`slot-${slotIndex}`],
        explanation: `Slot [${slotIndex}] is a TOMBSTONE (DELETED). Continuing probe sequence because "${key}" may have been placed further along before this slot was deleted.`,
      });
      continue;
    }

    if (slot.status === "occupied" && slot.entry) {
      const match = slot.entry.key === key;
      builder.addStep({
        operation: "compare",
        codeLine: 8,
        variables: {
          key,
          slotKey: slot.entry.key,
          slotValue: slot.entry.value,
          match,
        },
        state: {
          ...initialState,
          probeSequence: Object.freeze([...probeSequence]),
        },
        highlightedElements: [slot.entry.id, `slot-${slotIndex}`],
        explanation: match
          ? `MATCH FOUND! Slot [${slotIndex}] contains key "${key}" with value "${slot.entry.value}".`
          : `Slot [${slotIndex}] contains key "${slot.entry.key}", which does not match search target "${key}". Continuing probe.`,
      });

      if (match) {
        builder.addStep({
          operation: "found",
          codeLine: 9,
          variables: { key, value: slot.entry.value, found: true, slotIndex },
          state: {
            ...initialState,
            activeKey: key,
            activeIndex: slotIndex,
            probeSequence: Object.freeze([...probeSequence]),
          },
          highlightedElements: [slot.entry.id, `slot-${slotIndex}`],
          explanation: `Search successful! Found "${key}" at slot [${slotIndex}] with value "${slot.entry.value}".`,
        });
        return builder.build();
      }
    }
  }

  builder.addStep({
    operation: "return",
    codeLine: 11,
    variables: { key, found: false },
    state: {
      ...initialState,
      probeSequence: Object.freeze([...probeSequence]),
    },
    highlightedElements: [],
    explanation: `Probed all ${capacity} slots in table. Key "${key}" was not found in the hash table.`,
  });

  return builder.build();
}

/**
 * 3. UPDATE TRACE GENERATOR
 */
export function generateUpdateTrace(
  initialState: HashTableState,
  rawKey: string,
  rawNewValue: string
): ExecutionTrace<HashTableState> {
  const keyValidation = validateKey(rawKey);
  const valValidation = validateValue(rawNewValue);

  const key = keyValidation.isValid && keyValidation.data ? keyValidation.data : "Key";
  const newValue = valValidation.isValid && valValidation.data ? valValidation.data : "NewVal";

  const builder = createExecutionTrace<HashTableState>({
    initialState,
    metadata: {
      algorithmId: "hash-table-update",
      algorithmName: "Hash Table Update",
      category: "Mutation",
      complexity: { time: "O(1) avg / O(n) worst", space: "O(1)" },
    },
  });

  const capacity = initialState.capacity;
  const hashResult = computeHash(key, capacity);
  const hash = hashResult.hash;

  // Step 0: Read key & newValue
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { key, newValue, capacity },
    state: initialState,
    highlightedElements: [],
    explanation: `Preparing to update key "${key}" to new value "${newValue}".`,
  });

  // Step 1: Compute hash
  builder.addStep({
    operation: "custom",
    codeLine: 2,
    variables: { key, newValue, hash, capacity },
    state: initialState,
    highlightedElements: [`bucket-${hash}`, `slot-${hash}`],
    explanation: `Computed hash for "${key}": ${hashResult.explanation}. Checking index ${hash}.`,
  });

  if (initialState.collisionStrategy === "chaining") {
    const buckets = initialState.buckets || [];
    const currentBucket = buckets[hash] || { index: hash, entries: [] };
    const idx = currentBucket.entries.findIndex((e) => e.key === key);

    if (idx === -1) {
      builder.addStep({
        operation: "return",
        codeLine: 7,
        variables: { key, updated: false, error: "Key not found" },
        state: initialState,
        highlightedElements: [`bucket-${hash}`],
        explanation: `Update failed: Key "${key}" does not exist in bucket [${hash}]. Cannot update.`,
      });
      return builder.build();
    }

    const existing = currentBucket.entries[idx];
    builder.addStep({
      operation: "compare",
      codeLine: 4,
      variables: { key, oldValue: existing.value, newValue },
      state: initialState,
      highlightedElements: [existing.id],
      explanation: `Found key "${key}" with old value "${existing.value}". Preparing to overwrite with "${newValue}".`,
    });

    const updatedEntries = [...currentBucket.entries];
    updatedEntries[idx] = {
      id: existing.id, // Preserved ID
      key,
      value: newValue,
      hash,
    };

    const newBuckets = [...buckets];
    newBuckets[hash] = {
      index: hash,
      entries: Object.freeze(updatedEntries),
    };

    const finalState: HashTableState = Object.freeze({
      ...initialState,
      buckets: Object.freeze(newBuckets),
      activeKey: key,
      activeIndex: hash,
    });

    builder.addStep({
      operation: "update",
      codeLine: 5,
      variables: { key, oldValue: existing.value, newValue },
      state: finalState,
      highlightedElements: [existing.id],
      explanation: `Updated key "${key}" value from "${existing.value}" to "${newValue}".`,
    });

    return builder.build();
  }

  // Open Addressing Update
  const slots = initialState.slots || [];
  const probeSequence: number[] = [];

  for (let i = 0; i < capacity; i++) {
    const offset = getProbeOffset(initialState.collisionStrategy, i);
    const slotIndex = (hash + offset) % capacity;
    probeSequence.push(slotIndex);
    const slot = slots[slotIndex];

    if (slot.status === "empty") {
      builder.addStep({
        operation: "return",
        codeLine: 6,
        variables: { key, updated: false, error: "Key not found" },
        state: { ...initialState, probeSequence: Object.freeze([...probeSequence]) },
        highlightedElements: [`slot-${slotIndex}`],
        explanation: `Hit empty slot [${slotIndex}]. Key "${key}" does not exist in the hash table. Cannot update.`,
      });
      return builder.build();
    }

    if (slot.status === "occupied" && slot.entry?.key === key) {
      const existing = slot.entry;
      builder.addStep({
        operation: "compare",
        codeLine: 8,
        variables: { key, slotIndex, oldValue: existing.value, newValue },
        state: { ...initialState, probeSequence: Object.freeze([...probeSequence]) },
        highlightedElements: [existing.id, `slot-${slotIndex}`],
        explanation: `Located key "${key}" at slot [${slotIndex}] with value "${existing.value}". Overwriting with "${newValue}".`,
      });

      const updatedSlots = [...slots];
      updatedSlots[slotIndex] = {
        index: slotIndex,
        status: "occupied",
        entry: {
          id: existing.id,
          key,
          value: newValue,
          hash,
        },
      };

      const finalState: HashTableState = Object.freeze({
        ...initialState,
        slots: Object.freeze(updatedSlots),
        activeKey: key,
        activeIndex: slotIndex,
        probeSequence: Object.freeze([...probeSequence]),
      });

      builder.addStep({
        operation: "update",
        codeLine: 9,
        variables: { key, slotIndex, oldValue: existing.value, newValue },
        state: finalState,
        highlightedElements: [existing.id, `slot-${slotIndex}`],
        explanation: `Updated key "${key}" to "${newValue}" in slot [${slotIndex}].`,
      });

      return builder.build();
    }
  }

  builder.addStep({
    operation: "return",
    codeLine: 11,
    variables: { key, updated: false, error: "Key not found" },
    state: initialState,
    highlightedElements: [],
    explanation: `Probed all slots without finding key "${key}". Cannot update.`,
  });

  return builder.build();
}

/**
 * 4. DELETE TRACE GENERATOR
 */
export function generateDeleteTrace(
  initialState: HashTableState,
  rawKey: string
): ExecutionTrace<HashTableState> {
  const keyValidation = validateKey(rawKey);
  const key = keyValidation.isValid && keyValidation.data ? keyValidation.data : "Key";

  const builder = createExecutionTrace<HashTableState>({
    initialState,
    metadata: {
      algorithmId: "hash-table-delete",
      algorithmName: "Hash Table Delete",
      category: "Mutation",
      complexity: { time: "O(1) avg / O(n) worst", space: "O(1)" },
    },
  });

  const capacity = initialState.capacity;
  const hashResult = computeHash(key, capacity);
  const hash = hashResult.hash;

  // Step 0: Read key
  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: { key, capacity },
    state: initialState,
    highlightedElements: [],
    explanation: `Preparing to delete key "${key}".`,
  });

  // Step 1: Compute hash
  builder.addStep({
    operation: "custom",
    codeLine: 2,
    variables: { key, hash, capacity },
    state: initialState,
    highlightedElements: [`bucket-${hash}`, `slot-${hash}`],
    explanation: `Computed hash for "${key}": ${hashResult.explanation}. Target index is ${hash}.`,
  });

  // SEPARATE CHAINING DELETION
  if (initialState.collisionStrategy === "chaining") {
    const buckets = initialState.buckets || [];
    const currentBucket = buckets[hash] || { index: hash, entries: [] };
    const entryIdx = currentBucket.entries.findIndex((e) => e.key === key);

    if (entryIdx === -1) {
      builder.addStep({
        operation: "return",
        codeLine: 8,
        variables: { key, deleted: false },
        state: initialState,
        highlightedElements: [`bucket-${hash}`],
        explanation: `Key "${key}" not found in bucket [${hash}]. Nothing to delete.`,
      });
      return builder.build();
    }

    const targetEntry = currentBucket.entries[entryIdx];
    builder.addStep({
      operation: "select",
      codeLine: 4,
      variables: { key, bucketIndex: hash, value: targetEntry.value },
      state: initialState,
      highlightedElements: [targetEntry.id],
      explanation: `Found key "${key}" in bucket [${hash}]. Unlinking entry from chain.`,
    });

    const updatedEntries = currentBucket.entries.filter((_, idx) => idx !== entryIdx);
    const newBuckets = [...buckets];
    newBuckets[hash] = {
      index: hash,
      entries: Object.freeze(updatedEntries),
    };

    const newSize = Math.max(0, initialState.size - 1);
    const finalState: HashTableState = Object.freeze({
      ...initialState,
      buckets: Object.freeze(newBuckets),
      size: newSize,
      loadFactor: Number((newSize / capacity).toFixed(2)),
      activeKey: undefined,
      activeIndex: undefined,
    });

    builder.addStep({
      operation: "delete",
      codeLine: 6,
      variables: { key, size: newSize, loadFactor: finalState.loadFactor },
      state: finalState,
      highlightedElements: [`bucket-${hash}`],
      explanation: `Deleted key "${key}" from bucket [${hash}]. Table size is now ${newSize} (load factor: ${finalState.loadFactor}).`,
    });

    return builder.build();
  }

  // OPEN ADDRESSING DELETION (Tombstone Insertion)
  const slots = initialState.slots || [];
  const probeSequence: number[] = [];

  for (let i = 0; i < capacity; i++) {
    const offset = getProbeOffset(initialState.collisionStrategy, i);
    const slotIndex = (hash + offset) % capacity;
    probeSequence.push(slotIndex);
    const slot = slots[slotIndex];

    if (slot.status === "empty") {
      builder.addStep({
        operation: "return",
        codeLine: 6,
        variables: { key, slotIndex, deleted: false },
        state: { ...initialState, probeSequence: Object.freeze([...probeSequence]) },
        highlightedElements: [`slot-${slotIndex}`],
        explanation: `Hit empty slot [${slotIndex}]. Key "${key}" does not exist in table. Nothing to delete.`,
      });
      return builder.build();
    }

    if (slot.status === "occupied" && slot.entry?.key === key) {
      const targetEntry = slot.entry;
      builder.addStep({
        operation: "select",
        codeLine: 8,
        variables: { key, slotIndex, value: targetEntry.value },
        state: { ...initialState, probeSequence: Object.freeze([...probeSequence]) },
        highlightedElements: [targetEntry.id, `slot-${slotIndex}`],
        explanation: `Found target key "${key}" at slot [${slotIndex}]. Converting slot to TOMBSTONE (DELETED).`,
      });

      const updatedSlots = [...slots];
      updatedSlots[slotIndex] = {
        index: slotIndex,
        status: "deleted", // Tombstone!
        entry: null,
      };

      const newSize = Math.max(0, initialState.size - 1);
      const newTombstones = (initialState.tombstoneCount || 0) + 1;
      const finalState: HashTableState = Object.freeze({
        ...initialState,
        slots: Object.freeze(updatedSlots),
        size: newSize,
        loadFactor: Number((newSize / capacity).toFixed(2)),
        tombstoneCount: newTombstones,
        activeKey: undefined,
        activeIndex: undefined,
        probeSequence: Object.freeze([...probeSequence]),
      });

      builder.addStep({
        operation: "delete",
        codeLine: 9,
        variables: {
          key,
          slotIndex,
          size: newSize,
          tombstoneCount: newTombstones,
        },
        state: finalState,
        highlightedElements: [`slot-${slotIndex}`],
        explanation: `Slot [${slotIndex}] marked as DELETED (Tombstone). Why? Future searches must be able to probe through this slot without stopping early!`,
      });

      return builder.build();
    }
  }

  builder.addStep({
    operation: "return",
    codeLine: 13,
    variables: { key, deleted: false },
    state: initialState,
    highlightedElements: [],
    explanation: `Probed all slots without finding key "${key}". Nothing to delete.`,
  });

  return builder.build();
}

/**
 * 5. CONTAINS TRACE GENERATOR
 */
export function generateContainsTrace(
  initialState: HashTableState,
  rawKey: string
): ExecutionTrace<HashTableState> {
  const searchTrace = generateSearchTrace(initialState, rawKey);
  const steps = searchTrace.steps;
  const lastStep = steps[steps.length - 1];
  const found = Boolean(lastStep.variables.found);

  const builder = createExecutionTrace<HashTableState>({
    initialState,
    metadata: {
      algorithmId: "hash-table-contains",
      algorithmName: "Hash Table Contains",
      category: "Query",
      complexity: { time: "O(1) avg / O(n) worst", space: "O(1)" },
    },
  });

  // Replay search steps with contains context
  for (let i = 0; i < steps.length - 1; i++) {
    const s = steps[i];
    builder.addStep({
      operation: s.operation,
      codeLine: s.codeLine,
      variables: s.variables,
      state: s.state,
      highlightedElements: [...s.highlightedElements],
      explanation: s.explanation,
      metadata: s.metadata,
    });
  }

  // Final boolean result step
  builder.addStep({
    operation: found ? "found" : "return",
    codeLine: 3,
    variables: {
      key: rawKey,
      contains: found,
      result: found ? "TRUE" : "FALSE",
    },
    state: lastStep.state,
    highlightedElements: [...lastStep.highlightedElements],
    explanation: `contains("${rawKey}") → ${found ? "TRUE" : "FALSE"}. Key ${
      found ? "is present in the hash table." : "is NOT present in the hash table."
    }`,
  });

  return builder.build();
}

/**
 * 6. SIZE TRACE GENERATOR
 */
export function generateSizeTrace(initialState: HashTableState): ExecutionTrace<HashTableState> {
  const builder = createExecutionTrace<HashTableState>({
    initialState,
    metadata: {
      algorithmId: "hash-table-size",
      algorithmName: "Hash Table Size",
      category: "Inspection",
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: {
      size: initialState.size,
      capacity: initialState.capacity,
      loadFactor: initialState.loadFactor,
      strategy: initialState.collisionStrategy,
      tombstoneCount: initialState.tombstoneCount || 0,
    },
    state: initialState,
    highlightedElements: [],
    explanation: `Hash Table contains ${initialState.size} active element(s) with capacity ${initialState.capacity}. Current load factor: ${initialState.loadFactor}.`,
  });

  return builder.build();
}

/**
 * 7. CLEAR TRACE GENERATOR
 */
export function generateClearTrace(initialState: HashTableState): ExecutionTrace<HashTableState> {
  const builder = createExecutionTrace<HashTableState>({
    initialState,
    metadata: {
      algorithmId: "hash-table-clear",
      algorithmName: "Hash Table Clear",
      category: "Mutation",
      complexity: { time: "O(c)", space: "O(1)" },
    },
  });

  builder.addStep({
    operation: "custom",
    codeLine: 1,
    variables: {
      currentSize: initialState.size,
      capacity: initialState.capacity,
    },
    state: initialState,
    highlightedElements: [],
    explanation: `Preparing to clear all entries and reset the hash table.`,
  });

  const capacity = initialState.capacity;
  const clearedBuckets: HashBucket[] = Array.from({ length: capacity }, (_, i) => ({
    index: i,
    entries: [],
  }));

  const clearedSlots: OpenAddressSlot[] = Array.from({ length: capacity }, (_, i) => ({
    index: i,
    status: "empty",
    entry: null,
  }));

  const finalState: HashTableState = Object.freeze({
    capacity,
    size: 0,
    collisionStrategy: initialState.collisionStrategy,
    buckets: initialState.collisionStrategy === "chaining" ? Object.freeze(clearedBuckets) : undefined,
    slots: initialState.collisionStrategy !== "chaining" ? Object.freeze(clearedSlots) : undefined,
    loadFactor: 0,
    tombstoneCount: 0,
    activeKey: undefined,
    activeIndex: undefined,
    probeSequence: undefined,
  });

  builder.addStep({
    operation: "delete",
    codeLine: 3,
    variables: {
      size: 0,
      loadFactor: 0,
      tombstoneCount: 0,
    },
    state: finalState,
    highlightedElements: [],
    explanation: `All entries and tombstones have been cleared. Hash table is completely empty (size = 0).`,
  });

  return builder.build();
}
