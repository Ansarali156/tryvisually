import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Quizzes | Visually",
  description: "Assess your algorithmic knowledge with diagnostic concept quizzes.",
};

const QUIZZES = [
  {
    id: "q1",
    title: "Binary Search Boundary Invariants",
    questionsCount: 5,
    difficulty: "Beginner",
    estimatedTime: "5 mins",
    desc: "Test your understanding of off-by-one errors, while(left <= right), and midpoint rounding.",
  },
  {
    id: "q2",
    title: "Binary Search Tree Properties",
    questionsCount: 6,
    difficulty: "Intermediate",
    estimatedTime: "7 mins",
    desc: "Check your knowledge of in-order successor search, height balancing, and BST violations.",
  },
  {
    id: "q3",
    title: "Graph Traversal Invariants (BFS vs DFS)",
    questionsCount: 8,
    difficulty: "Intermediate",
    estimatedTime: "10 mins",
    desc: "Queue vs stack invariants, visited set handling, and cycle detection logic.",
  },
];

export default function QuizzesPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8">
          <Badge variant="brand" size="sm" className="mb-2">
            Concept Checks
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            DSA Knowledge Quizzes
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Formative diagnostic questions to verify conceptual depth before coding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUIZZES.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="brand" size="sm">
                    {quiz.questionsCount} Questions
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    {quiz.estimatedTime}
                  </span>
                </div>
                <CardTitle className="text-base">{quiz.title}</CardTitle>
                <CardDescription className="text-xs">
                  {quiz.desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Take Quiz
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
