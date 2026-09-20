import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, CheckCircle2, Clock, PlaySquare } from "lucide-react";

export const metadata = {
  title: "Progress Tracker | Visually",
  description: "Track your learning streaks, mastered algorithms, and completed modules.",
};

export default function ProgressPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8">
          <Badge variant="brand" size="sm" className="mb-2">
            Analytics & Mastery
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Learning Progress
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Monitor your comprehension metrics, problem submissions, and topic milestones.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  12
                </span>
                <span className="block text-xs text-slate-500">
                  Topics Mastered
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  5 Days
                </span>
                <span className="block text-xs text-slate-500">
                  Study Streak
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  28
                </span>
                <span className="block text-xs text-slate-500">
                  Problems Solved
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  6.4 hrs
                </span>
                <span className="block text-xs text-slate-500">
                  Visualizer Time
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Topic Completion */}
        <Card>
          <CardHeader>
            <CardTitle>Curriculum Progression</CardTitle>
            <CardDescription>
              Overall completion breakdown across standard curricula.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Data Structures Mastery
                </span>
                <span className="text-slate-500 font-mono">60%</span>
              </div>
              <Progress value={60} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Algorithms & Sorting
                </span>
                <span className="text-slate-500 font-mono">45%</span>
              </div>
              <Progress value={45} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Graph Theory & Shortest Path
                </span>
                <span className="text-slate-500 font-mono">20%</span>
              </div>
              <Progress value={20} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
