"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { DPAlgorithmType, DPExecutionState } from "@/core/dp/types";
import {
  generateFibonacciDpTrace,
  generateClimbingStairsTrace,
  generateKnapsackTrace,
  generateLcsTrace,
} from "@/core/dp/trace-generators";
import { DP_SNIPPETS } from "@/core/dp/code-snippets";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import type { SupportedLanguage } from "@/core/synchronization/types";
import { TopicBar } from "@/components/visualizer/topic-bar";
import { TimelineControls } from "@/components/ui/timeline-controls";
import { CodeViewer } from "@/components/code/code-viewer";
import { VariablesPanel } from "@/components/execution/variables-panel";
import { ExplanationPanel } from "@/components/execution/explanation-panel";
import { Button } from "@/components/ui/button";
import type { PlaybackSpeed } from "@/core/engine/types";
import { Table, Play, CheckCircle2, Calculator } from "lucide-react";

const ALGORITHMS: { id: DPAlgorithmType; name: string; type: "1D" | "2D" }[] = [
  { id: "fibonacci", name: "Fibonacci Numbers", type: "1D" },
  { id: "climbing-stairs", name: "Climbing Stairs", type: "1D" },
  { id: "knapsack", name: "0/1 Knapsack", type: "2D" },
  { id: "lcs", name: "Longest Common Subsequence", type: "2D" },
];

export function DpVisualizerShell() {
  const [algorithm, setAlgorithm] = React.useState<DPAlgorithmType>("knapsack");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");

  const createTrace = React.useCallback((algo: DPAlgorithmType) => {
    switch (algo) {
      case "fibonacci":
        return generateFibonacciDpTrace(6);
      case "climbing-stairs":
        return generateClimbingStairsTrace(5);
      case "knapsack":
        return generateKnapsackTrace([2, 3, 4], [3, 4, 5], 5);
      case "lcs":
        return generateLcsTrace("STONE", "LONGEST");
    }
  }, []);

  const [trace, setTrace] = React.useState(() => createTrace(algorithm));

  const handleRun = React.useCallback(() => {
    setTrace(createTrace(algorithm));
  }, [algorithm, createTrace]);

  const engine = useExecutionEngine<DPExecutionState>(trace, { initialSpeed: 1 });
  const currentStep = engine.currentStep;
  const runtimeState = currentStep?.state;

  // Synchronized Code
  const rawCode =
    DP_SNIPPETS[algorithm]?.[activeLanguage] ??
    DP_SNIPPETS.knapsack.python;

  const activeLine = currentStep?.codeLine ?? 1;

  // Active & Dependent cell lookup
  const activeCell = runtimeState?.activeCell;
  const isCellActive = (r: number, c: number) =>
    activeCell && activeCell[0] === r && activeCell[1] === c;

  const isCellDependent = (r: number, c: number) =>
    runtimeState?.dependentCells.some(([dr, dc]) => dr === r && dc === c);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <TopicBar />

      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-[1700px] w-full mx-auto gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Table className="w-6 h-6 text-primary" />
              Dynamic Programming Visualizer
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Explore overlapping subproblems, memoization tables, and cell dependency transitions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {ALGORITHMS.map((algo) => (
              <Button
                key={algo.id}
                variant={algorithm === algo.id ? "primary" : "outline"}
                size="sm"
                className="text-xs h-8"
                onClick={() => {
                  setAlgorithm(algo.id);
                  setTrace(createTrace(algo.id));
                }}
              >
                {algo.name} ({algo.type})
              </Button>
            ))}
          </div>
        </div>

        {/* Controls Bar & Formula */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handleRun} className="h-8 gap-1.5">
              <Play className="w-3.5 h-3.5" />
              Run DP
            </Button>

            <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1 rounded text-xs font-mono">
              <Calculator className="w-3.5 h-3.5 text-primary" />
              <span>{runtimeState?.formula || "Recurrence relation"}</span>
            </div>
          </div>

          {runtimeState?.finalAnswer !== null && runtimeState?.finalAnswer !== undefined && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Optimal Answer: {runtimeState.finalAnswer}
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Table Canvas */}
          <div className="lg:col-span-8 flex flex-col gap-3 min-h-[520px]">
            <div className="flex-1 relative rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center min-h-[460px] overflow-x-auto">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 self-start">
                DP State Table ({runtimeState?.table.is2D ? "2D Grid" : "1D Array"})
              </div>

              {/* DP Table */}
              <div className="inline-block border border-border rounded-lg overflow-hidden shadow-sm bg-background">
                <table className="border-collapse text-xs">
                  {/* Column Headers */}
                  <thead>
                    <tr className="bg-muted/60 border-b border-border">
                      <th className="p-2.5 font-mono text-muted-foreground border-r border-border text-center">
                        #
                      </th>
                      {runtimeState?.table.colLabels.map((col, cIdx) => (
                        <th
                          key={cIdx}
                          className="p-2.5 font-mono font-semibold text-foreground border-r border-border last:border-r-0 min-w-[54px] text-center"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {runtimeState?.table.grid.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-border last:border-b-0">
                        {/* Row Header */}
                        <td className="p-2.5 font-mono font-semibold bg-muted/40 border-r border-border text-muted-foreground text-center">
                          {runtimeState.table.rowLabels[rIdx] || `r${rIdx}`}
                        </td>

                        {/* Cell Values */}
                        {row.map((cellVal, cIdx) => {
                          const isActive = isCellActive(rIdx, cIdx);
                          const isDep = isCellDependent(rIdx, cIdx);
                          const isFilled = cellVal !== null;

                          return (
                            <td
                              key={cIdx}
                              className={cn(
                                "p-2.5 font-mono text-center border-r border-border last:border-r-0 transition-all duration-200 min-w-[54px] h-[48px]",
                                isActive
                                  ? "bg-primary text-primary-foreground font-bold scale-105 shadow-md ring-4 ring-primary/25 z-10"
                                  : isDep
                                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold ring-2 ring-amber-500/50"
                                  : isFilled
                                  ? "text-foreground font-semibold bg-card hover:bg-muted/30"
                                  : "text-muted-foreground/30 font-light"
                              )}
                            >
                              {cellVal !== null ? cellVal : "-"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Legend */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-muted-foreground border-t border-border pt-3 w-full">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span>Computing Cell</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-500/60" />
                  <span>Subproblem Dependency</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded border border-border bg-card" />
                  <span>Solved Cell</span>
                </div>
              </div>
            </div>

            {/* Timeline Controls */}
            <TimelineControls
              isPlaying={engine.isPlaying}
              currentStep={engine.currentStepIndex}
              totalSteps={engine.totalSteps}
              speed={engine.speed as PlaybackSpeed}
              onPlay={engine.play}
              onPause={engine.pause}
              onStepForward={engine.next}
              onStepBackward={engine.previous}
              onGoToStart={engine.jumpToStart}
              onGoToEnd={engine.jumpToEnd}
              onSeek={engine.jumpTo}
              onSpeedChange={(spd: PlaybackSpeed) => engine.setSpeed(spd)}
            />
          </div>

          {/* Right Side: Code & Variables */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col min-h-[300px]">
              <CodeViewer
                rawCode={rawCode}
                language={activeLanguage}
                onLanguageChange={setActiveLanguage}
                activeLines={[activeLine]}
                primaryLine={activeLine}
              />
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <VariablesPanel variables={currentStep?.variables ?? {}} />
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <ExplanationPanel
                title="DP Step"
                explanation={currentStep?.explanation ?? "Click Run to compute DP table."}
                stepIndex={engine.currentStepIndex}
                totalSteps={engine.totalSteps}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
