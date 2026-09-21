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
import { VisuAlgoShell, type VisuAlgoAction } from "@/components/visualizer/visualgo-shell";
import { Check, X, Search, Sparkles } from "lucide-react";

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

  const runSearch = React.useCallback(
    (targetVal: number, arr: number[] = currentArray) => {
      const newTrace =
        algorithm === "binary-search"
          ? generateBinarySearchTrace(arr, targetVal)
          : generateLinearSearchTrace(arr, targetVal);
      setTrace(newTrace);
    },
    [algorithm, currentArray]
  );

  const engine = useExecutionEngine<SearchingState>(trace, { initialSpeed: 1 });
  const currentStep = engine.currentStep;
  const runtimeState = currentStep?.state;

  // Code synchronization
  const rawCode =
    SEARCHING_SNIPPETS[algorithm]?.[activeLanguage] ??
    SEARCHING_SNIPPETS["binary-search"].python;

  const activeLine = currentStep?.codeLine ?? 1;

  // VisuAlgo Actions
  const actions: VisuAlgoAction[] = [
    {
      id: "search",
      label: "Search",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Target Value (v)</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="w-20 px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={() => {
                const val = parseInt(targetInput, 10) || 57;
                runSearch(val);
                setTimeout(() => engine.play(), 100);
              }}
              className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Go
            </button>
          </div>
          <div className="pt-2 border-t border-border/50">
            <div className="text-[11px] text-muted-foreground mb-1">Quick Presets:</div>
            <div className="flex flex-wrap gap-1">
              {[15, 57, 91, 99].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setTargetInput(val.toString());
                    runSearch(val);
                    setTimeout(() => engine.play(), 100);
                  }}
                  className="px-2 py-0.5 text-[11px] rounded bg-muted hover:bg-primary/20 hover:text-primary transition-colors font-mono"
                >
                  v={val}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "create",
      label: "Create",
      popoverContent: (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground">Array Elements</div>
          <input
            type="text"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
            placeholder="e.g. 10, 20, 30, 40"
            className="w-full px-2 py-1 text-xs rounded bg-muted/60 border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => {
                const randomArr = Array.from({ length: 8 }, () =>
                  Math.floor(Math.random() * 90) + 10
                );
                if (algorithm === "binary-search") randomArr.sort((a, b) => a - b);
                setArrayInput(randomArr.join(", "));
                runSearch(targetValue, randomArr);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded bg-muted hover:bg-primary/20 text-foreground transition-colors"
            >
              Random
            </button>
            <button
              onClick={() => {
                runSearch(targetValue);
              }}
              className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Go
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <VisuAlgoShell
      title="Searching Visualizer"
      category="Algorithms"
      subVariants={[
        {
          id: "linear-search",
          label: "Linear Search",
          active: algorithm === "linear-search",
        },
        {
          id: "binary-search",
          label: "Binary Search",
          active: algorithm === "binary-search",
        },
      ]}
      activeSubVariant={algorithm}
      onSelectSubVariant={(id) => {
        const nextAlgo = id as "linear-search" | "binary-search";
        setAlgorithm(nextAlgo);
        const newTrace =
          nextAlgo === "binary-search"
            ? generateBinarySearchTrace(currentArray, targetValue)
            : generateLinearSearchTrace(currentArray, targetValue);
        setTrace(newTrace);
      }}
      actions={actions}
      statusBadge={
        runtimeState?.foundIndex !== null && runtimeState?.foundIndex !== undefined
          ? runtimeState.foundIndex >= 0
            ? "Found"
            : "Not Found"
          : engine.isPlaying
          ? "Searching"
          : "Ready"
      }
      statusExplanation={
        currentStep?.explanation ||
        runtimeState?.phaseDescription ||
        "Select Search or Create from the bottom left dock to begin."
      }
      complexityBadge={algorithm === "binary-search" ? "O(log n)" : "O(n)"}
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
      className={className}
    >
      {/* Full-stage Interactive Stage */}
      <div className="w-full h-full flex flex-col items-center justify-center p-8 select-none">
        {/* Visual Array Track */}
        <div className="flex flex-wrap items-end justify-center gap-3 p-4 max-w-5xl">
          {runtimeState?.array.map((val, idx) => {
            const isCurrent = runtimeState.currentIndex === idx;
            const isMid = runtimeState.mid === idx;
            const isLow = runtimeState.low === idx;
            const isHigh = runtimeState.high === idx;
            const isFound = runtimeState.foundIndex === idx;
            const isEliminated = runtimeState.eliminatedIndices?.includes(idx);

            return (
              <div key={idx} className="flex flex-col items-center gap-2 transition-all">
                {/* Pointers Row */}
                <div className="h-6 flex items-center gap-1 text-[11px] font-bold">
                  {isLow && (
                    <span className="bg-sky-500/20 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/30">
                      LOW
                    </span>
                  )}
                  {isMid && (
                    <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                      MID
                    </span>
                  )}
                  {isHigh && (
                    <span className="bg-purple-500/20 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30">
                      HIGH
                    </span>
                  )}
                </div>

                {/* Element Box */}
                <div
                  className={cn(
                    "w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold text-lg transition-all duration-200 border-2",
                    isFound
                      ? "bg-emerald-500 text-white border-emerald-600 scale-110 shadow-xl shadow-emerald-500/25 ring-4 ring-emerald-500/30"
                      : isCurrent
                      ? "bg-primary text-primary-foreground border-primary scale-105 shadow-lg ring-4 ring-primary/20"
                      : isEliminated
                      ? "bg-muted/20 text-muted-foreground/30 border-dashed border-border"
                      : "bg-card text-card-foreground border-border shadow-sm hover:border-primary/50"
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

        {/* Floating Outcome Result */}
        {runtimeState?.foundIndex !== null && runtimeState?.foundIndex !== undefined && (
          <div className="mt-8 animate-in fade-in zoom-in duration-300">
            {runtimeState.foundIndex >= 0 ? (
              <div className="flex items-center gap-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-5 py-2.5 rounded-full border border-emerald-500/30 font-bold text-sm shadow-md">
                <Check className="w-5 h-5" />
                Target {runtimeState.target} Found at Index {runtimeState.foundIndex}!
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-rose-500/15 text-rose-600 dark:text-rose-400 px-5 py-2.5 rounded-full border border-rose-500/30 font-bold text-sm shadow-md">
                <X className="w-5 h-5" />
                Target {runtimeState.target} Not Present in Array (-1)
              </div>
            )}
          </div>
        )}
      </div>
    </VisuAlgoShell>
  );
}
