/**
 * Centralized DSA Content Registry
 *
 * Single source of truth for content identity, routes, metadata, and visualizer availability.
 * Invariant: Every route and card must resolve to its specific content item.
 * No route may universally fall back to Binary Search.
 */

import { DATA_STRUCTURES_CATALOG, ALGORITHMS_CATALOG, type DifficultyLevel } from "./dsa";

export type ContentType = "data-structure" | "algorithm" | "lesson" | "visualizer";

export interface DSAContent {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly type: ContentType;
  readonly category: string;
  readonly description: string;
  readonly route: string;
  readonly visualizerRoute: string;
  readonly lessonRoute: string;
  readonly practiceRoute?: string;
  readonly visualizerAvailable: boolean;
  readonly difficulty: DifficultyLevel;
  readonly timeComplexity?: string;
  readonly spaceComplexity?: string;
  readonly learningObjectives?: readonly string[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

// Build Data Structure Content Entries
const DATA_STRUCTURE_ENTRIES: DSAContent[] = DATA_STRUCTURES_CATALOG.map((ds) => ({
  id: ds.id,
  slug: ds.slug,
  title: ds.name,
  type: "data-structure",
  category: "Data Structures",
  description: ds.description,
  route: `/visualise/${ds.slug}`,
  visualizerRoute: `/visualise/${ds.slug}`,
  lessonRoute: `/theory/${ds.slug}`,
  practiceRoute: `/practice#${ds.slug}`,
  // Array, Linked List, Stack, Queue, Hash Table, Binary Tree, BST, Heap, and Priority Queue visualizers are fully implemented
  visualizerAvailable:
    ds.slug === "arrays" ||
    ds.slug === "linked-lists" ||
    ds.slug === "stack" ||
    ds.slug === "queue" ||
    ds.slug === "hash-table" ||
    ds.slug === "trees" ||
    ds.slug === "binary-tree" ||
    ds.slug === "bst" ||
    ds.slug === "heap" ||
    ds.slug === "priority-queue" ||
    ds.slug === "graphs" ||
    ds.slug === "graph",
  difficulty: ds.difficulty,
  timeComplexity: ds.accessTime,
  spaceComplexity: "O(n)",
  learningObjectives: [
    `Understand memory representation and pointer mechanics of ${ds.name}`,
    `Analyze time complexity for access, search, insertion, and deletion`,
    `Observe real-time operations visually with synchronized code and variables`,
  ],
  metadata: {
    tagline: ds.tagline,
    visualType: ds.visualType,
    accessTime: ds.accessTime,
    searchTime: ds.searchTime,
    insertTime: ds.insertTime,
    deleteTime: ds.deleteTime,
  },
}));

// Build Algorithm Content Entries
const ALGORITHM_ENTRIES: DSAContent[] = ALGORITHMS_CATALOG.map((algo) => ({
  id: algo.id,
  slug: algo.slug,
  title: algo.name,
  type: "algorithm",
  category: algo.category,
  description: algo.description,
  route: `/visualise/${algo.slug}`,
  visualizerRoute: `/visualise/${algo.slug}`,
  lessonRoute: `/theory/${algo.slug}`,
  practiceRoute: `/practice#${algo.slug}`,
  visualizerAvailable:
    algo.slug === "binary-search" ||
    algo.slug === "linear-search" ||
    algo.slug === "bubble-sort" ||
    algo.slug === "selection-sort" ||
    algo.slug === "insertion-sort" ||
    algo.slug === "merge-sort" ||
    algo.slug === "quick-sort" ||
    algo.slug === "bfs" ||
    algo.slug === "dfs" ||
    algo.slug === "dijkstra" ||
    algo.slug === "bellman-ford" ||
    algo.slug === "prim" ||
    algo.slug === "kruskal" ||
    algo.slug === "topological-sort" ||
    algo.slug === "recursion" ||
    algo.slug === "dp",
  difficulty: algo.difficulty,
  timeComplexity: algo.timeComplexity,
  spaceComplexity: algo.spaceComplexity,
  learningObjectives: [
    `Master the core invariant and execution flow of ${algo.name}`,
    `Observe step-by-step code line execution and variable state mutations`,
    `Understand edge cases, termination criteria, and asymptotic complexities`,
  ],
  metadata: {
    category: algo.category,
  },
}));

// Canonical Content Registry
export const CONTENT_REGISTRY: readonly DSAContent[] = Object.freeze([
  ...DATA_STRUCTURE_ENTRIES,
  ...ALGORITHM_ENTRIES,
]);

// Slug alias lookup to support singular/plural and variations gracefully
const SLUG_ALIASES: Record<string, string> = {
  // Data structure aliases
  array: "arrays",
  "linked-list": "linked-lists",
  stacks: "stack",
  queues: "queue",
  "hash-tables": "hash-table",
  tree: "binary-tree",
  trees: "binary-tree",
  "binary-tree": "binary-tree",
  "binary-search-tree": "bst",
  bst: "bst",
  heaps: "heap",
  "min-heap": "heap",
  "max-heap": "heap",
  "priority-queues": "priority-queue",
  pq: "priority-queue",
  graph: "graphs",
  tries: "trie",

  // Algorithm aliases
  "linear-search": "linear-search",
  "binary-search": "binary-search",
  "bubble-sort": "bubble-sort",
  "selection-sort": "selection-sort",
  "insertion-sort": "insertion-sort",
  "merge-sort": "merge-sort",
  "quick-sort": "quick-sort",
  bfs: "bfs",
  dfs: "dfs",
  dijkstra: "dijkstra",
  "bellman-ford": "bellman-ford",
  prim: "prim",
  kruskal: "kruskal",
  "topological-sort": "topological-sort",
  "topo-sort": "topological-sort",
  recursion: "recursion",
  dp: "dp",
};

/**
 * Resolves canonical content item by slug or alias.
 * Returns undefined if slug is not registered.
 */
export function getContentBySlug(slug: string): DSAContent | undefined {
  if (!slug || typeof slug !== "string") return undefined;

  const normalized = slug.trim().toLowerCase();
  const canonicalSlug = SLUG_ALIASES[normalized] || normalized;

  return CONTENT_REGISTRY.find((item) => item.slug === canonicalSlug || item.id === canonicalSlug);
}

/**
 * Retrieves all registered content items.
 */
export function getAllContent(): readonly DSAContent[] {
  return CONTENT_REGISTRY;
}

/**
 * Filters registered content by type.
 */
export function getContentByType(type: ContentType): readonly DSAContent[] {
  return CONTENT_REGISTRY.filter((item) => item.type === type);
}

/**
 * Returns all canonical slugs for static param generation.
 */
export function getAllContentSlugs(): readonly string[] {
  return Array.from(new Set(CONTENT_REGISTRY.map((item) => item.slug)));
}

/**
 * Validates if a slug exists in the registry.
 */
export function isValidSlug(slug: string): boolean {
  return getContentBySlug(slug) !== undefined;
}
