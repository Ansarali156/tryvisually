"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export interface GraphComplexityCardProps {
  className?: string;
}

export function GraphComplexityCard({ className }: GraphComplexityCardProps) {
  return (
    <div className={cn("flex flex-col gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-900 shadow-xs", className)}>
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
        <BookOpen className="w-4 h-4 text-brand-500" />
        <span>Representation Complexity Comparison</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
              <th className="pb-2 font-medium">Operation</th>
              <th className="pb-2 font-mono font-medium text-brand-600 dark:text-brand-400">Adjacency List</th>
              <th className="pb-2 font-mono font-medium text-purple-600 dark:text-purple-400">Adjacency Matrix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
            <tr>
              <td className="py-1.5 font-sans font-medium text-slate-700 dark:text-slate-300">Space</td>
              <td className="py-1.5 text-emerald-600 dark:text-emerald-400 font-bold">O(V + E)</td>
              <td className="py-1.5 text-amber-600 dark:text-amber-400 font-bold">O(V²)</td>
            </tr>
            <tr>
              <td className="py-1.5 font-sans font-medium text-slate-700 dark:text-slate-300">Add Edge</td>
              <td className="py-1.5 text-emerald-600 dark:text-emerald-400 font-bold">O(1)</td>
              <td className="py-1.5 text-emerald-600 dark:text-emerald-400 font-bold">O(1)</td>
            </tr>
            <tr>
              <td className="py-1.5 font-sans font-medium text-slate-700 dark:text-slate-300">Query Edge (u, v)</td>
              <td className="py-1.5 text-amber-600 dark:text-amber-400">O(deg(u))</td>
              <td className="py-1.5 text-emerald-600 dark:text-emerald-400 font-bold">O(1)</td>
            </tr>
            <tr>
              <td className="py-1.5 font-sans font-medium text-slate-700 dark:text-slate-300">Find All Neighbors</td>
              <td className="py-1.5 text-emerald-600 dark:text-emerald-400 font-bold">O(deg(u))</td>
              <td className="py-1.5 text-amber-600 dark:text-amber-400">O(V)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5">
        * Adjacency list is superior for sparse graphs (|E| ≪ |V|²); matrix is optimal for dense graphs with rapid edge lookup.
      </p>
    </div>
  );
}
