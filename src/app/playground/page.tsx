import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Terminal, Play, RotateCcw, Sliders } from "lucide-react";

export const metadata = {
  title: "Code Playground | Visually",
  description: "Experiment with custom inputs and examine custom visual traces.",
};

export default function PlaygroundPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8">
          <Badge variant="brand" size="sm" className="mb-2">
            Sandbox
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Execution Playground
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Experiment with arbitrary inputs, test edge cases, and inspect execution trace outputs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Custom Input Configuration */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-600" />
                <CardTitle className="text-base">Input Configuration</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Supply your own array, tree serialization, or target value.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Input Array (Comma Separated)
                </label>
                <input
                  type="text"
                  defaultValue="2, 5, 8, 12, 16, 23, 38, 56, 72, 91"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-surface-900 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Value
                </label>
                <input
                  type="text"
                  defaultValue="23"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-surface-900 text-xs font-mono"
                />
              </div>

              <div className="pt-2">
                <Link href="/visualizer">
                  <Button className="w-full" size="sm">
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    Generate & Visualize Trace
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Playground Preview / Output Area */}
          <Card className="lg:col-span-2 flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-brand-600" />
                <CardTitle className="text-base">Interactive Session Workbench</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Pre-configured trace execution environment ready for custom generator binding.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <div className="p-3 rounded-full bg-surface-100 dark:bg-surface-800 mb-3 text-slate-400">
                <Terminal className="h-8 w-8" />
              </div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Custom Trace Generation Ready
              </h4>
              <p className="text-xs max-w-sm">
                The playground integrates with the core Execution Engine to validate user inputs against algorithm constraints without executing unsafe arbitrary scripts.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
