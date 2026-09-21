"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ArrayOperationType, ArrayState } from "@/core/array/types";
import { DEFAULT_INITIAL_ARRAY } from "@/core/array/random";
import { createArrayState } from "@/core/array/validation";
import { defaultArrayAdapter } from "@/core/array/array-adapter";
import { getArrayOperationSourceCodes } from "@/core/array/code-snippets";
import {
  createAccessTrace,
  createUpdateTrace,
  createInsertTrace,
  createDeleteTrace,
  createLinearSearchTrace,
  createCompareTrace,
  createSwapTrace,
  createBubbleSortTrace,
} from "@/core/array/trace-generators";
import { useExecutionEngine } from "@/core/execution/hooks/use-execution-engine";
import { useVisualizationState } from "@/core/visualization/hooks/use-visualization-state";
import { useExecutionView } from "@/core/synchronization/hooks/use-execution-view";
import type { SupportedLanguage } from "@/core/synchronization/types";
import type { PlaybackSpeed } from "@/core/engine/types";
import { VisuAlgoShell, VisuAlgoAction } from "../visualgo-shell";
import { ArrayRenderer } from "./array-renderer";
import { Search, Plus, Trash2, Edit3, ArrowUpDown, Shuffle, Eye } from "lucide-react";

export interface ArrayVisualizerShellProps {
  initialValues?: readonly number[];
  className?: string;
}

export function ArrayVisualizerShell({
  initialValues = DEFAULT_INITIAL_ARRAY,
  className,
}: ArrayVisualizerShellProps) {
  // 1. Array State & Operation Selection
  const [arrayValues, setArrayValues] = React.useState<readonly number[]>(initialValues);
  const [currentOperation, setCurrentOperation] = React.useState<ArrayOperationType>("bubble-sort");
  const [activeLanguage, setActiveLanguage] = React.useState<SupportedLanguage>("python");

  // Track operation parameters
  const [currentParams, setCurrentParams] = React.useState<Record<string, string | number>>({});

  // 2. Canonical ArrayState creation
  const arrayState = React.useMemo(() => {
    return createArrayState(arrayValues);
  }, [arrayValues]);

  // 3. Deterministic Trace Generation based on Operation & Parameters
  const trace = React.useMemo(() => {
    switch (currentOperation) {
      case "access": {
        const idx = Number(currentParams.index ?? 0);
        return createAccessTrace(arrayState, idx);
      }
      case "update": {
        const idx = Number(currentParams.index ?? 0);
        const val = Number(currentParams.value ?? 99);
        return createUpdateTrace(arrayState, idx, val);
      }
      case "insert": {
        const idx = Number(currentParams.index ?? arrayState.items.length);
        const val = Number(currentParams.value ?? 42);
        return createInsertTrace(arrayState, idx, val);
      }
      case "delete": {
        const idx = Number(currentParams.index ?? 0);
        return createDeleteTrace(arrayState, idx);
      }
      case "linear-search": {
        const target = Number(currentParams.target ?? (arrayValues[3] ?? 23));
        return createLinearSearchTrace(arrayState, target);
      }
      case "compare": {
        return createCompareTrace(arrayState, 0, Math.min(1, arrayState.items.length - 1));
      }
      case "swap": {
        return createSwapTrace(arrayState, 0, Math.min(1, arrayState.items.length - 1));
      }
      case "bubble-sort":
      default:
        return createBubbleSortTrace(arrayState);
    }
  }, [currentOperation, arrayState, currentParams, arrayValues]);

  // 4. Authoritative Execution Engine
  const engine = useExecutionEngine<ArrayState>(trace, { initialSpeed: 1 });

  // 5. Visualization State Engine derivation
  const { visualizationState, resolvedHighlights } = useVisualizationState<ArrayState>({
    adapter: defaultArrayAdapter,
    runtimeState: engine.controller.getRuntimeState(),
  });

  // 6. Source code snippets for synchronization
  const sourceCodes = React.useMemo(() => {
    return getArrayOperationSourceCodes(currentOperation);
  }, [currentOperation]);

  // 7. Synchronized Execution View Context
  const executionView = useExecutionView<ArrayState>({
    runtimeState: engine.controller.getRuntimeState(),
    language: activeLanguage,
    sourceCodes,
    visualizationState,
  });

  // VisuAlgo Actions Dock configuration
  const actions: VisuAlgoAction[] = [
    {
      id: "bubble-sort",
      label: "Sort",
      icon: ArrowUpDown,
      description: "Sort the array using Bubble Sort",
      onExecute: () => {
        setCurrentOperation("bubble-sort");
        setCurrentParams({});
        engine.reset();
        engine.play();
      },
    },
    {
      id: "linear-search",
      label: "Search",
      icon: Search,
      description: "Search for a value in the array",
      params: [
        {
          name: "target",
          label: "Target (v)",
          type: "number",
          defaultValue: arrayValues[2] ?? 36,
          placeholder: "Value to search",
        },
      ],
      presets: [
        { label: "Find First", values: { target: arrayValues[0] ?? 15 } },
        { label: "Find Mid", values: { target: arrayValues[Math.floor(arrayValues.length / 2)] ?? 48 } },
        { label: "Not Present", values: { target: 999 } },
      ],
      onExecute: (params) => {
        setCurrentOperation("linear-search");
        setCurrentParams(params);
        engine.reset();
        engine.play();
      },
    },
    {
      id: "insert",
      label: "Insert",
      icon: Plus,
      description: "Insert an element at index i",
      params: [
        {
          name: "index",
          label: "Index (i)",
          type: "number",
          defaultValue: 0,
          min: 0,
          max: arrayValues.length,
        },
        {
          name: "value",
          label: "Value (v)",
          type: "number",
          defaultValue: 42,
          placeholder: "Value",
        },
      ],
      presets: [
        { label: "Insert Head (i=0)", values: { index: 0, value: 5 } },
        { label: "Insert Tail", values: { index: arrayValues.length, value: 99 } },
      ],
      onExecute: (params) => {
        setCurrentOperation("insert");
        setCurrentParams(params);
        engine.reset();
        engine.play();
      },
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      description: "Delete element at index i",
      params: [
        {
          name: "index",
          label: "Index (i)",
          type: "number",
          defaultValue: 0,
          min: 0,
          max: Math.max(0, arrayValues.length - 1),
        },
      ],
      presets: [
        { label: "Delete Head (i=0)", values: { index: 0 } },
        { label: "Delete Tail", values: { index: Math.max(0, arrayValues.length - 1) } },
      ],
      onExecute: (params) => {
        setCurrentOperation("delete");
        setCurrentParams(params);
        engine.reset();
        engine.play();
      },
    },
    {
      id: "access",
      label: "Access",
      icon: Eye,
      description: "Direct O(1) index access",
      params: [
        {
          name: "index",
          label: "Index (i)",
          type: "number",
          defaultValue: 0,
          min: 0,
          max: Math.max(0, arrayValues.length - 1),
        },
      ],
      presets: [
        { label: "Index 0", values: { index: 0 } },
        { label: "Index 3", values: { index: Math.min(3, arrayValues.length - 1) } },
      ],
      onExecute: (params) => {
        setCurrentOperation("access");
        setCurrentParams(params);
        engine.reset();
        engine.play();
      },
    },
    {
      id: "update",
      label: "Update",
      icon: Edit3,
      description: "Update value at index i",
      params: [
        {
          name: "index",
          label: "Index (i)",
          type: "number",
          defaultValue: 0,
          min: 0,
          max: Math.max(0, arrayValues.length - 1),
        },
        {
          name: "value",
          label: "New Value (v)",
          type: "number",
          defaultValue: 88,
        },
      ],
      onExecute: (params) => {
        setCurrentOperation("update");
        setCurrentParams(params);
        engine.reset();
        engine.play();
      },
    },
    {
      id: "randomize",
      label: "Randomize",
      icon: Shuffle,
      description: "Generate new randomized array values",
      onExecute: () => {
        const randomized = Array.from({ length: 8 }, () => Math.floor(Math.random() * 85) + 10);
        setArrayValues(randomized);
        engine.reset();
      },
    },
    {
      id: "create",
      label: "Create",
      icon: Plus,
      description: "Initialize or set custom array elements",
      params: [
        {
          name: "input",
          label: "Values",
          type: "text",
          placeholder: "comma separated (e.g. 50, 60, 70)",
          defaultValue: arrayValues.join(", "),
        },
      ],
      presets: [
        { label: "Default", values: { input: "10, 20, 30" } },
        { label: "Random 8", values: { input: "34, 12, 89, 55, 23, 76, 45, 91" } },
      ],
      onExecute: (params) => {
        const val = String(params.input ?? "");
        const parsed = val
          .split(",")
          .map((s: string) => parseInt(s.trim(), 10))
          .filter((n: number) => !isNaN(n));
        if (parsed.length > 0) {
          setArrayValues(parsed);
          engine.reset();
        }
      },
    },
  ];

  // Sub-variants
  const subVariants = [
    {
      id: "bubble-sort",
      label: "Bubble Sort",
      active: currentOperation === "bubble-sort",
      onSelect: () => {
        setCurrentOperation("bubble-sort");
        setCurrentParams({});
        engine.reset();
      },
    },
    {
      id: "linear-search",
      label: "Linear Search",
      active: currentOperation === "linear-search",
      onSelect: () => {
        setCurrentOperation("linear-search");
        setCurrentParams({ target: arrayValues[2] ?? 36 });
        engine.reset();
      },
    },
    {
      id: "access",
      label: "O(1) Access",
      active: currentOperation === "access",
      onSelect: () => {
        setCurrentOperation("access");
        setCurrentParams({ index: 0 });
        engine.reset();
      },
    },
  ];

  return (
    <VisuAlgoShell
      title="Array Visualizer"
      category="Data Structures"
      subVariants={subVariants}
      currentAction={engine.currentStep?.operation || "Ready"}
      stepExplanation={engine.currentStep?.explanation || "Select an array operation to execute."}
      whyExplanation={undefined}
      timeComplexity={
        currentOperation === "access"
          ? "O(1)"
          : currentOperation === "linear-search"
          ? "O(n)"
          : currentOperation === "bubble-sort"
          ? "O(n²)"
          : "O(n)"
      }
      spaceComplexity="O(1)"
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
      code={executionView.sourceCode}
      activeCodeLines={executionView.activeCodeLines}
      language={activeLanguage}
      onLanguageChange={setActiveLanguage}
      className={className}
    >
      {/* Full-Stage Array Canvas Stage */}
      <div className="flex flex-col items-center justify-center gap-6 w-full max-w-5xl py-8">
        <ArrayRenderer
          visualizationState={visualizationState}
          resolvedHighlights={resolvedHighlights}
          speed={engine.speed}
        />
      </div>
    </VisuAlgoShell>
  );
}
