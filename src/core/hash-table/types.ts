/**
 * Hash Table Domain Types & State Model
 *
 * Supports three collision resolution strategies:
 * 1. Separate Chaining (buckets with linked lists)
 * 2. Linear Probing (open addressing: index = (hash + i) % capacity)
 * 3. Quadratic Probing (open addressing: index = (hash + i * i) % capacity)
 */

export type CollisionStrategy = "chaining" | "linear-probing" | "quadratic-probing";

export type SlotStatus = "empty" | "occupied" | "deleted";

export interface HashEntry {
  readonly id: string; // Stable element identifier (e.g. "entry-Alice")
  readonly key: string;
  readonly value: string;
  readonly hash: number;
}

export interface HashBucket {
  readonly index: number;
  readonly entries: readonly HashEntry[];
}

export interface OpenAddressSlot {
  readonly index: number;
  readonly status: SlotStatus;
  readonly entry: HashEntry | null;
}

export interface HashTableState {
  readonly capacity: number;
  readonly size: number;
  readonly collisionStrategy: CollisionStrategy;
  readonly buckets?: readonly HashBucket[]; // Active when strategy === "chaining"
  readonly slots?: readonly OpenAddressSlot[]; // Active when strategy !== "chaining"
  readonly loadFactor: number;
  readonly lastOperation?: string;
  readonly activeKey?: string;
  readonly activeIndex?: number;
  readonly probeSequence?: readonly number[];
  readonly tombstoneCount?: number;
}

export type HashTableOperationType =
  | "insert"
  | "search"
  | "update"
  | "delete"
  | "contains"
  | "size"
  | "clear";

export interface OperationMetadata {
  readonly id: HashTableOperationType;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly timeComplexity: {
    readonly best: string;
    readonly average: string;
    readonly worst: string;
  };
  readonly spaceComplexity: string;
}

export const HASH_TABLE_OPERATIONS: readonly OperationMetadata[] = Object.freeze([
  {
    id: "insert",
    name: "Insert (key, value)",
    category: "Mutation",
    description: "Hashes key, navigates to bucket or probes slots, inserts entry or updates existing key.",
    timeComplexity: {
      best: "O(1)",
      average: "O(1)",
      worst: "O(n)",
    },
    spaceComplexity: "O(1)",
  },
  {
    id: "search",
    name: "Search (key)",
    category: "Query",
    description: "Computes key hash, locates bucket or probes sequence until key is found or empty slot hit.",
    timeComplexity: {
      best: "O(1)",
      average: "O(1)",
      worst: "O(n)",
    },
    spaceComplexity: "O(1)",
  },
  {
    id: "update",
    name: "Update (key, value)",
    category: "Mutation",
    description: "Finds key through hash/probing and modifies associated value in-place preserving entry ID.",
    timeComplexity: {
      best: "O(1)",
      average: "O(1)",
      worst: "O(n)",
    },
    spaceComplexity: "O(1)",
  },
  {
    id: "delete",
    name: "Delete (key)",
    category: "Mutation",
    description: "Removes entry from chain, or marks slot as deleted (tombstone) in open addressing.",
    timeComplexity: {
      best: "O(1)",
      average: "O(1)",
      worst: "O(n)",
    },
    spaceComplexity: "O(1)",
  },
  {
    id: "contains",
    name: "Contains (key)",
    category: "Query",
    description: "Checks boolean existence of key in the table without returning full payload.",
    timeComplexity: {
      best: "O(1)",
      average: "O(1)",
      worst: "O(n)",
    },
    spaceComplexity: "O(1)",
  },
  {
    id: "size",
    name: "Size & Load Factor",
    category: "Inspection",
    description: "Returns count of active stored entries and current load factor (size / capacity).",
    timeComplexity: {
      best: "O(1)",
      average: "O(1)",
      worst: "O(1)",
    },
    spaceComplexity: "O(1)",
  },
  {
    id: "clear",
    name: "Clear",
    category: "Mutation",
    description: "Resets all buckets, slots, and tombstones, returning table to completely empty state.",
    timeComplexity: {
      best: "O(c)",
      average: "O(c)",
      worst: "O(c)",
    },
    spaceComplexity: "O(1)",
  },
]);
