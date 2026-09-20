"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  generateLinearSearchTrace,
  generateBinarySearchTrace,
  type SearchingState,
} from "@/core/searching/trace-generators";
import { SEARCHING_SNIPPETS } from "@/core/searching/code-snippets";
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
import { Search, Play, Check, X } from "lucide-react";

interface Props {
  initialAlgorithm?: "linear-search" | "binary-search";
  className?: string;
}

const DEFAULT_ARRAY = [15, 23, 38, 42, 57, 66, 79, 84, 91];

export function SearchingVisualizerShell({
  initialAlgorithm = "binary-search",
  className,
}: Props) {
  const [algorithm, setAlgorithm] = React.useState<"linear-search" | "binary-search">(
    initialAlgorithm
  );
  const [arrayInput, setArrayInput] = React.useState<string>(DEFAULT_ARRAY.join(", "));
  const [targetInput, setTargetInput] = React.useState<string>("57");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");

  // Normalized array
  const currentArray = React.useMemo(() => {
    const parsed = arrayInput
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    if (parsed.length === 0) return DEFAULT_ARRAY;
    return algorithm === "binary-search" ? [...parsed].sort((a, b) => a - b) : parsed;
  }, [arrayInput, algorithm]);

  const targetValue = parseInt(targetInput, 10) || 57;

  // Build deterministic trace
  const [trace, setTrace] = React.useState(() => {
    return algorithm === "binary-search"
      ? generateBinarySearchTrace(currentArray, targetValue)
      : generateLinearSearchTrace(currentArray, targetValue);
  });

  const handleRun = React.useCallback(() => {
    const newTrace =
      algorithm === "binary-search"
        ? generateBinarySearchTrace(currentArray, targetValue)
        : generateLinearSearchTrace(currentArray, targetValue);
    setTrace(newTrace);
  }, [algorithm, currentArray, targetValue]);

  const engine = useExecutionEngine<SearchingState>(trace, { initialSpeed: 1 });
  const currentStep = engine.currentStep;
  const runtimeState = currentStep?.state;

  // Code synchronization
  const rawCode =
    SEARCHING_SNIPPETS[algorithm]?.[activeLanguage] ??
    SEARCHING_SNIPPETS["binary-search"].python;

  const activeLine = currentStep?.codeLine ?? 1;

  return (
    <div className={cn("min-h-screen flex flex-col bg-background text-foreground", className)}>
      <TopicBar />

      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-[1700px] w-full mx-auto gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Search className="w-6 h-6 text-primary" />
              Searching Visualizer
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Observe search bounds, pointer mechanics, and step-by-step element comparisons.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={algorithm === "linear-search" ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                setAlgorithm("linear-search");
                setTrace(generateLinearSearchTrace(currentArray, targetValue));
              }}
            >
              Linear Search (O(n))
            </Button>
            <Button
              variant={algorithm === "binary-search" ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                setAlgorithm("binary-search");
                setTrace(generateBinarySearchTrace(currentArray, targetValue));
              }}
            >
              Binary Search (O(log n))
            </Button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg border border-border">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Target:</span>
              <Input
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="w-20 h-8 text-xs bg-background"
              />
            </div>

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

            <Button size="sm" onClick={handleRun} className="h-8 gap-1.5">
              <Play className="w-3.5 h-3.5" />
              Run Search
            </Button>
          </div>

          <div className="text-xs font-medium text-muted-foreground">
            {runtimeState?.phaseDescription || "Ready to execute"}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Canvas Area */}
          <div className="lg:col-span-8 flex flex-col gap-3 min-h-[500px]">
            <div className="flex-1 relative rounded-xl border border-border bg-card p-6 flex flex-col justify-center items-center min-h-[440px] overflow-x-auto">
              {/* Visual Array Track */}
              <div className="flex flex-wrap items-end justify-center gap-3 p-4">
                {runtimeState?.array.map((val, idx) => {
                  const isCurrent = runtimeState.currentIndex === idx;
                  const isMid = runtimeState.mid === idx;
                  const isLow = runtimeState.low === idx;
                  const isHigh = runtimeState.high === idx;
                  const isFound = runtimeState.foundIndex === idx;
                  const isEliminated = runtimeState.eliminatedIndices?.includes(idx);

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      {/* Pointers Row */}
                      <div className="h-6 flex items-center gap-1 text-[11px] font-bold">
                        {isLow && (
                          <span className="bg-sky-500/15 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/30">
                            LOW
                          </span>
                        )}
                        {isMid && (
                          <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                            MID
                          </span>
                        )}
                        {isHigh && (
                          <span className="bg-purple-500/15 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30">
                            HIGH
                          </span>
                        )}
                      </div>

                      {/* Element Box */}
                      <div
                        className={cn(
                          "w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold text-base transition-all duration-200 border-2",
                          isFound
                            ? "bg-emerald-500 text-white border-emerald-600 scale-105 shadow-lg shadow-emerald-500/25"
                            : isCurrent
                            ? "bg-primary text-primary-foreground border-primary scale-105 shadow-md ring-4 ring-primary/20"
                            : isEliminated
                            ? "bg-muted/30 text-muted-foreground/40 border-dashed border-border"
                            : "bg-muted/60 text-foreground border-border hover:border-primary/50"
                        )}
                      >
                        <span>{val}</span>
                      </div>

                      {/* Index Label */}
                      <span className="text-[11px] font-mono text-muted-foreground">
                        [{idx}]
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Result Badge */}
              {runtimeState?.foundIndex !== null && runtimeState?.foundIndex !== undefined && (
                <div className="mt-8">
                  {runtimeState.foundIndex >= 0 ? (
                    <div className="flex items-center gap-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/30 font-semibold text-sm">
                      <Check className="w-4 h-4" />
                      Target {runtimeState.target} Found at Index {runtimeState.foundIndex}!
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-rose-500/15 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-full border border-rose-500/30 font-semibold text-sm">
                      <X className="w-4 h-4" />
                      Target {runtimeState.target} Not Present in Array (-1)
                    </div>
                  )}
                </div>
              )}
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

          {/* Right Panel: Code & Variables */}
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
                title="Search Step"
                explanation={currentStep?.explanation ?? "Click Run to search."}
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
