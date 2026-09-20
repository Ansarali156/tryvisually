"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SecondaryButton } from "@/components/ui/buttons";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const TRACKS = [
  {
    id: "foundations",
    title: "Track 1: DSA Foundations",
    level: "Beginner",
    description: "Build strong intuition with memory arrays, strings, basic recursion, and pointer manipulation.",
    progress: 25,
    modules: [
      { name: "Memory Models & Array Basics", lessons: 4, completed: true },
      { name: "Linked Lists & Pointer Traversal", lessons: 5, completed: false },
      { name: "Stacks & Queues in Practice", lessons: 4, completed: false },
      { name: "Big-O Analysis Intuition", lessons: 3, completed: false },
    ],
  },
  {
    id: "trees-graphs",
    title: "Track 2: Hierarchical Structures & Graphs",
    level: "Intermediate",
    description: "Master trees, binary search trees, BFS, DFS, and graph modeling for real-world problems.",
    progress: 0,
    modules: [
      { name: "Binary Trees & Recursive Invariants", lessons: 6, completed: false },
      { name: "Binary Search Trees (BST)", lessons: 5, completed: false },
      { name: "Graph Representations & BFS", lessons: 5, completed: false },
      { name: "Depth-First Search & Cycle Detection", lessons: 6, completed: false },
    ],
  },
  {
    id: "advanced-algorithms",
    title: "Track 3: Advanced Paradigms & Dynamic Programming",
    level: "Advanced",
    description: "Explore greedy strategies, divide & conquer, dynamic programming state formulation, and shortest paths.",
    progress: 0,
    modules: [
      { name: "Divide & Conquer Sorting", lessons: 4, completed: false },
      { name: "Dynamic Programming Memoization", lessons: 7, completed: false },
      { name: "Tabulation & Space Optimization", lessons: 5, completed: false },
      { name: "Dijkstra & Minimum Spanning Trees", lessons: 5, completed: false },
    ],
  },
];

export default function LearnPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState<boolean>(false);

  return (
    <AppShell>
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Collapsible Learning Sidebar */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <Breadcrumb items={[{ label: "Curriculum Tracks" }]} />

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Structured Learning Paths
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Step-by-step tracks carefully designed to build your algorithmic problem solving from ground up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {TRACKS.map((track) => (
              <Card key={track.id} className="flex flex-col h-full hover:shadow-card transition-all">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={
                        track.level === "Beginner"
                          ? "success"
                          : track.level === "Intermediate"
                          ? "brand"
                          : "warning"
                      }
                    >
                      {track.level}
                    </Badge>
                    <span className="text-xs font-mono text-slate-500">
                      {track.progress}% Complete
                    </span>
                  </div>
                  <CardTitle className="text-lg">{track.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {track.description}
                  </CardDescription>
                  <div className="pt-2">
                    <Progress value={track.progress} />
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between pt-0">
                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Modules
                    </span>
                    {track.modules.map((m) => (
                      <div
                        key={m.name}
                        className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 py-1"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className={`h-3.5 w-3.5 ${
                              m.completed ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"
                            }`}
                          />
                          <span>{m.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {m.lessons} lessons
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link href="/visualizer">
                    <SecondaryButton size="sm" className="w-full justify-center">
                      Continue Track
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </SecondaryButton>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
