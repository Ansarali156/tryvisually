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
import { VisuAlgoShell, VisuAlgoAction } from "../visualgo-shell";
import { Play, Shuffle, Edit3, ArrowUpDown } from "lucide-react";
import type { PlaybackSpeed } from "@/core/engine/types";

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

  // Sub-variants for top bar
  const subVariants = ALGORITHMS.map((algo) => ({
    id: algo.id,
    label: `${algo.name} (${algo.complexity})`,
    active: algorithm === algo.id,
    onSelect: () => {
      setAlgorithm(algo.id);
      const newTrace = createTrace(algo.id, currentArray);
      setTrace(newTrace);
    },
  }));

  // Actions for VisuAlgo bottom-left dock
  const actions: VisuAlgoAction[] = [
    {
      id: "sort",
      label: "Sort",
      icon: Play,
      description: "Start or resume sorting execution",
      onExecute: () => {
        engine.play();
      },
    },
    {
      id: "create",
      label: "Create",
      icon: Edit3,
      description: "Define custom array or choose presets",
      params: [
        {
          name: "input",
          label: "Numbers (comma separated)",
          type: "text",
          defaultValue: arrayInput,
          placeholder: "e.g. 48, 15, 82, 36",
        },
      ],
      presets: [
        { label: "Random 8", values: { input: [34, 12, 89, 55, 23, 76, 45, 91].join(", ") } },
        { label: "Nearly Sorted", values: { input: [10, 20, 40, 30, 50, 60, 80, 70].join(", ") } },
        { label: "Reversed", values: { input: [90, 80, 70, 60, 50, 40, 30, 20].join(", ") } },
      ],
      onExecute: (params) => {
        const val = String(params.input ?? arrayInput);
        setArrayInput(val);
        const matches = val.match(/-?\d+/g);
        const parsed = matches ? matches.map((m) => parseInt(m, 10)).filter((n) => !isNaN(n)) : [];
        const finalArr = parsed.length > 0 ? parsed.slice(0, 20) : DEFAULT_ARRAY;
        setTrace(createTrace(algorithm, finalArr));
      },
    },
    {
      id: "shuffle",
      label: "Shuffle",
      icon: Shuffle,
      description: "Randomize array elements",
      onExecute: () => {
        const shuffled = [...currentArray].sort(() => Math.random() - 0.5);
        setArrayInput(shuffled.join(", "));
        setTrace(createTrace(algorithm, shuffled));
      },
    },
  ];

  const currentAlgoObj = ALGORITHMS.find((a) => a.id === algorithm) || ALGORITHMS[0];

  return (
    <VisuAlgoShell
      title="Sorting Visualizer"
      category="Sorting Algorithms"
      subVariants={subVariants}
      manualInput={{
        label: "Array",
        placeholder: "e.g. 48, 15, 82, 36, 64, 21",
        defaultValue: arrayInput,
        onSubmit: (val) => {
          setArrayInput(val);
          const matches = val.match(/-?\d+/g);
          const parsed = matches ? matches.map((m) => parseInt(m, 10)).filter((n) => !isNaN(n)) : [];
          const finalArr = parsed.length > 0 ? parsed.slice(0, 20) : DEFAULT_ARRAY;
          setTrace(createTrace(algorithm, finalArr));
        },
        presets: [
          { label: "Random 8", value: [34, 12, 89, 55, 23, 76, 45, 91].join(", ") },
          { label: "Nearly Sorted", value: [10, 20, 40, 30, 50, 60, 80, 70].join(", ") },
          { label: "Reversed", value: [90, 80, 70, 60, 50, 40, 30, 20].join(", ") },
        ],
      }}
      currentAction={runtimeState?.phaseDescription || `${currentAlgoObj.name}`}
      stepExplanation={currentStep?.explanation || `Ready to sort ${currentArray.length} elements using ${currentAlgoObj.name}.`}
      whyExplanation={undefined}
      timeComplexity={currentAlgoObj.complexity}
      spaceComplexity={algorithm === "merge-sort" ? "O(n)" : "O(1)"}
      currentStep={engine.currentStepIndex}
      totalSteps={engine.totalSteps}
      isPlaying={engine.isPlaying}
      speed={engine.speed as PlaybackSpeed}
      onPlay={engine.play}
      onPause={engine.pause}
      onStepForward={engine.next}
      onStepBackward={engine.previous}
      onGoToStart={engine.jumpToStart}
      onGoToEnd={engine.jumpToEnd}
      onSeek={(step) => engine.jumpTo(step)}
      onSpeedChange={(spd) => engine.setSpeed(spd)}
      actions={actions}
      code={rawCode}
      activeCodeLines={[activeLine]}
      language={activeLanguage}
      onLanguageChange={setActiveLanguage}
      className={className}
    >
      {/* Full-Stage Dominant Sorting Canvas */}
      <div className="w-full max-w-5xl h-full flex flex-col justify-center items-center gap-8 py-6 select-none">
        {/* Bars Viewport */}
        <div className="w-full flex items-end justify-center gap-3 sm:gap-4 md:gap-5 h-[340px] sm:h-[400px] px-4">
          {runtimeState?.array.map((val, idx) => {
            const isComparing = runtimeState.comparingIndices.includes(idx);
            const isSwapped = runtimeState.swappedIndices.includes(idx);
            const isSorted = runtimeState.sortedIndices.includes(idx);
            const isPivot = runtimeState.pivotIndex === idx;

            // Height percentage
            const heightPct = Math.max(14, Math.round((val / maxVal) * 92));

            return (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1 max-w-[64px] h-full justify-end">
                {/* Bar */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={cn(
                    "w-full rounded-t-xl transition-all duration-300 flex flex-col justify-between items-center py-2.5 text-xs font-mono font-bold shadow-md",
                    isPivot
                      ? "bg-purple-600 text-white ring-4 ring-purple-500/30"
                      : isSwapped
                      ? "bg-rose-500 text-white ring-4 ring-rose-500/40 scale-105"
                      : isComparing
                      ? "bg-amber-400 text-slate-950 ring-4 ring-amber-500/40 scale-105"
                      : isSorted
                      ? "bg-emerald-500 text-white shadow-emerald-500/20"
                      : "bg-slate-300 hover:bg-amber-500/80 text-slate-900 dark:bg-slate-700 dark:hover:bg-amber-500/80 dark:text-slate-100"
                  )}
                >
                  <span className="text-[11px] drop-shadow-xs font-bold">{val}</span>
                </div>

                {/* Index Tag */}
                <span className="text-[11px] font-mono text-slate-400">
                  [{idx}]
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80 pt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-400" />
            <span>Comparing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-500" />
            <span>Swapping</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>Sorted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-purple-600" />
            <span>Pivot</span>
          </div>
        </div>
      </div>
    </VisuAlgoShell>
  );
}
