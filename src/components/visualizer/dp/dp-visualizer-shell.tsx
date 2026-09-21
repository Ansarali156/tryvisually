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
import { VisuAlgoShell, type VisuAlgoAction } from "@/components/visualizer/visualgo-shell";
import { Calculator, CheckCircle2 } from "lucide-react";

const ALGORITHMS: { id: DPAlgorithmType; name: string; type: "1D" | "2D"; complexity: string }[] = [
  { id: "fibonacci", name: "Fibonacci Numbers", type: "1D", complexity: "O(n)" },
  { id: "climbing-stairs", name: "Climbing Stairs", type: "1D", complexity: "O(n)" },
  { id: "knapsack", name: "0/1 Knapsack", type: "2D", complexity: "O(n × W)" },
  { id: "lcs", name: "Longest Common Subsequence", type: "2D", complexity: "O(m × n)" },
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

  const handleRun = React.useCallback(
    (algo: DPAlgorithmType = algorithm) => {
      setTrace(createTrace(algo));
    },
    [algorithm, createTrace]
  );

  const engine = useExecutionEngine<DPExecutionState>(trace, { initialSpeed: 1 });
  const currentStep = engine.currentStep;
  const runtimeState = currentStep?.state;

  const rawCode =
    DP_SNIPPETS[algorithm]?.[activeLanguage] ??
    DP_SNIPPETS.knapsack.python;

  const activeLine = currentStep?.codeLine ?? 1;

  const activeCell = runtimeState?.activeCell;
  const isCellActive = (r: number, c: number) =>
    activeCell && activeCell[0] === r && activeCell[1] === c;

  const isCellDependent = (r: number, c: number) =>
    runtimeState?.dependentCells.some(([dr, dc]) => dr === r && dc === c);

  const currentMeta = ALGORITHMS.find((a) => a.id === algorithm) || ALGORITHMS[0];

  const actions: VisuAlgoAction[] = [
    {
      id: "run",
      label: "Solve DP",
      onClick: () => {
        handleRun(algorithm);
        setTimeout(() => engine.play(), 50);
      },
    },
    {
      id: "reset",
      label: "Reset Table",
      onClick: () => {
        setTrace(createTrace(algorithm));
        engine.reset();
      },
    },
  ];

  return (
    <VisuAlgoShell
      title="Dynamic Programming Visualizer"
      category="Algorithms"
      subVariants={ALGORITHMS.map((algo) => ({
        id: algo.id,
        label: `${algo.name} (${algo.type})`,
        active: algorithm === algo.id,
      }))}
      activeSubVariant={algorithm}
      onSelectSubVariant={(id) => {
        const nextAlgo = id as DPAlgorithmType;
        setAlgorithm(nextAlgo);
        setTrace(createTrace(nextAlgo));
        engine.reset();
      }}
      actions={actions}
      statusBadge={
        engine.isPlaying
          ? "Computing"
          : runtimeState?.finalAnswer !== null && runtimeState?.finalAnswer !== undefined
          ? "Solved"
          : "Ready"
      }
      statusExplanation={
        currentStep?.explanation ||
        runtimeState?.phaseDescription ||
        "Click Solve DP to step through overlapping subproblems."
      }
      complexityBadge={currentMeta.complexity}
      code={rawCode}
      activeCodeLines={[activeLine]}
      currentStep={engine.currentStepIndex}
      totalSteps={engine.totalSteps}
      isPlaying={engine.isPlaying}
      speed={engine.speed}
      onPlay={engine.play}
      onPause={engine.pause}
      onStepForward={engine.next}
      onStepBackward={engine.previous}
      onGoToStart={engine.jumpToStart}
      onGoToEnd={engine.jumpToEnd}
      onSeek={engine.jumpTo}
      onSpeedChange={(spd) => engine.setSpeed(spd)}
    >
      {/* Full-stage Interactive Stage */}
      <div className="w-full h-full flex flex-col items-center justify-center p-6 select-none relative overflow-x-auto">
        {/* Recurrence Relation Formula Floating Tag */}
        {runtimeState?.formula && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border px-4 py-1.5 rounded-full shadow-md text-xs font-mono">
            <Calculator className="w-4 h-4 text-primary" />
            <span className="text-foreground">{runtimeState.formula}</span>
          </div>
        )}

        {/* DP Table */}
        <div className="inline-block border border-border rounded-xl overflow-hidden shadow-lg bg-card max-w-4xl">
          <table className="border-collapse text-xs">
            {/* Column Headers */}
            <thead>
              <tr className="bg-muted/70 border-b border-border">
                <th className="p-3 font-mono text-muted-foreground border-r border-border text-center font-bold">
                  #
                </th>
                {runtimeState?.table.colLabels.map((col, cIdx) => (
                  <th
                    key={cIdx}
                    className="p-3 font-mono font-semibold text-foreground border-r border-border last:border-r-0 min-w-[58px] text-center"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {runtimeState?.table.rowLabels.map((rowLabel, rIdx) => (
                <tr
                  key={rIdx}
                  className={cn(
                    "border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                  )}
                >
                  {/* Row Label */}
                  <td className="p-2.5 font-mono font-semibold bg-muted/40 text-foreground border-r border-border text-center">
                    {rowLabel}
                  </td>

                  {/* Row Cells */}
                  {runtimeState.table.grid[rIdx]?.map((val: string | number | null, cIdx: number) => {
                    const active = isCellActive(rIdx, cIdx);
                    const dep = isCellDependent(rIdx, cIdx);
                    const filled = val !== null && val !== undefined;

                    return (
                      <td
                        key={cIdx}
                        className={cn(
                          "p-3 font-mono text-center border-r border-border last:border-r-0 min-w-[58px] transition-all duration-200",
                          active
                            ? "bg-primary text-primary-foreground font-bold scale-105 shadow-md ring-2 ring-primary/40"
                            : dep
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold ring-1 ring-amber-500/50"
                            : filled
                            ? "text-foreground font-medium"
                            : "text-muted-foreground/30 font-light"
                        )}
                      >
                        {filled ? val : "·"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Optimal Result Badge */}
        {runtimeState?.finalAnswer !== null && runtimeState?.finalAnswer !== undefined && (
          <div className="mt-6 flex items-center gap-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-5 py-2 rounded-full border border-emerald-500/30 font-bold text-sm shadow-md animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-4 h-4" />
            Optimal Subproblem Solution: {runtimeState.finalAnswer}
          </div>
        )}
      </div>
    </VisuAlgoShell>
  );
}
