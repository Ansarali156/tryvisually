import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlaySquare, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Problems | Visually",
  description: "Curated DSA practice problems with synchronized visual execution traces.",
};

const PROBLEMS = [
  {
    id: "p1",
    title: "Binary Search in Sorted Array",
    topic: "Algorithms",
    difficulty: "Beginner",
    acceptance: "78%",
    solved: true,
  },
  {
    id: "p2",
    title: "Reverse a Singly Linked List",
    topic: "Data Structures",
    difficulty: "Beginner",
    acceptance: "65%",
    solved: false,
  },
  {
    id: "p3",
    title: "Valid Parentheses via Stack",
    topic: "Data Structures",
    difficulty: "Beginner",
    acceptance: "71%",
    solved: false,
  },
  {
    id: "p4",
    title: "Invert Binary Tree",
    topic: "Data Structures",
    difficulty: "Intermediate",
    acceptance: "62%",
    solved: false,
  },
  {
    id: "p5",
    title: "Two Sum with Hash Map",
    topic: "Data Structures",
    difficulty: "Beginner",
    acceptance: "84%",
    solved: false,
  },
  {
    id: "p6",
    title: "Breadth-First Search on Maze Grid",
    topic: "Algorithms",
    difficulty: "Intermediate",
    acceptance: "54%",
    solved: false,
  },
];

export default function ProblemsPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant="brand" size="sm" className="mb-2">
              Problem Directory
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              DSA Challenges
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Solve problems with synchronized visual step traces and variable verification.
            </p>
          </div>
        </div>

        {/* Problems Table */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-surface-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-50 dark:bg-surface-950 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Topic</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Acceptance</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {PROBLEMS.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      {p.solved ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {p.title}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {p.topic}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={p.difficulty === "Beginner" ? "success" : "warning"}
                        size="sm"
                      >
                        {p.difficulty}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">
                      {p.acceptance}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href="/visualizer">
                        <Button variant="outline" size="sm">
                          <PlaySquare className="h-3.5 w-3.5 mr-1" />
                          Solve & Trace
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
