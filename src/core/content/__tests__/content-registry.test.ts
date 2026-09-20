import { describe, it, expect } from "vitest";
import {
  getContentBySlug,
  getAllContentSlugs,
  isValidSlug,
  CONTENT_REGISTRY,
} from "@/config/content-registry";

describe("DSA Content Registry", () => {
  it("should contain all foundational DSA topics in the registry", () => {
    const requiredTopics = [
      "arrays",
      "linked-lists",
      "stack",
      "queue",
      "hash-table",
      "trees",
      "graphs",
      "binary-search",
      "bubble-sort",
      "merge-sort",
      "quick-sort",
      "bfs",
      "dfs",
    ];

    const allSlugs = getAllContentSlugs();
    for (const topic of requiredTopics) {
      expect(allSlugs).toContain(topic);
      expect(isValidSlug(topic)).toBe(true);
    }
  });

  it("should return accurate content metadata for individual data structures", () => {
    const arrays = getContentBySlug("arrays");
    expect(arrays).toBeDefined();
    expect(arrays?.slug).toBe("arrays");
    expect(arrays?.title).toBe("Arrays");
    expect(arrays?.type).toBe("data-structure");
    expect(arrays?.visualizerAvailable).toBe(true); // Implemented in Prompt 7

    const linkedLists = getContentBySlug("linked-lists");
    expect(linkedLists).toBeDefined();
    expect(linkedLists?.slug).toBe("linked-lists");
    expect(linkedLists?.title).toBe("Linked Lists");
    expect(linkedLists?.type).toBe("data-structure");
    expect(linkedLists?.visualizerAvailable).toBe(true); // Implemented in Prompt 8

    const stack = getContentBySlug("stack");
    expect(stack).toBeDefined();
    expect(stack?.slug).toBe("stack");
    expect(stack?.title).toBe("Stacks");
    expect(stack?.type).toBe("data-structure");
    expect(stack?.visualizerAvailable).toBe(true); // Implemented in Prompt 9

    const queue = getContentBySlug("queue");
    expect(queue).toBeDefined();
    expect(queue?.slug).toBe("queue");
    expect(queue?.title).toBe("Queues");
    expect(queue?.type).toBe("data-structure");
    expect(queue?.visualizerAvailable).toBe(true); // Implemented in Prompt 9

    const hashTable = getContentBySlug("hash-table");
    expect(hashTable).toBeDefined();
    expect(hashTable?.slug).toBe("hash-table");
    expect(hashTable?.title).toBe("Hash Tables");
    expect(hashTable?.type).toBe("data-structure");
    expect(hashTable?.visualizerAvailable).toBe(true); // Implemented in Prompt 10

    const binaryTree = getContentBySlug("binary-tree");
    expect(binaryTree).toBeDefined();
    expect(binaryTree?.slug).toBe("binary-tree");
    expect(binaryTree?.title).toBe("Binary Tree");
    expect(binaryTree?.type).toBe("data-structure");
    expect(binaryTree?.visualizerAvailable).toBe(true); // Implemented in Prompt 11

    const bst = getContentBySlug("bst");
    expect(bst).toBeDefined();
    expect(bst?.slug).toBe("bst");
    expect(bst?.title).toBe("Binary Search Tree (BST)");
    expect(bst?.type).toBe("data-structure");
    expect(bst?.visualizerAvailable).toBe(true); // Implemented in Prompt 11

    const heap = getContentBySlug("heap");
    expect(heap).toBeDefined();
    expect(heap?.slug).toBe("heap");
    expect(heap?.title).toBe("Heaps");
    expect(heap?.type).toBe("data-structure");
    expect(heap?.visualizerAvailable).toBe(true); // Implemented in Prompt 12

    const priorityQueue = getContentBySlug("priority-queue");
    expect(priorityQueue).toBeDefined();
    expect(priorityQueue?.slug).toBe("priority-queue");
    expect(priorityQueue?.title).toBe("Priority Queue");
    expect(priorityQueue?.type).toBe("data-structure");
    expect(priorityQueue?.visualizerAvailable).toBe(true); // Implemented in Prompt 12
  });

  it("should return accurate content metadata for algorithms", () => {
    const bfs = getContentBySlug("bfs");
    expect(bfs).toBeDefined();
    expect(bfs?.slug).toBe("bfs");
    expect(bfs?.title).toBe("Breadth-First Search (BFS)");
    expect(bfs?.type).toBe("algorithm");
    expect(bfs?.visualizerAvailable).toBe(true); // Implemented

    const greedy = getContentBySlug("greedy");
    expect(greedy?.visualizerAvailable).toBe(false);

    const binarySearch = getContentBySlug("binary-search");
    expect(binarySearch).toBeDefined();
    expect(binarySearch?.slug).toBe("binary-search");
    expect(binarySearch?.title).toBe("Binary Search");
    expect(binarySearch?.type).toBe("algorithm");
    expect(binarySearch?.visualizerAvailable).toBe(true); // Implemented foundation
  });

  it("should correctly resolve common aliases without defaulting to binary search", () => {
    expect(getContentBySlug("array")?.slug).toBe("arrays");
    expect(getContentBySlug("linked-list")?.slug).toBe("linked-lists");
    expect(getContentBySlug("stacks")?.slug).toBe("stack");
    expect(getContentBySlug("queues")?.slug).toBe("queue");
    expect(getContentBySlug("graph")?.slug).toBe("graphs");
    expect(getContentBySlug("trees")?.slug).toBe("binary-tree");
    expect(getContentBySlug("binary-tree")?.slug).toBe("binary-tree");
    expect(getContentBySlug("bst")?.slug).toBe("bst");
    expect(getContentBySlug("binary-search-tree")?.slug).toBe("bst");
    expect(getContentBySlug("heaps")?.slug).toBe("heap");
    expect(getContentBySlug("min-heap")?.slug).toBe("heap");
    expect(getContentBySlug("max-heap")?.slug).toBe("heap");
    expect(getContentBySlug("priority-queues")?.slug).toBe("priority-queue");
    expect(getContentBySlug("pq")?.slug).toBe("priority-queue");
  });

  it("should return undefined for completely unknown slugs", () => {
    expect(getContentBySlug("non-existent-algo-123")).toBeUndefined();
    expect(isValidSlug("non-existent-algo-123")).toBe(false);
  });

  describe("CRITICAL REGRESSION INVARIANT: No Universal Binary Search Fallback", () => {
    const testCases = [
      { slug: "arrays", expectedTitle: "Arrays" },
      { slug: "linked-lists", expectedTitle: "Linked Lists" },
      { slug: "stack", expectedTitle: "Stacks" },
      { slug: "queue", expectedTitle: "Queues" },
      { slug: "hash-table", expectedTitle: "Hash Tables" },
      { slug: "graphs", expectedTitle: "Graphs" },
      { slug: "bfs", expectedTitle: "Breadth-First Search (BFS)" },
      { slug: "dfs", expectedTitle: "Depth-First Search (DFS)" },
      { slug: "bubble-sort", expectedTitle: "Bubble Sort" },
      { slug: "merge-sort", expectedTitle: "Merge Sort" },
      { slug: "quick-sort", expectedTitle: "Quick Sort" },
    ];

    for (const { slug, expectedTitle } of testCases) {
      it(`slug '${slug}' MUST resolve to its own topic ('${expectedTitle}') and NEVER to Binary Search`, () => {
        const content = getContentBySlug(slug);
        expect(content).toBeDefined();
        expect(content?.slug).not.toBe("binary-search");
        expect(content?.title).toBe(expectedTitle);
        expect(content?.slug).toBe(slug);
      });
    }

    it("ONLY binary-search slug resolves to Binary Search", () => {
      const binarySearch = getContentBySlug("binary-search");
      expect(binarySearch?.slug).toBe("binary-search");
      expect(binarySearch?.title).toBe("Binary Search");

      // Verify no other entry in CONTENT_REGISTRY claims to be binary-search
      for (const item of CONTENT_REGISTRY) {
        if (item.slug !== "binary-search") {
          expect(item.slug).not.toBe("binary-search");
          expect(item.title).not.toBe("Binary Search");
        }
      }
    });
  });
});
