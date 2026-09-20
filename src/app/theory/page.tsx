"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import {
  BookOpen,
  Eye,
  Search,
  Clock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TheoryCardItem {
  id: string;
  name: string;
  slug: string;
  category: "Data Structure" | "Algorithm";
  description: string;
  bestTime: string;
  worstTime: string;
  spaceComplexity: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

const THEORY_TOPICS: TheoryCardItem[] = [
  {
    id: "arrays",
    name: "Arrays",
    slug: "arrays",
    category: "Data Structure",
    description: "Contiguous memory layout, cache locality, $O(1)$ random access, and static vs. dynamic resizing amortized analysis.",
    bestTime: "O(1) Access",
    worstTime: "O(n) Insertion",
    spaceComplexity: "O(n)",
    difficulty: "Beginner",
  },
  {
    id: "linked-lists",
    name: "Linked Lists",
    slug: "linked-lists",
    category: "Data Structure",
    description: "Pointer-linked node sequences, dynamic memory allocation, pointer manipulation, and cycle detection.",
    bestTime: "O(1) Insert at Head",
    worstTime: "O(n) Search",
    spaceComplexity: "O(n)",
    difficulty: "Beginner",
  },
  {
    id: "stack",
    name: "Stack",
    slug: "stack",
    category: "Data Structure",
    description: "Last-In First-Out (LIFO) semantics, call stack activation records, monotonic stacks, and balanced bracket parsing.",
    bestTime: "O(1) Push/Pop",
    worstTime: "O(1) Push/Pop",
    spaceComplexity: "O(n)",
    difficulty: "Beginner",
  },
  {
    id: "queue",
    name: "Queue",
    slug: "queue",
    category: "Data Structure",
    description: "First-In First-Out (FIFO) buffer principles, ring-buffer pointer arithmetic, and asynchronous task scheduling.",
    bestTime: "O(1) Enqueue/Dequeue",
    worstTime: "O(1) Enqueue/Dequeue",
    spaceComplexity: "O(n)",
    difficulty: "Beginner",
  },
  {
    id: "hash-table",
    name: "Hash Table",
    slug: "hash-table",
    category: "Data Structure",
    description: "Deterministic hash functions, uniform distribution, collision resolution via chaining and open addressing.",
    bestTime: "O(1) Average",
    worstTime: "O(n) Degenerate",
    spaceComplexity: "O(n)",
    difficulty: "Intermediate",
  },
  {
    id: "binary-tree",
    name: "Binary Tree",
    slug: "binary-tree",
    category: "Data Structure",
    description: "Recursive hierarchy, recursive invariants, depth vs. height, and Euler tour traversal orders.",
    bestTime: "O(1) Root Access",
    worstTime: "O(n) Traversal",
    spaceComplexity: "O(n)",
    difficulty: "Intermediate",
  },
  {
    id: "bst",
    name: "Binary Search Tree (BST)",
    slug: "bst",
    category: "Data Structure",
    description: "Left < Root < Right ordered partition invariant, in-order sorted traversal, and tree balance factors.",
    bestTime: "O(log n) Balanced",
    worstTime: "O(n) Skewed",
    spaceComplexity: "O(n)",
    difficulty: "Intermediate",
  },
  {
    id: "heap",
    name: "Binary Heap",
    slug: "heap",
    category: "Data Structure",
    description: "Complete binary tree invariant, array-backed index mathematics ($2i+1, 2i+2$), and heapify sift bounds.",
    bestTime: "O(1) Find-Min",
    worstTime: "O(log n) Extract",
    spaceComplexity: "O(n)",
    difficulty: "Intermediate",
  },
  {
    id: "priority-queue",
    name: "Priority Queue",
    slug: "priority-queue",
    category: "Data Structure",
    description: "Abstract Priority ADT, min/max extraction, greedy scheduler backing, and Dijkstra integration.",
    bestTime: "O(1) Peek",
    worstTime: "O(log n) Pop",
    spaceComplexity: "O(n)",
    difficulty: "Intermediate",
  },
  {
    id: "graphs",
    name: "Graph Theory & Models",
    slug: "graphs",
    category: "Data Structure",
    description: "Vertices and edges, directed vs undirected, adjacency matrices vs lists, cycles, and connectivity components.",
    bestTime: "O(1) Edge Lookup",
    worstTime: "O(V + E) Scan",
    spaceComplexity: "O(V + E)",
    difficulty: "Advanced",
  },
  {
    id: "binary-search",
    name: "Binary Search",
    slug: "binary-search",
    category: "Algorithm",
    description: "Monotonic search space invariance, divide-and-conquer bound halving, and integer overflow avoidance.",
    bestTime: "O(1) Center Match",
    worstTime: "O(log n)",
    spaceComplexity: "O(1)",
    difficulty: "Beginner",
  },
  {
    id: "linear-search",
    name: "Linear Search",
    slug: "linear-search",
    category: "Algorithm",
    description: "Sequential decision boundary, unordered collection search, and early-exit average case behavior.",
    bestTime: "O(1) First Element",
    worstTime: "O(n)",
    spaceComplexity: "O(1)",
    difficulty: "Beginner",
  },
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    slug: "bubble-sort",
    category: "Algorithm",
    description: "Inversion counting, adjacent comparison invariants, and adaptive early termination via swapped flag.",
    bestTime: "O(n) Sorted",
    worstTime: "O(n²)",
    spaceComplexity: "O(1)",
    difficulty: "Beginner",
  },
  {
    id: "selection-sort",
    name: "Selection Sort",
    slug: "selection-sort",
    category: "Algorithm",
    description: "Sorted prefix expansion, global minimum selection, and $O(n)$ maximum swap count efficiency.",
    bestTime: "O(n²)",
    worstTime: "O(n²)",
    spaceComplexity: "O(1)",
    difficulty: "Beginner",
  },
  {
    id: "insertion-sort",
    name: "Insertion Sort",
    slug: "insertion-sort",
    category: "Algorithm",
    description: "Online sorting, adaptive shifting, stability invariants, and $O(n)$ efficiency for nearly-sorted inputs.",
    bestTime: "O(n) Near-sorted",
    worstTime: "O(n²)",
    spaceComplexity: "O(1)",
    difficulty: "Beginner",
  },
  {
    id: "merge-sort",
    name: "Merge Sort",
    slug: "merge-sort",
    category: "Algorithm",
    description: "Divide-and-conquer recurrence $T(n) = 2T(n/2) + O(n)$, stable out-of-place merging, and external sort utility.",
    bestTime: "O(n log n)",
    worstTime: "O(n log n)",
    spaceComplexity: "O(n)",
    difficulty: "Intermediate",
  },
  {
    id: "quick-sort",
    name: "Quick Sort",
    slug: "quick-sort",
    category: "Algorithm",
    description: "Partitioning algorithms (Lomuto vs Hoare), pivot selection strategies, and recursion tree call stack bounds.",
    bestTime: "O(n log n)",
    worstTime: "O(n²)",
    spaceComplexity: "O(log n)",
    difficulty: "Intermediate",
  },
  {
    id: "recursion",
    name: "Recursion & Backtracking",
    slug: "recursion",
    category: "Algorithm",
    description: "Base case guarantees, stack frame lifecycle, call tree branching factor, and backtracking state pruning.",
    bestTime: "O(1) Base Case",
    worstTime: "O(2ⁿ) Branching",
    spaceComplexity: "O(n) Call Stack",
    difficulty: "Intermediate",
  },
  {
    id: "dp",
    name: "Dynamic Programming",
    slug: "dp",
    category: "Algorithm",
    description: "Optimal substructure, overlapping subproblems, memoization vs. tabulation, and state transition topology.",
    bestTime: "O(n) 1D States",
    worstTime: "O(n · W) Grid",
    spaceComplexity: "O(n · W)",
    difficulty: "Advanced",
  },
];

export default function TheoryCatalogPage() {
  const [filter, setFilter] = React.useState<"all" | "ds" | "algo">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredTopics = React.useMemo(() => {
    return THEORY_TOPICS.filter((topic) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "ds" && topic.category === "Data Structure") ||
        (filter === "algo" && topic.category === "Algorithm");

      const matchesSearch =
        searchQuery.trim() === "" ||
        topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  return (
    <AppShell>
      <div className="w-full bg-surface-50 dark:bg-surface-950 flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Framed Container Box matching TRY VISUALLY visual design language */}
          <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-surface-900/90 p-5 sm:p-7 lg:p-8 shadow-xs space-y-6">
            
            {/* Top Toolbar inside Container */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              {/* Category Filter Chips */}
              <div className="flex items-center rounded-xl bg-surface-100 dark:bg-surface-800 p-1 text-xs font-semibold">
                <button
                  onClick={() => setFilter("all")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg transition-colors",
                    filter === "all"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-surface-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  All ({THEORY_TOPICS.length})
                </button>
                <button
                  onClick={() => setFilter("ds")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg transition-colors",
                    filter === "ds"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-surface-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  Data Structures ({THEORY_TOPICS.filter((t) => t.category === "Data Structure").length})
                </button>
                <button
                  onClick={() => setFilter("algo")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg transition-colors",
                    filter === "algo"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-surface-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  Algorithms ({THEORY_TOPICS.filter((t) => t.category === "Algorithm").length})
                </button>
              </div>

              {/* Instant Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search theory topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 bg-surface-50 dark:border-slate-800 dark:bg-surface-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Grid of Theory Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-brand-500/70 hover:shadow-md transition-all dark:border-slate-800 dark:bg-surface-950/60 dark:hover:border-brand-500/60 dark:hover:bg-surface-800/80"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {topic.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                        {topic.difficulty}
                      </span>
                    </div>

                    <Link href={`/theory/${topic.slug}`} className="block group">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {topic.name}
                      </h3>
                    </Link>

                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {topic.description}
                    </p>

                    {/* Asymptotic Bounds Pills */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 font-semibold text-brand-600 dark:text-brand-400">
                        Worst: {topic.worstTime}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800">
                        Space: {topic.spaceComplexity}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <Link
                      href={`/theory/${topic.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-500 shadow-xs transition-all"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Read Theory</span>
                    </Link>

                    <Link
                      href={`/visualise/${topic.slug}`}
                      className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-surface-100 hover:bg-surface-200 dark:text-slate-400 dark:hover:text-white dark:bg-surface-800/80 dark:hover:bg-surface-700 transition-colors"
                      title="Open Interactive Visualiser"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Visualise</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
