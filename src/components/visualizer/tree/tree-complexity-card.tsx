"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TreeState, TreeMode } from "@/core/tree/types";
import { getTreeStatistics } from "@/core/tree/validation";
import { CheckCircle2, AlertTriangle, Info, Network, Hash, ArrowUpDown } from "lucide-react";

export interface TreeComplexityCardProps {
  treeState: TreeState<number>;
  mode: TreeMode;
  className?: string;
}

export function TreeComplexityCard({
  treeState,
  mode,
  className,
}: TreeComplexityCardProps) {
  const stats = React.useMemo(() => {
    return getTreeStatistics(treeState);
  }, [treeState]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* 1. Live Tree Statistics */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Tree Metrics</h4>
          </div>
          {mode === "bst" ? (
            stats.isBST ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valid BST
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5" />
                Non-BST
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              Binary Tree
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
            <div className="text-[11px] text-muted-foreground uppercase font-medium">Nodes</div>
            <div className="text-lg font-bold font-mono text-foreground">{stats.nodeCount}</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
            <div className="text-[11px] text-muted-foreground uppercase font-medium">Height (Edges)</div>
            <div className="text-lg font-bold font-mono text-foreground">{stats.height}</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
            <div className="text-[11px] text-muted-foreground uppercase font-medium">Leaves</div>
            <div className="text-lg font-bold font-mono text-foreground">{stats.leafCount}</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
            <div className="text-[11px] text-muted-foreground uppercase font-medium">Root</div>
            <div className="text-lg font-bold font-mono text-foreground">
              {stats.rootValue !== null ? stats.rootValue : "—"}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
            <div className="text-[11px] text-muted-foreground uppercase font-medium">Min</div>
            <div className="text-lg font-bold font-mono text-foreground">
              {stats.minValue !== null ? stats.minValue : "—"}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
            <div className="text-[11px] text-muted-foreground uppercase font-medium">Max</div>
            <div className="text-lg font-bold font-mono text-foreground">
              {stats.maxValue !== null ? stats.maxValue : "—"}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-3 italic text-center">
          *Height convention: Empty = -1, Single Root Leaf = 0, Edges along longest path.
        </p>
      </div>

      {/* 2. Asymptotic Complexity Table */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Hash className="w-4 h-4 text-primary" />
          Complexity Analysis
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left pb-2 font-medium">Operation</th>
                <th className="text-center pb-2 font-medium">Average</th>
                <th className="text-center pb-2 font-medium">Worst Case</th>
                <th className="text-right pb-2 font-medium">Space</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 font-mono">
              <tr>
                <td className="py-2 font-sans font-medium text-foreground">BST Search</td>
                <td className="text-center text-emerald-600 dark:text-emerald-400 font-semibold">O(log n)</td>
                <td className="text-center text-amber-600 dark:text-amber-400">O(n)</td>
                <td className="text-right text-muted-foreground">O(h)</td>
              </tr>
              <tr>
                <td className="py-2 font-sans font-medium text-foreground">BST Insert</td>
                <td className="text-center text-emerald-600 dark:text-emerald-400 font-semibold">O(log n)</td>
                <td className="text-center text-amber-600 dark:text-amber-400">O(n)</td>
                <td className="text-right text-muted-foreground">O(h)</td>
              </tr>
              <tr>
                <td className="py-2 font-sans font-medium text-foreground">BST Delete</td>
                <td className="text-center text-emerald-600 dark:text-emerald-400 font-semibold">O(log n)</td>
                <td className="text-center text-amber-600 dark:text-amber-400">O(n)</td>
                <td className="text-right text-muted-foreground">O(h)</td>
              </tr>
              <tr>
                <td className="py-2 font-sans font-medium text-foreground">Tree Traversals</td>
                <td className="text-center text-blue-600 dark:text-blue-400 font-semibold">O(n)</td>
                <td className="text-center text-blue-600 dark:text-blue-400">O(n)</td>
                <td className="text-right text-muted-foreground">O(h)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-muted-foreground mt-3">
          Average-case BST efficiency assumes balanced distribution. A completely skewed tree degenerates to linked-list complexity \(O(n)\).
        </p>
      </div>

      {/* 3. Educational Invariant Guide */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-primary">
          <Info className="w-4 h-4" />
          {mode === "bst" ? "BST Invariant Rule" : "Binary Tree Rule"}
        </div>
        {mode === "bst" ? (
          <p className="text-muted-foreground leading-relaxed">
            For every node in a Binary Search Tree:{" "}
            <span className="font-mono font-bold text-foreground">
              all left subtree values &lt; node &lt; all right subtree values
            </span>
            . This enables binary branching, cutting search space in half at each step.
          </p>
        ) : (
          <p className="text-muted-foreground leading-relaxed">
            In a general binary tree, each node has at most two children (left and right). Values are not sorted, so lookups require full \(O(n)\) traversal.
          </p>
        )}
      </div>
    </div>
  );
}
