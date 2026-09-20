"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { SortingAlgorithmType, SortingState } from "@/core/sorting/types";
import {
  generateBubbleSortTrace,
  generateSelectionSortTrace,
  generateInsertionSortTrace,
  generateMergeSortTrace,
  generateQuickSortTrace,
} from "@/core/sorting/trace-generators";
import { SORTING_SNIPPETS } from "@/core/sorting/code-snippets";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import type { SupportedLanguage } from "@/core/synchronization/types";
import { TopicBar } from "@/components/visualizer/topic-bar";
import { TimelineControls } from "@/components/ui/timeline-controls";
import { CodeViewer } from "@/components/code/code-viewer";
import { VariablesPanel } from "@/components/execution/variables-panel";
import { ExplanationPanel } from "@/components/execution/explanation-panel";
import { Button } from "@/components/ui/button";
import type { PlaybackSpeed } from "@/core/engine/types";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Play, Shuffle } from "lucide-react";

interface Props {
  initialAlgorithm?: SortingAlgorithmType;
  className?: string;
}

const DEFAULT_ARRAY = [48, 15, 82, 36, 65, 23, 91, 54];

const ALGORITHMS: { id: SortingAlgorithmType; name: string; complexity: string }[] = [
  { id: "bubble-sort", name: "Bubble Sort", complexity: "O(n²)" },
  { id: "selection-sort", name: "Selection Sort", complexity: "O(n²)" },
  { id: "insertion-sort", name: "Insertion Sort", complexity: "O(n²)" },
  { id: "merge-sort", name: "Merge Sort", complexity: "O(n log n)" },
  { id: "quick-sort", name: "Quick Sort", complexity: "O(n log n)" },
];

export function SortingVisualizerShell({
  initialAlgorithm = "bubble-sort",
  className,
}: Props) {
  const [algorithm, setAlgorithm] = React.useState<SortingAlgorithmType>(initialAlgorithm);
  const [arrayInput, setArrayInput] = React.useState<string>(DEFAULT_ARRAY.join(", "));
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");

  const currentArray = React.useMemo(() => {
    const parsed = arrayInput
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return parsed.length > 0 ? parsed : DEFAULT_ARRAY;
  }, [arrayInput]);

  const createTrace = React.useCallback((algo: SortingAlgorithmType, arr: number[]) => {
    switch (algo) {
      case "bubble-sort":
        return generateBubbleSortTrace(arr);
      case "selection-sort":
        return generateSelectionSortTrace(arr);
      case "insertion-sort":
        return generateInsertionSortTrace(arr);
      case "merge-sort":
        return generateMergeSortTrace(arr);
      case "quick-sort":
        return generateQuickSortTrace(arr);
    }
  }, []);

  const [trace, setTrace] = React.useState(() => createTrace(algorithm, currentArray));

  const handleRun = React.useCallback(() => {
    setTrace(createTrace(algorithm, currentArray));
  }, [algorithm, currentArray, createTrace]);

  const handleShuffle = () => {
    const shuffled = [...currentArray].sort(() => Math.random() - 0.5);
    setArrayInput(shuffled.join(", "));
    setTrace(createTrace(algorithm, shuffled));
  };

  const engine = useExecutionEngine<SortingState>(trace, { initialSpeed: 1 });
  const currentStep = engine.currentStep;
  const runtimeState = currentStep?.state;

  // Max value for proportional bar height
  const maxVal = React.useMemo(() => {
    if (!runtimeState || runtimeState.array.length === 0) return 100;
    return Math.max(...runtimeState.array, 10);
  }, [runtimeState]);

  // Synchronized Code
  const rawCode =
    SORTING_SNIPPETS[algorithm]?.[activeLanguage] ??
    SORTING_SNIPPETS["bubble-sort"].python;

  const activeLine = currentStep?.codeLine ?? 1;

  return (
    <div className={cn("min-h-screen flex flex-col bg-background text-foreground", className)}>
      <TopicBar />

      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-[1700px] w-full mx-auto gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ArrowUpDown className="w-6 h-6 text-primary" />
              Sorting Visualizer
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Watch comparisons, swaps, partitions, and divide-and-conquer steps in real time.
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
                  setTrace(createTrace(algo.id, currentArray));
                }}
              >
                {algo.name} ({algo.complexity})
              </Button>
            ))}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg border border-border">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Array:</span>
              <Input
                type="text"
                value={arrayInput}
                onChange={(e) => setArrayInput(e.target.value)}
                placeholder="Comma separated numbers"
                className="w-56 h-8 text-xs bg-background"
              />
            </div>

            <Button size="sm" variant="outline" onClick={handleShuffle} className="h-8 gap-1.5">
              <Shuffle className="w-3.5 h-3.5" />
              Shuffle
            </Button>

            <Button size="sm" onClick={handleRun} className="h-8 gap-1.5">
              <Play className="w-3.5 h-3.5" />
              Sort
            </Button>
          </div>

          <div className="text-xs font-medium text-muted-foreground">
            {runtimeState?.phaseDescription || "Ready to sort"}
          </div>
        </div>

        {/* Visualizer Canvas & Code Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Canvas Area */}
          <div className="lg:col-span-8 flex flex-col gap-3 min-h-[520px]">
            <div className="flex-1 relative rounded-xl border border-border bg-card p-6 flex flex-col justify-end items-center min-h-[460px] overflow-x-auto">
              {/* Vertical Bar Chart Representation */}
              <div className="w-full flex items-end justify-center gap-2 md:gap-4 h-[320px] px-4">
                {runtimeState?.array.map((val, idx) => {
                  const isComparing = runtimeState.comparingIndices.includes(idx);
                  const isSwapped = runtimeState.swappedIndices.includes(idx);
                  const isSorted = runtimeState.sortedIndices.includes(idx);
                  const isPivot = runtimeState.pivotIndex === idx;

                  // Height percentage
                  const heightPct = Math.max(12, Math.round((val / maxVal) * 90));

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1 max-w-[56px]">
                      {/* Bar */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={cn(
                          "w-full rounded-t-lg transition-all duration-200 flex flex-col justify-between items-center py-2 text-xs font-bold shadow-sm",
                          isPivot
                            ? "bg-purple-500 text-white ring-4 ring-purple-500/30"
                            : isSwapped
                            ? "bg-rose-500 text-white ring-4 ring-rose-500/30 scale-105"
                            : isComparing
                            ? "bg-amber-500 text-white ring-4 ring-amber-500/30 scale-105"
                            : isSorted
                            ? "bg-emerald-500 text-white"
                            : "bg-primary/80 hover:bg-primary text-primary-foreground"
                        )}
                      >
                        <span className="text-[11px] drop-shadow-sm">{val}</span>
                      </div>

                      {/* Index Tag */}
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {idx}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-muted-foreground border-t border-border pt-3 w-full">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                  <span>Comparing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-rose-500" />
                  <span>Swapping / Shifting</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-purple-500" />
                  <span>Pivot</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span>Sorted</span>
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
                title="Sorting Step"
                explanation={currentStep?.explanation ?? "Click Sort to start sorting."}
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
