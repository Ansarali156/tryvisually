"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { StackOperationType } from "@/core/stack/types";
import { STACK_OPERATIONS } from "@/core/stack/types";
import { parseStackInput, MAX_STACK_SIZE } from "@/core/stack/validation";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import {
  Shuffle,
  Play,
  ArrowDownToLine,
  ArrowUpFromLine,
  Eye,
  HelpCircle,
  Hash,
  Trash2,
  AlertCircle,
  Layers,
} from "lucide-react";

export interface StackOperationBarProps {
  currentOperation: StackOperationType;
  onSelectOperation: (op: StackOperationType) => void;
  onApplyCustomStack: (values: number[]) => void;
  onExecuteOperation: (params: Record<string, number>) => void;
  stackLength: number;
  className?: string;
}

export function StackOperationBar({
  currentOperation,
  onSelectOperation,
  onApplyCustomStack,
  onExecuteOperation,
  stackLength,
  className,
}: StackOperationBarProps) {
  // Custom stack input state
  const [stackInputText, setStackInputText] = React.useState("");
  const [stackInputError, setStackInputError] = React.useState<string | null>(null);

  // Operation specific parameter states
  const [pushValue, setPushValue] = React.useState<number>(42);
  const [opError, setOpError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setOpError(null);
  }, [currentOperation]);

  const handleApplyCustomStack = (e: React.FormEvent) => {
    e.preventDefault();
    const result = parseStackInput(stackInputText);
    if (!result.isValid || !result.data) {
      setStackInputError(result.error || "Invalid stack input");
      return;
    }
    setStackInputError(null);
    onApplyCustomStack(result.data);
    setStackInputText("");
  };

  const handleGenerateRandom = () => {
    const len = Math.floor(Math.random() * 3) + 3; // 3 to 5 items
    const randomVals = Array.from({ length: len }, () => Math.floor(Math.random() * 90) + 10);
    setStackInputError(null);
    onApplyCustomStack(randomVals);
  };

  const handleTriggerOperation = () => {
    setOpError(null);

    switch (currentOperation) {
      case "push": {
        if (stackLength >= MAX_STACK_SIZE) {
          setOpError(`Stack has reached maximum display limit (${MAX_STACK_SIZE}).`);
          return;
        }
        onExecuteOperation({ value: pushValue });
        break;
      }
      case "pop": {
        if (stackLength === 0) {
          setOpError("Stack Underflow: Cannot pop from an empty stack.");
          return;
        }
        onExecuteOperation({});
        break;
      }
      case "peek": {
        if (stackLength === 0) {
          setOpError("Stack is empty: Cannot peek into an empty stack.");
          return;
        }
        onExecuteOperation({});
        break;
      }
      case "isEmpty":
      case "size":
      case "clear": {
        onExecuteOperation({});
        break;
      }
    }
  };

  const getOpIcon = (type: StackOperationType) => {
    switch (type) {
      case "push":
        return ArrowDownToLine;
      case "pop":
        return ArrowUpFromLine;
      case "peek":
        return Eye;
      case "isEmpty":
        return HelpCircle;
      case "size":
        return Hash;
      case "clear":
        return Trash2;
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-surface-900 space-y-4",
        className
      )}
    >
      {/* 1. Custom Stack Input Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <form onSubmit={handleApplyCustomStack} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={stackInputText}
            onChange={(e) => setStackInputText(e.target.value)}
            placeholder="Custom stack, e.g. 10, 20, 30 (bottom to top, max 15)"
            className="flex-1 h-9 px-3 text-xs rounded-lg border border-slate-200 bg-surface-50 dark:border-slate-700 dark:bg-surface-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
          />
          <PrimaryButton type="submit" size="sm" className="whitespace-nowrap">
            Load Stack
          </PrimaryButton>
        </form>

        <SecondaryButton
          type="button"
          onClick={handleGenerateRandom}
          size="sm"
          className="gap-1.5 whitespace-nowrap justify-center"
        >
          <Shuffle className="h-3.5 w-3.5" />
          <span>Random Stack</span>
        </SecondaryButton>
      </div>

      {stackInputError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{stackInputError}</span>
        </div>
      )}

      {/* 2. Operations Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Stack Operations (LIFO)
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Layers className="h-3.5 w-3.5 text-brand-600" />
            <span>Size: {stackLength}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {STACK_OPERATIONS.map((op) => {
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
                title={op.description}
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
          {currentOperation === "push" && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Push Value:
              </label>
              <input
                type="number"
                value={pushValue}
                onChange={(e) => setPushValue(parseInt(e.target.value, 10) || 0)}
                className="w-20 h-8 px-2 text-xs font-mono text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

          {currentOperation === "pop" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Remove and return the element currently at the TOP of the stack.
            </span>
          )}

          {currentOperation === "peek" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              View the value of the TOP element without modifying the stack.
            </span>
          )}

          {currentOperation === "isEmpty" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Inspect whether the stack contains zero elements.
            </span>
          )}

          {currentOperation === "size" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Query total count of items currently stored in the stack.
            </span>
          )}

          {currentOperation === "clear" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Empty the stack completely.
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
