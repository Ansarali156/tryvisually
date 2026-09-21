"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import {
  Eye,
  BookOpen,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicCardItem {
  id: string;
  name: string;
  slug: string;
  category: "Data Structure" | "Algorithm";
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  available: boolean;
}

const ALL_TOPICS: TopicCardItem[] = [
  {
    id: "arrays",
    name: "Arrays",
    slug: "arrays",
    category: "Data Structure",
    description: "Contiguous memory sequence with direct indexing, sorting, searching, and element insertion/deletion.",
    timeComplexity: "O(1) Access",
    spaceComplexity: "O(n)",
    available: true,
  },
  {
    id: "linked-lists",
    name: "Linked Lists",
    slug: "linked-lists",
    category: "Data Structure",
    description: "Node-based pointer sequences supporting Singly, Doubly, and Circular list structures.",
    timeComplexity: "O(1) Insert/Delete",
    spaceComplexity: "O(n)",
    available: true,
  },
  {
    id: "stack",
    name: "Stack",
    slug: "stack",
    category: "Data Structure",
    description: "Last-In First-Out (LIFO) container with top-pointer tracking, push, pop, and overflow protection.",
    timeComplexity: "O(1) Push/Pop",
    spaceComplexity: "O(n)",
    available: true,
  },
  {
    id: "queue",
    name: "Queue",
    slug: "queue",
    category: "Data Structure",
    description: "First-In First-Out (FIFO) linear and circular ring buffers with front/rear pointer navigation.",
    timeComplexity: "O(1) Enqueue/Dequeue",
    spaceComplexity: "O(n)",
    available: true,
  },
  {
    id: "hash-table",
    name: "Hash Table",
    slug: "hash-table",
    category: "Data Structure",
    description: "Key-value hash mapping with bucket distribution, collision chaining, and linear probing.",
    timeComplexity: "O(1) Avg Lookup",
    spaceComplexity: "O(n)",
    available: true,
  },
  {
    id: "binary-tree",
    name: "Binary Tree",
    slug: "binary-tree",
    category: "Data Structure",
    description: "Hierarchical parent-child node tree with Pre-order, In-order, Post-order, and Level-order traversals.",
    timeComplexity: "O(n) Traversal",
    spaceComplexity: "O(n)",
    available: true,
  },
  {
    id: "bst",
    name: "Binary Search Tree (BST)",
    slug: "bst",
    category: "Data Structure",
    description: "Ordered binary tree maintaining the left < node < right invariant for logarithmic search and insertion.",
    timeComplexity: "O(log n) Search",
    spaceComplexity: "O(n)",
    available: true,
  },
  {
    id: "heap",
    name: "Binary Heap",
    slug: "heap",
    category: "Data Structure",
    description: "Priority-ordered complete binary tree with dual Tree and Array views, heapify, extract, and sift mechanics.",
    timeComplexity: "O(log n) Push/Pop",
    spaceComplexity: "O(n)",
    available: true,
  },
  {
    id: "priority-queue",
    name: "Priority Queue",
    slug: "priority-queue",
    category: "Data Structure",
    description: "Dynamic priority task scheduler backed by binary heap with Min and Max priority modes.",
    timeComplexity: "O(log n) Enqueue",
    spaceComplexity: "O(n)",
    available: true,
  },
  {
    id: "graphs",
    name: "Graph Algorithms",
    slug: "graphs",
    category: "Data Structure",
    description: "Adjacency List & Matrix, BFS, DFS, Dijkstra's Shortest Path, Bellman-Ford, Prim, Kruskal, and Kahn's TopoSort.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V + E)",
    available: true,
  },
  {
    id: "binary-search",
    name: "Binary Search",
    slug: "binary-search",
    category: "Algorithm",
    description: "Logarithmic divide-and-conquer boundary halving with low, mid, and high pointers in sorted collections.",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    available: true,
  },
  {
    id: "linear-search",
    name: "Linear Search",
    slug: "linear-search",
    category: "Algorithm",
    description: "Sequential element scan comparing target value step-by-step from start to finish.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    available: true,
  },
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    slug: "bubble-sort",
    category: "Algorithm",
    description: "Pairwise element comparison and adjacent swap iterations with real-time bar height comparisons.",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    available: true,
  },
  {
    id: "selection-sort",
    name: "Selection Sort",
    slug: "selection-sort",
    category: "Algorithm",
    description: "Repeatedly locates smallest remaining element and swaps it into the sorted prefix partition.",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    available: true,
  },
  {
    id: "insertion-sort",
    name: "Insertion Sort",
    slug: "insertion-sort",
    category: "Algorithm",
    description: "Constructs final sorted array one item at a time by backward shifting unsorted elements.",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    available: true,
  },
  {
    id: "merge-sort",
    name: "Merge Sort",
    slug: "merge-sort",
    category: "Algorithm",
    description: "Divide-and-conquer recursive partitioning and linear merging across sorted sub-arrays.",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    available: true,
  },
  {
    id: "quick-sort",
    name: "Quick Sort",
    slug: "quick-sort",
    category: "Algorithm",
    description: "Pivot element selection and in-place two-way array partitioning with recursive sort calls.",
    timeComplexity: "O(n log n) Avg",
    spaceComplexity: "O(log n)",
    available: true,
  },
  {
    id: "recursion",
    name: "Recursion & Call Stack",
    slug: "recursion",
    category: "Algorithm",
    description: "Physical LIFO activation records call stack, Factorial, Fibonacci call tree, and Tower of Hanoi disk steps.",
    timeComplexity: "O(2ⁿ) Hanoi",
    spaceComplexity: "O(n) Call Stack",
    available: true,
  },
  {
    id: "dp",
    name: "Dynamic Programming",
    slug: "dp",
    category: "Algorithm",
    description: "1D & 2D tabulation state grids with cell dependency visualization for Fibonacci, Knapsack, and LCS.",
    timeComplexity: "O(n · W) Knapsack",
    spaceComplexity: "O(n · W)",
    available: true,
  },
];

function TopicVisualPreview({ slug }: { slug: string }) {
  switch (slug) {
    case "arrays":
      return (
        <div className="w-full h-20 bg-slate-100/70 dark:bg-surface-900/60 rounded-lg flex items-center justify-center gap-1.5 px-3 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
          {[15, 23, 42, 57, 89].map((v, i) => (
            <div
              key={i}
              className={cn(
                "w-9 h-9 rounded-md border flex flex-col items-center justify-center font-mono text-xs font-bold transition-transform group-hover:scale-105",
                i === 2
                  ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/40 shadow-xs"
                  : "bg-white dark:bg-surface-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              )}
            >
              <span>{v}</span>
              <span className="text-[8px] text-slate-400 font-normal">[{i}]</span>
            </div>
          ))}
        </div>
      );
    case "linked-lists":
      return (
        <div className="w-full h-20 bg-slate-100/70 dark:bg-surface-900/60 rounded-lg flex items-center justify-center gap-1 px-3 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
          {[12, 25, 40].map((v, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-800 overflow-hidden shadow-xs">
                <span className="w-7 h-7 flex items-center justify-center font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-cyan-500/10 dark:bg-cyan-500/20 border-r border-slate-200 dark:border-slate-700">
                  {v}
                </span>
                <span className="w-3.5 h-7 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                  •
                </span>
              </div>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold text-xs">→</span>
            </React.Fragment>
          ))}
          <span className="text-slate-400 font-mono text-xs font-bold">∅</span>
        </div>
      );
    case "stack":
      return (
        <div className="w-full h-20 bg-slate-100/70 dark:bg-surface-900/60 rounded-lg flex flex-col-reverse items-center justify-center gap-1 p-2 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
          {[15, 28, 42].map((v, i) => (
            <div
              key={i}
              className={cn(
                "w-28 h-5 rounded border flex items-center justify-between px-2 font-mono text-[11px] font-bold transition-transform",
                i === 2
                  ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/50 shadow-xs"
                  : "bg-white dark:bg-surface-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              )}
            >
              <span>val: {v}</span>
              {i === 2 && <span className="text-[8px] uppercase font-bold text-cyan-500">TOP</span>}
            </div>
          ))}
        </div>
      );
    case "queue":
      return (
        <div className="w-full h-20 bg-slate-100/70 dark:bg-surface-900/60 rounded-lg flex items-center justify-center gap-1.5 px-3 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
          <span className="text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase">FRONT</span>
          <div className="flex items-center gap-1 border-y-2 border-dashed border-slate-300 dark:border-slate-700 py-1 px-1">
            {[10, 20, 30, 40].map((v, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-800 flex items-center justify-center font-mono text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                {v}
              </div>
            ))}
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">REAR</span>
        </div>
      );
    case "hash-table":
      return (
        <div className="w-full h-20 bg-slate-100/70 dark:bg-surface-900/60 rounded-lg flex flex-col justify-center gap-1 px-4 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
          {[
            { idx: 0, k: "Alice", v: "92" },
            { idx: 1, k: "Bob", v: "77" },
          ].map((item) => (
            <div key={item.idx} className="flex items-center gap-2 text-xs font-mono">
              <span className="w-4 h-4 rounded bg-slate-200 dark:bg-surface-800 flex items-center justify-center text-[9px] font-bold text-slate-500">
                {item.idx}
              </span>
              <span className="text-cyan-600 dark:text-cyan-400 text-xs">→</span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-surface-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px]">
                {item.k}: {item.v}
              </span>
            </div>
          ))}
        </div>
      );
    case "binary-tree":
    case "bst":
      return (
        <div className="w-full h-20 bg-slate-100/70 dark:bg-surface-900/60 rounded-lg flex flex-col items-center justify-center gap-1 p-1 overflow-hidden border border-slate-200/50 dark:border-slate-800/50 relative">
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300 dark:stroke-slate-700 stroke-2">
            <line x1="50%" y1="20" x2="35%" y2="52" />
            <line x1="50%" y1="20" x2="65%" y2="52" />
          </svg>
          <div className="relative z-10 w-6 h-6 rounded-full bg-cyan-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-xs">
            50
          </div>
          <div className="relative z-10 flex items-center justify-center gap-10 mt-0.5">
            <div className="w-5 h-5 rounded-full bg-white dark:bg-surface-800 border-2 border-slate-300 dark:border-slate-700 font-mono font-bold text-[9px] text-slate-800 dark:text-slate-200 flex items-center justify-center shadow-2xs">
              30
            </div>
            <div className="w-5 h-5 rounded-full bg-white dark:bg-surface-800 border-2 border-slate-300 dark:border-slate-700 font-mono font-bold text-[9px] text-slate-800 dark:text-slate-200 flex items-center justify-center shadow-2xs">
              70
            </div>
          </div>
        </div>
      );
    case "heap":
    case "priority-queue":
      return (
        <div className="w-full h-20 bg-slate-100/70 dark:bg-surface-900/60 rounded-lg flex flex-col items-center justify-center gap-1 p-1 overflow-hidden border border-slate-200/50 dark:border-slate-800/50 relative">
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-amber-500/40 dark:stroke-amber-400/40 stroke-2">
            <line x1="50%" y1="20" x2="35%" y2="52" />
            <line x1="50%" y1="20" x2="65%" y2="52" />
          </svg>
          <div className="relative z-10 w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-mono font-bold text-[10px] flex items-center justify-center shadow-xs">
            5
          </div>
          <div className="relative z-10 flex items-center justify-center gap-10 mt-0.5">
            <div className="w-5 h-5 rounded-full bg-white dark:bg-surface-800 border-2 border-amber-500/60 font-mono font-bold text-[9px] text-slate-800 dark:text-slate-200 flex items-center justify-center shadow-2xs">
              12
            </div>
            <div className="w-5 h-5 rounded-full bg-white dark:bg-surface-800 border-2 border-amber-500/60 font-mono font-bold text-[9px] text-slate-800 dark:text-slate-200 flex items-center justify-center shadow-2xs">
              23
            </div>
          </div>
        </div>
      );
    case "graphs":
      return (
        <div className="w-full h-20 bg-slate-100/70 dark:bg-surface-900/60 rounded-lg flex items-center justify-center p-2 overflow-hidden border border-slate-200/50 dark:border-slate-800/50 relative">
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300 dark:stroke-slate-700 stroke-2">
            <line x1="30%" y1="35%" x2="70%" y2="35%" />
            <line x1="30%" y1="35%" x2="50%" y2="75%" />
            <line x1="70%" y1="35%" x2="50%" y2="75%" />
          </svg>
          <div className="absolute top-3 left-[28%] -translate-x-1/2 w-5 h-5 rounded-full bg-cyan-600 text-white font-mono font-bold text-[9px] flex items-center justify-center shadow-xs">
            A
          </div>
          <div className="absolute top-3 right-[28%] translate-x-1/2 w-5 h-5 rounded-full bg-cyan-600 text-white font-mono font-bold text-[9px] flex items-center justify-center shadow-xs">
            B
          </div>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-emerald-600 text-white font-mono font-bold text-[9px] flex items-center justify-center shadow-xs">
            C
          </div>
        </div>
      );
    case "binary-search":
    case "linear-search":
      return (
        <div className="w-full h-20 bg-slate-100/70 dark:bg-surface-900/60 rounded-lg flex flex-col items-center justify-center gap-1 px-2 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-1 font-mono text-[8px] font-bold">
            <span className="text-sky-500">LOW</span>
            <span className="text-slate-300 dark:text-slate-700">──</span>
            <span className="text-amber-500 bg-amber-500/10 px-1 rounded">MID</span>
            <span className="text-slate-300 dark:text-slate-700">──</span>
            <span className="text-purple-500">HIGH</span>
          </div>
          <div className="flex items-center gap-1">
            {[10, 25, 42, 68, 90].map((v, i) => (
              <div
                key={i}
                className={cn(
                  "w-7 h-7 rounded border flex items-center justify-center font-mono text-[11px] font-bold transition-transform",
                  i === 2
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-xs scale-105"
                    : "bg-white dark:bg-surface-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                )}
              >
                {v}
              </div>
            ))}
          </div>
        </div>
      );
    case "bubble-sort":
    case "selection-sort":
    case "insertion-sort":
    case "merge-sort":
    case "quick-sort":
      return (
        <div className="w-full h-20 bg-slate-100/70 dark:bg-surface-900/60 rounded-lg flex items-end justify-center gap-1.5 px-3 pb-2.5 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
          {[20, 50, 35, 75, 45, 90, 60].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className={cn(
                "w-3.5 rounded-t-sm transition-all duration-300",
                i === 5
                  ? "bg-cyan-500 shadow-sm"
                  : i < 3
                  ? "bg-emerald-500/80"
                  : "bg-slate-300 dark:bg-surface-700"
              )}
            />
          ))}
        </div>
      );
    case "dp":
      return (
        <div className="w-full h-20 bg-slate-100/70 dark:bg-surface-900/60 rounded-lg flex items-center justify-center p-2 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
          <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center font-bold">
            {[0, 1, 2, 3, 0, 3, 4, 7, 0, 3, 5, 8].map((v, i) => (
              <div
                key={i}
                className={cn(
                  "w-6 h-4 rounded flex items-center justify-center border",
                  i === 11
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                    : i === 6 || i === 7
                    ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/40"
                    : "bg-white dark:bg-surface-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                )}
              >
                {v}
              </div>
            ))}
          </div>
        </div>
      );
    case "recursion":
      return (
        <div className="w-full h-20 bg-slate-100/70 dark:bg-surface-900/60 rounded-lg flex flex-col-reverse items-center justify-center gap-1 p-2 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
          {["fact(1) → 1", "fact(2) = 2 · fact(1)", "fact(3) = 3 · fact(2)"].map((text, i) => (
            <div
              key={i}
              className={cn(
                "w-40 h-4 rounded border px-2 flex items-center justify-between font-mono text-[9px] font-bold",
                i === 0
                  ? "bg-emerald-500 text-white border-emerald-600"
                  : "bg-white dark:bg-surface-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              )}
            >
              <span>{text}</span>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export default function VisualiseHomePage() {
  const [filter, setFilter] = React.useState<"all" | "ds" | "algo">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredTopics = React.useMemo(() => {
    return ALL_TOPICS.filter((topic) => {
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
          {/* Borderless Container matching clean UI requirements */}
          <div className="space-y-6">
            {/* Top Toolbar inside Container */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              {/* Category Filter Chips */}
              <div className="flex items-center rounded-lg bg-surface-100 dark:bg-surface-800 p-1 text-xs font-semibold">
                <button
                  onClick={() => setFilter("all")}
                  className={cn(
                    "px-3 py-1 rounded-md transition-colors",
                    filter === "all"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-surface-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  All ({ALL_TOPICS.length})
                </button>
                <button
                  onClick={() => setFilter("ds")}
                  className={cn(
                    "px-3 py-1 rounded-md transition-colors",
                    filter === "ds"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-surface-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  Data Structures ({ALL_TOPICS.filter((t) => t.category === "Data Structure").length})
                </button>
                <button
                  onClick={() => setFilter("algo")}
                  className={cn(
                    "px-3 py-1 rounded-md transition-colors",
                    filter === "algo"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-surface-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  Algorithms ({ALL_TOPICS.filter((t) => t.category === "Algorithm").length})
                </button>
              </div>

              {/* Instant Search Bar */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 bg-surface-50 dark:border-slate-800 dark:bg-surface-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Grid of DSA Cards: dsa1, dsa2, dsa3, dsa4, dsa5, dsa6... */}
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
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Interactive
                      </span>
                    </div>

                    {/* VisuAlgo Visual Diagram Preview */}
                    <Link href={`/visualise/${topic.slug}`} className="block my-3">
                      <TopicVisualPreview slug={topic.slug} />
                    </Link>

                    <Link href={`/visualise/${topic.slug}`} className="block group">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {topic.name}
                      </h3>
                    </Link>

                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {topic.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 font-semibold">
                        {topic.timeComplexity}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800">
                        Space: {topic.spaceComplexity}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <Link
                      href={`/visualise/${topic.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-500 shadow-xs transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Visualise</span>
                    </Link>

                    <Link
                      href={`/theory/${topic.slug}`}
                      className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-surface-100 hover:bg-surface-200 dark:text-slate-400 dark:hover:text-white dark:bg-surface-800/80 dark:hover:bg-surface-700 transition-colors"
                      title="Read Theory & Complexity"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Theory</span>
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
