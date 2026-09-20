/**
 * Comprehensive DSA Theory Repository
 *
 * Provides standardized 13-point theory articles for all Data Structures & Algorithms.
 */

export interface TheorySection {
  readonly title: string;
  readonly content: string;
}

export interface DetailedTheoryTopic {
  readonly slug: string;
  readonly title: string;
  readonly category: string;
  readonly difficulty: string;
  readonly visualizerSlug: string;
  readonly summary: string;
  readonly complexities: {
    readonly timeBest: string;
    readonly timeAvg: string;
    readonly timeWorst: string;
    readonly space: string;
  };
  readonly sections: readonly TheorySection[];
}

export const THEORY_DATABASE: Record<string, DetailedTheoryTopic> = {
  arrays: {
    slug: "arrays",
    title: "Arrays",
    category: "Data Structures",
    difficulty: "Easy",
    visualizerSlug: "arrays",
    summary: "Contiguous block of fixed-size elements offering O(1) random access by index.",
    complexities: {
      timeBest: "O(1) Access",
      timeAvg: "O(n) Search / Insert / Delete",
      timeWorst: "O(n) Shift",
      space: "O(n)",
    },
    sections: [
      {
        title: "1. Overview & Definition",
        content: "An array is a linear data structure that stores elements of identical type in contiguous memory locations. Indexing is zero-based in most modern languages.",
      },
      {
        title: "2. Why Use Arrays?",
        content: "Arrays provide instantaneous O(1) random access given an index due to direct memory offset calculation: Address(arr[i]) = BaseAddress + i * sizeof(Element).",
      },
      {
        title: "3. Core Invariant",
        content: "Contiguous memory layout ensures optimal CPU cache spatial locality, maximizing memory bus throughput during sequential reads.",
      },
      {
        title: "4. Memory Representation",
        content: "Sequential memory addresses allocated upfront in the stack or heap without pointer indirection overhead.",
      },
      {
        title: "5. Fundamental Operations",
        content: "Access: O(1). Append at end (Dynamic array): O(1) amortized. Insert/Delete at arbitrary index: O(n) because subsequent elements must be shifted.",
      },
      {
        title: "6. Asymptotic Complexity",
        content: "Access: O(1). Search: O(n) unsorted, O(log n) sorted with Binary Search. Insertion: O(n). Deletion: O(n). Space: O(n).",
      },
      {
        title: "7. Key Advantages",
        content: "Constant-time indexing, minimal per-element memory overhead (no pointers), cache friendly.",
      },
      {
        title: "8. Limitations & Tradeoffs",
        content: "Fixed size in static implementations; expensive insertions and deletions requiring memory shifts.",
      },
      {
        title: "9. Common Pitfalls",
        content: "Off-by-one errors (accessing arr[n] instead of arr[n-1]), buffer overflows, and unawareness of dynamic array resizing costs.",
      },
      {
        title: "10. When to Use vs Not Use",
        content: "Use when element count is predictable and random access by index is frequent. Avoid when frequent insertions and deletions occur in the middle.",
      },
      {
        title: "11. Interview & Problem Patterns",
        content: "Two Pointers, Sliding Window, Prefix Sums, Kadane's Algorithm, In-place array transformations.",
      },
    ],
  },
  "linked-lists": {
    slug: "linked-lists",
    title: "Linked Lists",
    category: "Data Structures",
    difficulty: "Medium",
    visualizerSlug: "linked-lists",
    summary: "Chain of independently allocated nodes linked by reference pointers.",
    complexities: {
      timeBest: "O(1) Prepend/Append",
      timeAvg: "O(n) Search / Access",
      timeWorst: "O(n) Traversal",
      space: "O(n)",
    },
    sections: [
      {
        title: "1. Overview & Definition",
        content: "A Linked List consists of separate nodes where each node encapsulates data and a reference (pointer) to the next (and optionally previous) node.",
      },
      {
        title: "2. Why Use Linked Lists?",
        content: "Enables constant time O(1) node insertion and deletion at known positions (like head or tail) without reorganizing adjacent memory.",
      },
      {
        title: "3. Core Invariants",
        content: "Dynamic sizing without preallocation. Traversal is strictly sequential from head pointer.",
      },
      {
        title: "4. Memory Representation",
        content: "Scattered heap allocations connected via 32/64-bit address pointers. Higher per-node memory overhead than arrays.",
      },
      {
        title: "5. Asymptotic Complexity",
        content: "Access: O(n). Search: O(n). Insert at Head: O(1). Delete at Head: O(1). Insert/Delete at arbitrary position: O(n) traversal + O(1) pointer swap.",
      },
      {
        title: "6. Common Pitfalls",
        content: "Losing pointer references resulting in memory leaks or orphan sublists, dangling pointers, null-pointer dereferences on empty lists.",
      },
      {
        title: "7. Key Patterns",
        content: "Fast and Slow Pointers (Floyd's Cycle Detection), In-place reversal, Dummy head node technique.",
      },
    ],
  },
  stack: {
    slug: "stack",
    title: "Stack",
    category: "Data Structures",
    difficulty: "Easy",
    visualizerSlug: "stack",
    summary: "Last-In, First-Out (LIFO) abstract data type with strict push and pop operations.",
    complexities: {
      timeBest: "O(1) Push/Pop",
      timeAvg: "O(1) Push/Pop",
      timeWorst: "O(1) Push/Pop",
      space: "O(n)",
    },
    sections: [
      {
        title: "1. Overview & Definition",
        content: "A Stack is a restricted linear data container operating strictly under Last-In First-Out (LIFO) discipline. Elements can only be added or removed from the top.",
      },
      {
        title: "2. Core Operations",
        content: "push(x): Adds x to top. pop(): Removes and returns top. peek(): Inspects top without removal. isEmpty(): Checks if stack has elements.",
      },
      {
        title: "3. Real-World Applications",
        content: "Call stack activation records, Undo/Redo mechanisms, Expression parsing (postfix/prefix), Syntax validator (balanced parentheses).",
      },
    ],
  },
  queue: {
    slug: "queue",
    title: "Queue",
    category: "Data Structures",
    difficulty: "Easy",
    visualizerSlug: "queue",
    summary: "First-In, First-Out (FIFO) linear buffer ensuring fair order of processing.",
    complexities: {
      timeBest: "O(1) Enqueue/Dequeue",
      timeAvg: "O(1) Enqueue/Dequeue",
      timeWorst: "O(1) Enqueue/Dequeue",
      space: "O(n)",
    },
    sections: [
      {
        title: "1. Overview & Definition",
        content: "A Queue is a linear collection adhering to First-In First-Out (FIFO) order. Insertions occur at the rear (tail) and deletions occur at the front (head).",
      },
      {
        title: "2. Variants",
        content: "Linear Queue, Circular Ring Buffer (avoids false overflow), Double-Ended Queue (Deque), Priority Queue.",
      },
      {
        title: "3. Real-World Applications",
        content: "Breadth-First Search (BFS), asynchronous task schedulers, print job queues, web server request rate limiting.",
      },
    ],
  },
  "hash-table": {
    slug: "hash-table",
    title: "Hash Tables",
    category: "Data Structures",
    difficulty: "Medium",
    visualizerSlug: "hash-table",
    summary: "Associative key-value store using hash functions for expected O(1) lookups.",
    complexities: {
      timeBest: "O(1) Get/Put",
      timeAvg: "O(1) Get/Put",
      timeWorst: "O(n) Collisions",
      space: "O(n)",
    },
    sections: [
      {
        title: "1. Overview & Definition",
        content: "A Hash Table maps arbitrary keys to bucket indices using a hash function, providing average O(1) insertion, retrieval, and deletion.",
      },
      {
        title: "2. Collision Resolution",
        content: "Separate Chaining (linked lists or balanced trees per bucket) vs Open Addressing (Linear Probing, Quadratic Probing, Double Hashing).",
      },
      {
        title: "3. Load Factor & Resizing",
        content: "Load Factor α = n / k. When α exceeds a threshold (typically 0.75), the internal bucket array doubles in size and all keys are rehashed.",
      },
    ],
  },
  "binary-tree": {
    slug: "binary-tree",
    title: "Binary Tree",
    category: "Data Structures",
    difficulty: "Medium",
    visualizerSlug: "binary-tree",
    summary: "Hierarchical non-linear tree where each node has at most two children (left and right).",
    complexities: {
      timeBest: "O(1) Access root",
      timeAvg: "O(n) Traversal",
      timeWorst: "O(n) Degenerate",
      space: "O(h) stack",
    },
    sections: [
      {
        title: "1. Overview",
        content: "A binary tree is a hierarchical structure where each node contains data and references to left and right child nodes.",
      },
      {
        title: "2. Traversals",
        content: "Depth-First: Preorder (Root, L, R), Inorder (L, Root, R), Postorder (L, R, Root). Breadth-First: Level Order traversal via FIFO queue.",
      },
    ],
  },
  bst: {
    slug: "bst",
    title: "Binary Search Tree (BST)",
    category: "Data Structures",
    difficulty: "Medium",
    visualizerSlug: "bst",
    summary: "Sorted binary tree maintaining key invariant: left < node < right for logarithmic searches.",
    complexities: {
      timeBest: "O(log n)",
      timeAvg: "O(log n)",
      timeWorst: "O(n) Skewed",
      space: "O(n)",
    },
    sections: [
      {
        title: "1. BST Invariant",
        content: "For any node X: all keys in left subtree < X.val, and all keys in right subtree > X.val. An inorder traversal produces elements in strictly ascending sorted order.",
      },
      {
        title: "2. Operations",
        content: "Search, Insert, and Delete operate in O(h) where h is the tree height. In balanced trees, h = O(log n); in worst-case degenerate trees, h = O(n).",
      },
    ],
  },
  heap: {
    slug: "heap",
    title: "Binary Heaps",
    category: "Data Structures",
    difficulty: "Medium",
    visualizerSlug: "heap",
    summary: "Complete binary tree satisfying the heap-order property for O(1) extremum access.",
    complexities: {
      timeBest: "O(1) Peek",
      timeAvg: "O(log n) Insert/Extract",
      timeWorst: "O(log n)",
      space: "O(n)",
    },
    sections: [
      {
        title: "1. Overview",
        content: "A Heap is a complete binary tree stored compactly in a flat array where parent-child relationships are calculated via index arithmetic: parent(i) = ⌊(i-1)/2⌋, left(i) = 2i+1, right(i) = 2i+2.",
      },
      {
        title: "2. Invariant",
        content: "Min-Heap: Every parent node is <= its children. Max-Heap: Every parent node is >= its children.",
      },
      {
        title: "3. Heapify & Sift",
        content: "Insert: append to end and sift-up in O(log n). Extract Min/Max: swap root with last element, pop last, and sift-down in O(log n). Build-Heap: O(n) bottom-up heapification.",
      },
    ],
  },
  graphs: {
    slug: "graphs",
    title: "Graphs",
    category: "Data Structures",
    difficulty: "Hard",
    visualizerSlug: "graphs",
    summary: "Non-linear network of vertices connected by directed or undirected, weighted or unweighted edges.",
    complexities: {
      timeBest: "O(1) Edge Lookup (Matrix)",
      timeAvg: "O(V + E) Traversals",
      timeWorst: "O(V²)",
      space: "O(V + E) List / O(V²) Matrix",
    },
    sections: [
      {
        title: "1. Overview",
        content: "A Graph G = (V, E) is composed of a set of vertices V and edges E connecting pairs of vertices.",
      },
      {
        title: "2. Representations",
        content: "Adjacency Matrix (dense graphs, O(1) edge queries, O(V²) space) vs Adjacency List (sparse graphs, O(deg(u)) queries, O(V + E) space).",
      },
      {
        title: "3. Core Algorithms",
        content: "BFS (shortest path unweighted), DFS (connected components, cycles, topological sort), Dijkstra (non-negative weighted paths), Prim & Kruskal (MST).",
      },
    ],
  },
  "binary-search": {
    slug: "binary-search",
    title: "Binary Search",
    category: "Searching",
    difficulty: "Easy",
    visualizerSlug: "binary-search",
    summary: "Logarithmic divide-and-conquer search on sorted collections.",
    complexities: {
      timeBest: "O(1)",
      timeAvg: "O(log n)",
      timeWorst: "O(log n)",
      space: "O(1) iterative",
    },
    sections: [
      {
        title: "1. Overview & Invariant",
        content: "Binary Search halves the search space at each comparison by checking the midpoint element. Requires a sorted collection.",
      },
      {
        title: "2. Step-by-Step Execution",
        content: "1. Calculate mid = low + ⌊(high - low) / 2⌋. 2. If arr[mid] == target, return mid. 3. If arr[mid] < target, low = mid + 1. 4. Else high = mid - 1.",
      },
      {
        title: "3. Common Bugs",
        content: "Integer overflow in `(low + high) / 2` when values exceed 2^31 - 1 (use `low + (high - low) / 2`), loop condition `<` vs `<=`, infinite loops due to boundary updates.",
      },
    ],
  },
  "bubble-sort": {
    slug: "bubble-sort",
    title: "Bubble Sort",
    category: "Sorting",
    difficulty: "Easy",
    visualizerSlug: "bubble-sort",
    summary: "Simple comparison sort repeatedly swapping adjacent misplaced pairs.",
    complexities: {
      timeBest: "O(n) with swapped flag",
      timeAvg: "O(n²)",
      timeWorst: "O(n²)",
      space: "O(1)",
    },
    sections: [
      {
        title: "1. How it Works",
        content: "Passes through the array comparing arr[j] and arr[j+1]. If out of order, swaps them. After i passes, the i largest elements have bubbled up to their final positions.",
      },
      {
        title: "2. Stability & In-place",
        content: "Bubble Sort is a stable sorting algorithm (equal elements retain their relative order) and operates in-place using O(1) auxiliary space.",
      },
    ],
  },
  "quick-sort": {
    slug: "quick-sort",
    title: "Quick Sort",
    category: "Sorting",
    difficulty: "Medium",
    visualizerSlug: "quick-sort",
    summary: "Efficient divide-and-conquer partition sort widely used in standard libraries.",
    complexities: {
      timeBest: "O(n log n)",
      timeAvg: "O(n log n)",
      timeWorst: "O(n²) Skewed pivots",
      space: "O(log n) call stack",
    },
    sections: [
      {
        title: "1. Divide and Conquer",
        content: "Picks a pivot element and partitions the array so all elements <= pivot are to its left, and all elements > pivot are to its right. Recursively sorts subarrays.",
      },
      {
        title: "2. Pivot Selection",
        content: "Randomized pivot selection or Median-of-Three prevents the O(n²) worst-case on already sorted inputs.",
      },
    ],
  },
  "merge-sort": {
    slug: "merge-sort",
    title: "Merge Sort",
    category: "Sorting",
    difficulty: "Medium",
    visualizerSlug: "merge-sort",
    summary: "Guaranteed O(n log n) stable divide-and-conquer sorting algorithm.",
    complexities: {
      timeBest: "O(n log n)",
      timeAvg: "O(n log n)",
      timeWorst: "O(n log n)",
      space: "O(n)",
    },
    sections: [
      {
        title: "1. Overview",
        content: "Divides the array into two halves, recursively sorts each half, and merges the two sorted halves back together in linear time.",
      },
      {
        title: "2. Stability",
        content: "Merge Sort is completely stable and guarantees O(n log n) even in the worst case, making it ideal for linked lists and external disk sorting.",
      },
    ],
  },
  recursion: {
    slug: "recursion",
    title: "Recursion & Call Stack",
    category: "Recursion",
    difficulty: "Medium",
    visualizerSlug: "recursion",
    summary: "Problem-solving technique decomposing problems into identical self-similar subproblems.",
    complexities: {
      timeBest: "O(1) Base Case",
      timeAvg: "O(n) or O(2ⁿ)",
      timeWorst: "O(2ⁿ)",
      space: "O(d) stack frames",
    },
    sections: [
      {
        title: "1. Anatomy of Recursion",
        content: "Every valid recursive function requires: 1. Base case(s) that terminate without calling itself. 2. Recursive step reducing the problem state toward the base case.",
      },
      {
        title: "2. The Call Stack",
        content: "Each recursive call allocates a stack frame storing arguments, local variables, and the return address. When returning, frames pop in LIFO order.",
      },
      {
        title: "3. Stack Overflow",
        content: "Occurs when recursion depth exceeds the OS or runtime stack limit due to missing or unreachable base cases.",
      },
    ],
  },
  dp: {
    slug: "dp",
    title: "Dynamic Programming",
    category: "Dynamic Programming",
    difficulty: "Hard",
    visualizerSlug: "dp",
    summary: "Optimization method breaking problems into overlapping subproblems with optimal substructure.",
    complexities: {
      timeBest: "O(states · transitions)",
      timeAvg: "O(states · transitions)",
      timeWorst: "O(states · transitions)",
      space: "O(states)",
    },
    sections: [
      {
        title: "1. Two Core Prerequisites",
        content: "1. Overlapping Subproblems: The same smaller subproblems are solved repeatedly. 2. Optimal Substructure: The optimal solution to the problem contains optimal solutions to its subproblems.",
      },
      {
        title: "2. Top-Down vs Bottom-Up",
        content: "Top-Down (Memoization): Recursive approach augmented with a cache table. Bottom-Up (Tabulation): Iteratively fills DP table from base cases up to the target answer.",
      },
      {
        title: "3. Classic DP Patterns",
        content: "1D Fibonacci/Stairs, 0/1 Knapsack, Longest Common Subsequence, Matrix Chain Multiplication, Coin Change.",
      },
    ],
  },
};

export function getTheoryBySlug(slug: string): DetailedTheoryTopic | undefined {
  if (!slug) return undefined;
  const s = slug.toLowerCase().trim();
  return (
    THEORY_DATABASE[s] ||
    Object.values(THEORY_DATABASE).find((t) => t.slug === s || t.visualizerSlug === s)
  );
}
