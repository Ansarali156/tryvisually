"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface TopicChip {
  id: string;
  name: string;
  slug: string;
  category: "Data Structure" | "Algorithm";
}

export const DATA_STRUCTURE_TOPICS: TopicChip[] = [
  { id: "arrays", name: "Array", slug: "arrays", category: "Data Structure" },
  { id: "linked-lists", name: "Linked List", slug: "linked-lists", category: "Data Structure" },
  { id: "stack", name: "Stack", slug: "stack", category: "Data Structure" },
  { id: "queue", name: "Queue", slug: "queue", category: "Data Structure" },
  { id: "hash-table", name: "Hash Table", slug: "hash-table", category: "Data Structure" },
  { id: "binary-tree", name: "Binary Tree", slug: "binary-tree", category: "Data Structure" },
  { id: "bst", name: "BST", slug: "bst", category: "Data Structure" },
  { id: "heap", name: "Heap", slug: "heap", category: "Data Structure" },
  { id: "priority-queue", name: "Priority Queue", slug: "priority-queue", category: "Data Structure" },
  { id: "graph", name: "Graph", slug: "graphs", category: "Data Structure" },
];

export const ALGORITHM_TOPICS: TopicChip[] = [
  { id: "searching", name: "Searching", slug: "linear-search", category: "Algorithm" },
  { id: "sorting", name: "Sorting", slug: "bubble-sort", category: "Algorithm" },
  { id: "bfs", name: "BFS", slug: "bfs", category: "Algorithm" },
  { id: "dfs", name: "DFS", slug: "dfs", category: "Algorithm" },
  { id: "dijkstra", name: "Dijkstra", slug: "dijkstra", category: "Algorithm" },
  { id: "prim", name: "Prim", slug: "prim", category: "Algorithm" },
  { id: "kruskal", name: "Kruskal", slug: "kruskal", category: "Algorithm" },
  { id: "topological-sort", name: "Topological Sort", slug: "topological-sort", category: "Algorithm" },
  { id: "recursion", name: "Recursion", slug: "recursion", category: "Algorithm" },
  { id: "dp", name: "Dynamic Programming", slug: "dp", category: "Algorithm" },
];

export interface TopicBarProps {
  currentSlug?: string;
  basePath?: "/visualise" | "/theory";
  className?: string;
}

export function TopicBar({
  currentSlug,
  basePath = "/visualise",
  className,
}: TopicBarProps) {
  const router = useRouter();

  const isChipActive = (slug: string) => {
    if (!currentSlug) return false;
    if (slug === currentSlug) return true;
    if (slug === "graphs" && (currentSlug === "graph" || currentSlug === "graphs")) return true;
    if (slug === "binary-tree" && currentSlug === "trees") return true;
    if (slug === "heap" && (currentSlug === "min-heap" || currentSlug === "max-heap")) return true;
    if (slug === "linear-search" && currentSlug === "binary-search") return true;
    if (
      slug === "bubble-sort" &&
      (currentSlug === "selection-sort" ||
        currentSlug === "insertion-sort" ||
        currentSlug === "merge-sort" ||
        currentSlug === "quick-sort" ||
        currentSlug === "sorting")
    ) {
      return true;
    }
    return false;
  };

  const handleSelect = (slug: string) => {
    router.push(`${basePath}/${slug}`);
  };

  return (
    <div
      className={cn(
        "w-full bg-white dark:bg-surface-900 border-b border-slate-200 dark:border-slate-800 select-none py-2.5 sm:py-3 px-4 sm:px-6 lg:px-8 shadow-2xs",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {/* Row 1: DATA STRUCTURES */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0 w-28 sm:w-32">
            Data Structures
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {DATA_STRUCTURE_TOPICS.map((topic) => {
              const active = isChipActive(topic.slug);
              return (
                <button
                  key={topic.id}
                  onClick={() => handleSelect(topic.slug)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-md font-semibold transition-all whitespace-nowrap",
                    active
                      ? "bg-brand-600 text-white shadow-2xs ring-1 ring-brand-700"
                      : "bg-surface-100 hover:bg-surface-200 text-slate-700 hover:text-slate-900 dark:bg-surface-800 dark:text-slate-300 dark:hover:bg-surface-700 dark:hover:text-white"
                  )}
                >
                  {topic.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: ALGORITHMS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0 w-28 sm:w-32">
            Algorithms
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {ALGORITHM_TOPICS.map((topic) => {
              const active = isChipActive(topic.slug);
              return (
                <button
                  key={topic.id}
                  onClick={() => handleSelect(topic.slug)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-md font-semibold transition-all whitespace-nowrap",
                    active
                      ? "bg-brand-600 text-white shadow-2xs ring-1 ring-brand-700"
                      : "bg-surface-100 hover:bg-surface-200 text-slate-700 hover:text-slate-900 dark:bg-surface-800 dark:text-slate-300 dark:hover:bg-surface-700 dark:hover:text-white"
                  )}
                >
                  {topic.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
