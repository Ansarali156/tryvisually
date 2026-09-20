"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X, ArrowRight, BookOpen, Layers, Cpu, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { DATA_STRUCTURES_CATALOG, ALGORITHMS_CATALOG } from "@/config/dsa";

export interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  category: "Data Structures" | "Algorithms" | "Lessons" | "Problems";
  href: string;
  badge?: string;
}

const STATIC_LESSONS: SearchResultItem[] = [
  { id: "l1", title: "Understanding Binary Search Invariants", category: "Lessons", href: "/learn", badge: "Lesson" },
  { id: "l2", title: "Pointer Manipulation in Linked Lists", category: "Lessons", href: "/learn", badge: "Lesson" },
  { id: "l3", title: "Tree Traversals & In-order Depth", category: "Lessons", href: "/learn", badge: "Lesson" },
];

const STATIC_PROBLEMS: SearchResultItem[] = [
  { id: "pr1", title: "Binary Search in Sorted Array", category: "Problems", href: "/visualizer/binary-search", badge: "Problem" },
  { id: "pr2", title: "Reverse a Singly Linked List", category: "Problems", href: "/problems", badge: "Problem" },
  { id: "pr3", title: "Two Sum with Hash Map", category: "Problems", href: "/problems", badge: "Problem" },
];

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const searchResults = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        "Data Structures": DATA_STRUCTURES_CATALOG.slice(0, 3).map((d) => ({
          id: d.id,
          title: d.name,
          category: "Data Structures" as const,
          href: `/data-structures#${d.slug}`,
          badge: d.difficulty,
        })),
        Algorithms: ALGORITHMS_CATALOG.slice(0, 3).map((a) => ({
          id: a.id,
          title: a.name,
          category: "Algorithms" as const,
          href: `/visualizer/${a.slug}`,
          badge: a.timeComplexity,
        })),
        Lessons: STATIC_LESSONS.slice(0, 2),
        Problems: STATIC_PROBLEMS.slice(0, 2),
      };
    }

    const dsMatches = DATA_STRUCTURES_CATALOG.filter(
      (d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
    ).map((d) => ({
      id: d.id,
      title: d.name,
      category: "Data Structures" as const,
      href: `/data-structures#${d.slug}`,
      badge: d.difficulty,
    }));

    const algoMatches = ALGORITHMS_CATALOG.filter(
      (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    ).map((a) => ({
      id: a.id,
      title: a.name,
      category: "Algorithms" as const,
      href: `/visualizer/${a.slug}`,
      badge: a.timeComplexity,
    }));

    const lessonMatches = STATIC_LESSONS.filter((l) =>
      l.title.toLowerCase().includes(q)
    );

    const problemMatches = STATIC_PROBLEMS.filter((p) =>
      p.title.toLowerCase().includes(q)
    );

    return {
      "Data Structures": dsMatches,
      Algorithms: algoMatches,
      Lessons: lessonMatches,
      Problems: problemMatches,
    };
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    searchResults["Data Structures"].length +
    searchResults.Algorithms.length +
    searchResults.Lessons.length +
    searchResults.Problems.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global DSA Search"
        className="relative w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-surface-900 overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search data structures, algorithms, lessons, problems..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-surface-100 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {totalResults === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching data structures or algorithms found for &quot;{query}&quot;.
            </div>
          ) : (
            Object.entries(searchResults).map(([category, items]) => {
              if (items.length === 0) return null;

              const Icon =
                category === "Data Structures"
                  ? Layers
                  : category === "Algorithms"
                  ? Cpu
                  : category === "Lessons"
                  ? BookOpen
                  : Code;

              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Icon className="h-3 w-3" />
                    <span>{category}</span>
                  </div>

                  <div className="space-y-0.5">
                    {items.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors group"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 border border-slate-200 dark:border-slate-700">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-surface-50 dark:bg-surface-950 flex items-center justify-between text-[11px] text-slate-400">
          <span>Quick jump navigation</span>
          <span className="font-mono">Visually Search</span>
        </div>
      </div>
    </div>
  );
}
