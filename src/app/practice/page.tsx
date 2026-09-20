import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, HelpCircle, Code, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Practice | Visually",
  description: "Test and strengthen your algorithmic intuition with interactive challenges.",
};

export default function PracticePage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8">
          <Badge variant="brand" size="sm" className="mb-2">
            Active Learning
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Practice & Step Prediction
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Reinforce conceptual understanding by predicting what happens next in an algorithm execution trace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <CardTitle>Trace Predictor</CardTitle>
              <CardDescription>
                Pause the algorithm at critical branch points and predict pointer positions or updated values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/visualizer">
                <Button variant="outline" size="sm" className="w-full">
                  Start Predictor Mode
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 flex items-center justify-center mb-2">
                <HelpCircle className="h-5 w-5" />
              </div>
              <CardTitle>Concept Quizzes</CardTitle>
              <CardDescription>
                Short diagnostic questions testing invariant understanding, edge cases, and Big-O bounds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/quizzes">
                <Button variant="outline" size="sm" className="w-full">
                  Browse Quizzes
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center mb-2">
                <Code className="h-5 w-5" />
              </div>
              <CardTitle>Curated Problems</CardTitle>
              <CardDescription>
                Interview and competitive coding problems paired with interactive visualization traces.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/problems">
                <Button variant="outline" size="sm" className="w-full">
                  Solve Problems
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
