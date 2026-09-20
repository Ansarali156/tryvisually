"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TopicBar } from "./topic-bar";
import { StateInspector } from "./state-inspector";
import { ExplanationCard } from "./explanation-card";
import { CodePanel } from "@/components/ui/code-panel";
import { VisualizationPanel } from "@/components/ui/visualization-panel";
import { TimelineControls } from "@/components/ui/timeline-controls";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { playbackReducer, createInitialPlaybackState } from "@/core/engine/playback-reducer";
import { ExecutionTrace, TraceStep } from "@/core/engine/types";
import { Sparkles, Layers, Code, PlaySquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export interface VisualizerShellProps {
  initialTrace?: ExecutionTrace;
  selectedTopicId?: string;
  className?: string;
}

// Foundation dummy trace illustrating the architectural synchronization contract
const FOUNDATION_TRACE: ExecutionTrace = {
  algorithmId: "binary-search",
  algorithmName: "Binary Search",
  category: "Algorithms",
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
      action: "Initialize Search Pointers",
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
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = React.useState(selectedTopicId);
  const [mobileTab, setMobileTab] = React.useState("visualizer");

  React.useEffect(() => {
    setSelectedTopic(selectedTopicId);
  }, [selectedTopicId]);

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

  return (
    <div className={cn("flex flex-col min-h-screen bg-surface-100 dark:bg-surface-950", className)}>
      {/* Compact Horizontal Topic Bar */}
      <TopicBar currentSlug={selectedTopic || "binary-search"} />

      {/* Mobile Switcher Bar */}
      <div className="lg:hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-surface-900 p-2">
        <Tabs value={mobileTab} onValueChange={setMobileTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="visualizer" className="gap-1">
              <PlaySquare className="h-3 w-3" />
              <span>Visualization</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-1">
              <Code className="h-3 w-3" />
              <span>Code & State</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Visualizer Workspace Layout */}
      <div className="flex-1 p-3 md:p-4 max-w-7xl w-full mx-auto flex flex-col gap-3">
        {/* Desktop 2-Panel View / Mobile Responsive Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[360px] md:min-h-[420px]">
          {/* Main Visualization Canvas */}
          <div
            className={cn(
              "lg:col-span-7 xl:col-span-8 h-full flex flex-col",
              mobileTab !== "visualizer" && "hidden lg:flex"
            )}
          >
            <VisualizationPanel
              title={initialTrace.algorithmName}
              statusText={playbackState.isFinished ? "Completed" : playbackState.isPlaying ? "Running" : "Paused"}
              className="flex-1"
            >
              {/* Foundation Visualizer Rendering Viewport */}
              <div className="flex flex-col items-center justify-center gap-6 w-full">
                {/* Visual Array / Node Container */}
                <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-white dark:bg-surface-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
                  {currentStepData?.visualState.nodes.map((node, idx) => {
                    const pointer = currentStepData.visualState.pointers?.find(
                      (p) => p.index === idx || p.targetNodeId === node.id
                    );

                    const statusColors = {
                      default:
                        "bg-surface-50 border-slate-300 text-slate-700 dark:bg-surface-800 dark:border-slate-700 dark:text-slate-200",
                      active:
                        "bg-brand-600 border-brand-500 text-white shadow-md scale-105",
                      comparing:
                        "bg-amber-400 border-amber-500 text-slate-900 font-bold shadow-md scale-105",
                      swapping:
                        "bg-rose-500 border-rose-600 text-white",
                      sorted:
                        "bg-emerald-500 border-emerald-600 text-white font-bold",
                      visited:
                        "bg-sky-100 border-sky-400 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
                      inserted:
                        "bg-emerald-100 border-emerald-400 text-emerald-900",
                      deleted:
                        "bg-rose-100 border-rose-400 text-rose-900 line-through opacity-50",
                    };

                    return (
                      <div key={node.id} className="flex flex-col items-center gap-1">
                        {/* Pointer indicator */}
                        <div className="h-4 text-[10px] font-bold text-brand-600 dark:text-brand-400 font-mono">
                          {pointer?.label || " "}
                        </div>

                        {/* Node element */}
                        <div
                          className={cn(
                            "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg border-2 font-mono text-sm font-semibold transition-all duration-300",
                            statusColors[node.status] || statusColors.default
                          )}
                        >
                          {String(node.label)}
                        </div>

                        {/* Index indicator */}
                        <span className="text-[10px] font-mono text-slate-400">
                          {idx}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-slate-400 font-mono text-center">
                  Visualization synchronized directly with execution trace step #{playbackState.currentStep + 1}
                </div>
              </div>
            </VisualizationPanel>
          </div>

          {/* Right: Synchronized Code Panel (25% width on desktop) */}
          <div
            className={cn(
              "lg:col-span-5 xl:col-span-4 h-full",
              mobileTab !== "code" && "hidden lg:block"
            )}
          >
            <CodePanel
              code={initialTrace.code.source}
              language={initialTrace.code.language}
              activeLines={currentStepData?.codeLines || []}
              title={`${initialTrace.algorithmName} Code`}
              className="h-full min-h-[300px]"
            />
          </div>
        </div>

        {/* State / Variables Inspector */}
        <StateInspector
          variables={currentStepData?.variables || []}
          className="w-full"
        />

        {/* Playback Controls Toolbar */}
        <TimelineControls
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
          onSpeedChange={(speed) => dispatch({ type: "SET_SPEED", speed })}
        />

        {/* Explanation Card (WHAT and WHY) */}
        <ExplanationCard
          actionTitle={currentStepData?.action || "Ready"}
          explanation={currentStepData?.explanation || "Execution paused."}
          why={currentStepData?.why}
          timeComplexity={currentStepData?.complexitySnapshot?.time}
          spaceComplexity={currentStepData?.complexitySnapshot?.space}
        />
      </div>
    </div>
  );
}
