"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { VisuAlgoShell, VisuAlgoAction } from "./visualgo-shell";
import { playbackReducer, createInitialPlaybackState } from "@/core/engine/playback-reducer";
import { ExecutionTrace, TraceStep, PlaybackSpeed } from "@/core/engine/types";
import { Search, RotateCcw } from "lucide-react";
import type { SupportedLanguage } from "@/core/synchronization/types";

export interface VisualizerShellProps {
  initialTrace?: ExecutionTrace;
  selectedTopicId?: string;
  className?: string;
}

// Foundation trace for binary search
const FOUNDATION_TRACE: ExecutionTrace = {
  algorithmId: "binary-search",
  algorithmName: "Binary Search",
  category: "Searching Algorithms",
  code: {
    language: "typescript",
    source: `function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      return mid; // Found!
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1; // Not found
}`,
  },
  metadata: {
    totalSteps: 4,
    initialInput: { arr: [1, 3, 5, 7, 9, 11, 13], target: 7 },
    bestTimeComplexity: "O(1)",
    worstTimeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
  },
  steps: [
    {
      stepIndex: 0,
      action: "Initialize Pointers",
      explanation: "Set left pointer to index 0 and right pointer to index 6 (end of array).",
      why: "Binary search requires search boundaries covering the entire sorted sequence initially.",
      codeLines: [2, 3],
      variables: [
        { name: "left", value: 0, changed: true, type: "number" },
        { name: "right", value: 6, changed: true, type: "number" },
        { name: "target", value: 7, changed: false, type: "number" },
      ],
      visualState: {
        dataStructureType: "array",
        nodes: [
          { id: "0", label: 1, status: "default" },
          { id: "1", label: 3, status: "default" },
          { id: "2", label: 5, status: "default" },
          { id: "3", label: 7, status: "default" },
          { id: "4", label: 9, status: "default" },
          { id: "5", label: 11, status: "default" },
          { id: "6", label: 13, status: "default" },
        ],
        pointers: [
          { name: "left", index: 0, label: "L" },
          { name: "right", index: 6, label: "R" },
        ],
      },
      complexitySnapshot: { time: "O(1)", space: "O(1)" },
    },
    {
      stepIndex: 1,
      action: "Calculate Midpoint",
      explanation: "Calculate mid = floor((0 + 6) / 2) = 3. Inspect element at index 3.",
      why: "Halving the search space reduces remaining elements to examine exponentially.",
      codeLines: [6],
      variables: [
        { name: "left", value: 0, changed: false, type: "number" },
        { name: "right", value: 6, changed: false, type: "number" },
        { name: "mid", value: 3, changed: true, type: "number" },
        { name: "arr[mid]", value: 7, changed: true, type: "number" },
      ],
      visualState: {
        dataStructureType: "array",
        nodes: [
          { id: "0", label: 1, status: "default" },
          { id: "1", label: 3, status: "default" },
          { id: "2", label: 5, status: "default" },
          { id: "3", label: 7, status: "comparing" },
          { id: "4", label: 9, status: "default" },
          { id: "5", label: 11, status: "default" },
          { id: "6", label: 13, status: "default" },
        ],
        pointers: [
          { name: "left", index: 0, label: "L" },
          { name: "mid", index: 3, label: "M" },
          { name: "right", index: 6, label: "R" },
        ],
      },
      complexitySnapshot: { time: "O(1)", space: "O(1)" },
    },
    {
      stepIndex: 2,
      action: "Compare arr[mid] with Target",
      explanation: "arr[3] equals 7, which matches the target value 7 exactly.",
      why: "The target element has been found in the current midpoint position without needing further splits.",
      codeLines: [7, 8],
      variables: [
        { name: "arr[mid]", value: 7, changed: false, type: "number" },
        { name: "target", value: 7, changed: false, type: "number" },
        { name: "found", value: true, changed: true, type: "boolean" },
      ],
      visualState: {
        dataStructureType: "array",
        nodes: [
          { id: "0", label: 1, status: "default" },
          { id: "1", label: 3, status: "default" },
          { id: "2", label: 5, status: "default" },
          { id: "3", label: 7, status: "active" },
          { id: "4", label: 9, status: "default" },
          { id: "5", label: 11, status: "default" },
          { id: "6", label: 13, status: "default" },
        ],
        pointers: [
          { name: "match", index: 3, label: "★ Target" },
        ],
      },
      complexitySnapshot: { time: "O(log n)", space: "O(1)" },
    },
    {
      stepIndex: 3,
      action: "Return Index",
      explanation: "Return index 3. Algorithm execution complete.",
      why: "All conditions met; returning success index to caller.",
      codeLines: [8],
      variables: [
        { name: "returnValue", value: 3, changed: true, type: "number" },
      ],
      visualState: {
        dataStructureType: "array",
        nodes: [
          { id: "0", label: 1, status: "default" },
          { id: "1", label: 3, status: "default" },
          { id: "2", label: 5, status: "default" },
          { id: "3", label: 7, status: "sorted" },
          { id: "4", label: 9, status: "default" },
          { id: "5", label: 11, status: "default" },
          { id: "6", label: 13, status: "default" },
        ],
      },
      complexitySnapshot: { time: "O(log n)", space: "O(1)" },
    },
  ],
};

export function VisualizerShell({
  initialTrace = FOUNDATION_TRACE,
  selectedTopicId = "binary-search",
  className,
}: VisualizerShellProps) {
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("typescript");

  const [playbackState, dispatch] = React.useReducer(
    playbackReducer,
    initialTrace.steps.length,
    createInitialPlaybackState
  );

  // Playback timer effect
  React.useEffect(() => {
    if (!playbackState.isPlaying) return;

    const delayMs = 1200 / playbackState.speed;
    const timer = setTimeout(() => {
      dispatch({ type: "STEP_FORWARD" });
    }, delayMs);

    return () => clearTimeout(timer);
  }, [playbackState.isPlaying, playbackState.currentStep, playbackState.speed]);

  const currentStepData: TraceStep | undefined =
    initialTrace.steps[playbackState.currentStep];

  // VisuAlgo Actions
  const actions: VisuAlgoAction[] = [
    {
      id: "search",
      label: "Search",
      icon: Search,
      description: "Search for a value in the sorted array using Binary Search",
      params: [
        {
          name: "target",
          label: "Target value",
          type: "number",
          defaultValue: 7,
          placeholder: "e.g. 7",
        },
      ],
      presets: [
        { label: "Target: 7 (Found)", values: { target: 7 } },
        { label: "Target: 1 (Found)", values: { target: 1 } },
        { label: "Target: 13 (Found)", values: { target: 13 } },
        { label: "Target: 2 (Not Found)", values: { target: 2 } },
      ],
      onExecute: () => {
        dispatch({ type: "GO_TO_START" });
        dispatch({ type: "PLAY" });
      },
    },
    {
      id: "reset",
      label: "Reset",
      icon: RotateCcw,
      description: "Reset execution to step 0",
      onExecute: () => {
        dispatch({ type: "GO_TO_START" });
      },
    },
  ];

  const statusColors = {
    default: "bg-white border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200",
    active: "bg-amber-500 border-amber-600 text-slate-950 font-bold shadow-lg scale-110 ring-4 ring-amber-500/30",
    comparing: "bg-amber-400 border-amber-500 text-slate-950 font-bold shadow-lg scale-105 ring-4 ring-amber-500/30",
    swapping: "bg-rose-500 border-rose-600 text-white shadow-md scale-105",
    sorted: "bg-emerald-500 border-emerald-600 text-white font-bold shadow-md",
    visited: "bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
    inserted: "bg-emerald-100 border-emerald-400 text-emerald-900",
    deleted: "bg-rose-100 border-rose-400 text-rose-900 line-through opacity-50",
  };

  return (
    <VisuAlgoShell
      title={initialTrace.algorithmName}
      category={initialTrace.category}
      currentAction={currentStepData?.action || "Ready"}
      stepExplanation={currentStepData?.explanation || "Execution ready."}
      whyExplanation={currentStepData?.why}
      timeComplexity={currentStepData?.complexitySnapshot?.time || initialTrace.metadata?.worstTimeComplexity}
      spaceComplexity={currentStepData?.complexitySnapshot?.space || initialTrace.metadata?.spaceComplexity}
      currentStep={playbackState.currentStep}
      totalSteps={playbackState.totalSteps}
      isPlaying={playbackState.isPlaying}
      speed={playbackState.speed}
      onPlay={() => dispatch({ type: "PLAY" })}
      onPause={() => dispatch({ type: "PAUSE" })}
      onStepForward={() => dispatch({ type: "STEP_FORWARD" })}
      onStepBackward={() => dispatch({ type: "STEP_BACKWARD" })}
      onGoToStart={() => dispatch({ type: "GO_TO_START" })}
      onGoToEnd={() => dispatch({ type: "GO_TO_END" })}
      onSeek={(step) => dispatch({ type: "SEEK", step })}
      onSpeedChange={(speed) => dispatch({ type: "SET_SPEED", speed: speed as PlaybackSpeed })}
      actions={actions}
      code={initialTrace.code.source}
      activeCodeLines={currentStepData?.codeLines || []}
      language={activeLanguage}
      onLanguageChange={setActiveLanguage}
      className={className}
    >
      {/* Dominant VisuAlgo Canvas Viewport */}
      <div className="flex flex-col items-center justify-center gap-8 w-full max-w-4xl py-12 select-none">
        {/* Visual Array / Nodes */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 p-6 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl backdrop-blur-sm max-w-full">
          {currentStepData?.visualState.nodes.map((node, idx) => {
            const pointer = currentStepData.visualState.pointers?.find(
              (p) => p.index === idx || p.targetNodeId === node.id
            );

            return (
              <div key={node.id} className="flex flex-col items-center gap-1.5">
                {/* Pointer indicator */}
                <div className="h-5 text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  {pointer?.label || " "}
                </div>

                {/* Node element */}
                <div
                  className={cn(
                    "w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl border-2 font-mono text-base font-bold transition-all duration-300",
                    statusColors[node.status] || statusColors.default
                  )}
                >
                  {String(node.label)}
                </div>

                {/* Index indicator */}
                <span className="text-[11px] font-mono text-slate-400">
                  [{idx}]
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-amber-500" />
            <span>Target / Match</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-amber-400" />
            <span>Midpoint Inspection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600" />
            <span>Search Range</span>
          </div>
        </div>
      </div>
    </VisuAlgoShell>
  );
}
