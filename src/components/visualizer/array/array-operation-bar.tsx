"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ArrayOperationType } from "@/core/array/types";
import { ARRAY_OPERATIONS } from "@/core/array/types";
import { parseArrayInput, validateIndex, MAX_ARRAY_SIZE } from "@/core/array/validation";
import { generateRandomArray } from "@/core/array/random";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import {
  Shuffle,
  Play,
  Search,
  PlusCircle,
  Trash2,
  Edit3,
  MousePointer,
  ArrowRightLeft,
  ArrowDownUp,
  AlertCircle,
} from "lucide-react";

export interface ArrayOperationBarProps {
  currentOperation: ArrayOperationType;
  onSelectOperation: (op: ArrayOperationType) => void;
  onApplyCustomArray: (values: number[]) => void;
  onExecuteOperation: (params: Record<string, number>) => void;
  arrayLength: number;
  className?: string;
}

export function ArrayOperationBar({
  currentOperation,
  onSelectOperation,
  onApplyCustomArray,
  onExecuteOperation,
  arrayLength,
  className,
}: ArrayOperationBarProps) {
  // Custom array input state
  const [arrayInputText, setArrayInputText] = React.useState("");
  const [arrayInputError, setArrayInputError] = React.useState<string | null>(null);

  // Operation specific parameter states
  const [targetIndex, setTargetIndex] = React.useState<number>(0);
  const [targetValue, setTargetValue] = React.useState<number>(42);
  const [searchTarget, setSearchTarget] = React.useState<number>(23);
  const [opError, setOpError] = React.useState<string | null>(null);

  // Reset operation error on operation switch
  React.useEffect(() => {
    setOpError(null);
  }, [currentOperation]);

  const handleApplyCustomArray = (e: React.FormEvent) => {
    e.preventDefault();
    const result = parseArrayInput(arrayInputText);
    if (!result.isValid || !result.data) {
      setArrayInputError(result.error || "Invalid array input");
      return;
    }
    setArrayInputError(null);
    onApplyCustomArray(result.data);
    setArrayInputText("");
  };

  const handleGenerateRandom = () => {
    const random = generateRandomArray({ minLength: 8, maxLength: 10, minValue: 5, maxValue: 90 });
    setArrayInputError(null);
    onApplyCustomArray(random);
  };

  const handleTriggerOperation = () => {
    setOpError(null);

    switch (currentOperation) {
      case "access": {
        const check = validateIndex(targetIndex, arrayLength);
        if (!check.isValid) {
          setOpError(check.error || "Invalid index");
          return;
        }
        onExecuteOperation({ index: targetIndex });
        break;
      }
      case "update": {
        const check = validateIndex(targetIndex, arrayLength);
        if (!check.isValid) {
          setOpError(check.error || "Invalid index");
          return;
        }
        onExecuteOperation({ index: targetIndex, newValue: targetValue });
        break;
      }
      case "insert": {
        const check = validateIndex(targetIndex, arrayLength, true);
        if (!check.isValid) {
          setOpError(check.error || "Invalid insertion index");
          return;
        }
        if (arrayLength >= MAX_ARRAY_SIZE) {
          setOpError(`Array has reached maximum supported limit (${MAX_ARRAY_SIZE}).`);
          return;
        }
        onExecuteOperation({ index: targetIndex, value: targetValue });
        break;
      }
      case "delete": {
        const check = validateIndex(targetIndex, arrayLength);
        if (!check.isValid) {
          setOpError(check.error || "Invalid deletion index");
          return;
        }
        onExecuteOperation({ index: targetIndex });
        break;
      }
      case "linear-search": {
        onExecuteOperation({ target: searchTarget });
        break;
      }
      case "bubble-sort": {
        onExecuteOperation({});
        break;
      }
      case "compare": {
        const check1 = validateIndex(0, arrayLength);
        const check2 = validateIndex(Math.min(1, arrayLength - 1), arrayLength);
        if (!check1.isValid || !check2.isValid) {
          setOpError("Array must have at least 2 elements to compare.");
          return;
        }
        onExecuteOperation({ indexA: 0, indexB: Math.min(1, arrayLength - 1) });
        break;
      }
      case "swap": {
        const check1 = validateIndex(0, arrayLength);
        const check2 = validateIndex(Math.min(1, arrayLength - 1), arrayLength);
        if (!check1.isValid || !check2.isValid) {
          setOpError("Array must have at least 2 elements to swap.");
          return;
        }
        onExecuteOperation({ indexA: 0, indexB: Math.min(1, arrayLength - 1) });
        break;
      }
    }
  };

  const getOpIcon = (type: ArrayOperationType) => {
    switch (type) {
      case "access":
        return MousePointer;
      case "update":
        return Edit3;
      case "insert":
        return PlusCircle;
      case "delete":
        return Trash2;
      case "linear-search":
        return Search;
      case "compare":
        return ArrowRightLeft;
      case "swap":
        return ArrowRightLeft;
      case "bubble-sort":
        return ArrowDownUp;
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-surface-900 space-y-4",
        className
      )}
    >
      {/* 1. Custom Array Input Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <form onSubmit={handleApplyCustomArray} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={arrayInputText}
            onChange={(e) => setArrayInputText(e.target.value)}
            placeholder="Custom array, e.g. 10, 20, 30, 40 (max 30)"
            className="flex-1 h-9 px-3 text-xs rounded-lg border border-slate-200 bg-surface-50 dark:border-slate-700 dark:bg-surface-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
          />
          <PrimaryButton type="submit" size="sm" className="whitespace-nowrap">
            Load Array
          </PrimaryButton>
        </form>

        <SecondaryButton
          type="button"
          onClick={handleGenerateRandom}
          size="sm"
          className="gap-1.5 whitespace-nowrap justify-center"
        >
          <Shuffle className="h-3.5 w-3.5" />
          <span>Random Array</span>
        </SecondaryButton>
      </div>

      {arrayInputError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{arrayInputError}</span>
        </div>
      )}

      {/* 2. Operations Selector Tabs */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Array Operations
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {ARRAY_OPERATIONS.map((op) => {
            const Icon = getOpIcon(op.id);
            const isSelected = currentOperation === op.id;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => onSelectOperation(op.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors select-none",
                  isSelected
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-800"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{op.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Contextual Operation Parameters Input */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-950/80 border border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {currentOperation === "access" && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Index:
              </label>
              <input
                type="number"
                min={0}
                max={Math.max(0, arrayLength - 1)}
                value={targetIndex}
                onChange={(e) => setTargetIndex(parseInt(e.target.value, 10) || 0)}
                className="w-16 h-8 px-2 text-xs font-mono text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

          {currentOperation === "update" && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Index:
                </label>
                <input
                  type="number"
                  min={0}
                  max={Math.max(0, arrayLength - 1)}
                  value={targetIndex}
                  onChange={(e) => setTargetIndex(parseInt(e.target.value, 10) || 0)}
                  className="w-16 h-8 px-2 text-xs font-mono text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900 focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  New Value:
                </label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseInt(e.target.value, 10) || 0)}
                  className="w-20 h-8 px-2 text-xs font-mono text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </>
          )}

          {currentOperation === "insert" && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Insert Index:
                </label>
                <input
                  type="number"
                  min={0}
                  max={arrayLength}
                  value={targetIndex}
                  onChange={(e) => setTargetIndex(parseInt(e.target.value, 10) || 0)}
                  className="w-16 h-8 px-2 text-xs font-mono text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900 focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Value:
                </label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseInt(e.target.value, 10) || 0)}
                  className="w-20 h-8 px-2 text-xs font-mono text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </>
          )}

          {currentOperation === "delete" && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Delete Index:
              </label>
              <input
                type="number"
                min={0}
                max={Math.max(0, arrayLength - 1)}
                value={targetIndex}
                onChange={(e) => setTargetIndex(parseInt(e.target.value, 10) || 0)}
                className="w-16 h-8 px-2 text-xs font-mono text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

          {currentOperation === "linear-search" && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Target Value:
              </label>
              <input
                type="number"
                value={searchTarget}
                onChange={(e) => setSearchTarget(parseInt(e.target.value, 10) || 0)}
                className="w-20 h-8 px-2 text-xs font-mono text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

          {currentOperation === "bubble-sort" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Run step-by-step Bubble Sort across all {arrayLength} array elements.
            </span>
          )}

          {(currentOperation === "compare" || currentOperation === "swap") && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Demonstrates operation on first two elements (indices 0 and 1).
            </span>
          )}
        </div>

        <PrimaryButton
          type="button"
          onClick={handleTriggerOperation}
          size="sm"
          className="gap-1.5"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Generate Trace</span>
        </PrimaryButton>
      </div>

      {opError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{opError}</span>
        </div>
      )}
    </div>
  );
}
