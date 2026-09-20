"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  LinkedListOperationType,
  LinkedListVariant,
} from "@/core/linked-list/types";
import { LINKED_LIST_OPERATIONS } from "@/core/linked-list/types";
import {
  parseLinkedListInput,
  validateIndex,
  MAX_LINKED_LIST_SIZE,
} from "@/core/linked-list/validation";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import {
  Shuffle,
  Play,
  Search,
  PlusCircle,
  Trash2,
  Edit3,
  MousePointer,
  RotateCcw,
  Footprints,
  AlertCircle,
  GitCommit,
} from "lucide-react";

export interface LinkedListOperationBarProps {
  variant: LinkedListVariant;
  onSelectVariant: (v: LinkedListVariant) => void;
  currentOperation: LinkedListOperationType;
  onSelectOperation: (op: LinkedListOperationType) => void;
  onApplyCustomList: (values: number[]) => void;
  onExecuteOperation: (params: Record<string, number>) => void;
  listLength: number;
  className?: string;
}

export function LinkedListOperationBar({
  variant,
  onSelectVariant,
  currentOperation,
  onSelectOperation,
  onApplyCustomList,
  onExecuteOperation,
  listLength,
  className,
}: LinkedListOperationBarProps) {
  // Custom list input state
  const [listInputText, setListInputText] = React.useState("");
  const [listInputError, setListInputError] = React.useState<string | null>(null);

  // Operation specific parameter states
  const [targetIndex, setTargetIndex] = React.useState<number>(0);
  const [targetValue, setTargetValue] = React.useState<number>(42);
  const [searchTarget, setSearchTarget] = React.useState<number>(20);
  const [opError, setOpError] = React.useState<string | null>(null);

  // Reset operation error on operation switch
  React.useEffect(() => {
    setOpError(null);
  }, [currentOperation, variant]);

  const handleApplyCustomList = (e: React.FormEvent) => {
    e.preventDefault();
    const result = parseLinkedListInput(listInputText);
    if (!result.isValid || !result.data) {
      setListInputError(result.error || "Invalid list input");
      return;
    }
    setListInputError(null);
    onApplyCustomList(result.data);
    setListInputText("");
  };

  const handleGenerateRandom = () => {
    const len = Math.floor(Math.random() * 4) + 4; // 4 to 7 items
    const randomVals = Array.from({ length: len }, () => Math.floor(Math.random() * 90) + 10);
    setListInputError(null);
    onApplyCustomList(randomVals);
  };

  const handleTriggerOperation = () => {
    setOpError(null);

    switch (currentOperation) {
      case "traverse": {
        onExecuteOperation({});
        break;
      }
      case "search": {
        onExecuteOperation({ value: searchTarget });
        break;
      }
      case "access": {
        const check = validateIndex(targetIndex, listLength);
        if (!check.isValid) {
          setOpError(check.error || "Invalid index");
          return;
        }
        onExecuteOperation({ index: targetIndex });
        break;
      }
      case "insert-beginning": {
        if (listLength >= MAX_LINKED_LIST_SIZE) {
          setOpError(`List has reached maximum supported limit (${MAX_LINKED_LIST_SIZE}).`);
          return;
        }
        onExecuteOperation({ value: targetValue });
        break;
      }
      case "insert-end": {
        if (listLength >= MAX_LINKED_LIST_SIZE) {
          setOpError(`List has reached maximum supported limit (${MAX_LINKED_LIST_SIZE}).`);
          return;
        }
        onExecuteOperation({ value: targetValue });
        break;
      }
      case "insert-position": {
        if (listLength >= MAX_LINKED_LIST_SIZE) {
          setOpError(`List has reached maximum supported limit (${MAX_LINKED_LIST_SIZE}).`);
          return;
        }
        const check = validateIndex(targetIndex, listLength, true);
        if (!check.isValid) {
          setOpError(check.error || "Invalid insertion index");
          return;
        }
        onExecuteOperation({ index: targetIndex, value: targetValue });
        break;
      }
      case "delete-beginning": {
        if (listLength === 0) {
          setOpError("Cannot delete from an empty list.");
          return;
        }
        onExecuteOperation({});
        break;
      }
      case "delete-end": {
        if (listLength === 0) {
          setOpError("Cannot delete from an empty list.");
          return;
        }
        onExecuteOperation({});
        break;
      }
      case "delete-position": {
        if (listLength === 0) {
          setOpError("Cannot delete from an empty list.");
          return;
        }
        const check = validateIndex(targetIndex, listLength);
        if (!check.isValid) {
          setOpError(check.error || "Invalid deletion index");
          return;
        }
        onExecuteOperation({ index: targetIndex });
        break;
      }
      case "update": {
        if (listLength === 0) {
          setOpError("Cannot update an empty list.");
          return;
        }
        const check = validateIndex(targetIndex, listLength);
        if (!check.isValid) {
          setOpError(check.error || "Invalid update index");
          return;
        }
        onExecuteOperation({ index: targetIndex, value: targetValue });
        break;
      }
      case "reverse": {
        if (variant === "circular") {
          setOpError("Reversal is currently available for Singly and Doubly linked lists.");
          return;
        }
        onExecuteOperation({});
        break;
      }
    }
  };

  const getOpIcon = (type: LinkedListOperationType) => {
    switch (type) {
      case "traverse":
        return Footprints;
      case "search":
        return Search;
      case "access":
        return MousePointer;
      case "insert-beginning":
      case "insert-end":
      case "insert-position":
        return PlusCircle;
      case "delete-beginning":
      case "delete-end":
      case "delete-position":
        return Trash2;
      case "update":
        return Edit3;
      case "reverse":
        return RotateCcw;
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-surface-900 space-y-4",
        className
      )}
    >
      {/* 1. Variant Selector Tabs */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-surface-100 dark:bg-surface-950 rounded-xl">
          <button
            type="button"
            onClick={() => onSelectVariant("singly")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none",
              variant === "singly"
                ? "bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Singly Linked
          </button>
          <button
            type="button"
            onClick={() => onSelectVariant("doubly")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none",
              variant === "doubly"
                ? "bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Doubly Linked
          </button>
          <button
            type="button"
            onClick={() => onSelectVariant("circular")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none",
              variant === "circular"
                ? "bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Circular Linked
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <GitCommit className="h-3.5 w-3.5 text-brand-600" />
          <span>Length: {listLength}</span>
        </div>
      </div>

      {/* 2. Custom Input Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleApplyCustomList} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={listInputText}
            onChange={(e) => setListInputText(e.target.value)}
            placeholder="Custom list, e.g. 10, 20, 30, 40 (max 30)"
            className="flex-1 h-9 px-3 text-xs rounded-lg border border-slate-200 bg-surface-50 dark:border-slate-700 dark:bg-surface-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
          />
          <PrimaryButton type="submit" size="sm" className="whitespace-nowrap">
            Load List
          </PrimaryButton>
        </form>

        <SecondaryButton
          type="button"
          onClick={handleGenerateRandom}
          size="sm"
          className="gap-1.5 whitespace-nowrap justify-center"
        >
          <Shuffle className="h-3.5 w-3.5" />
          <span>Random List</span>
        </SecondaryButton>
      </div>

      {listInputError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{listInputError}</span>
        </div>
      )}

      {/* 3. Operations Selector Tabs */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Operations
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {LINKED_LIST_OPERATIONS.map((op) => {
            // If circular, disable reverse
            const isDisabled = variant === "circular" && op.id === "reverse";
            const Icon = getOpIcon(op.id);
            const isSelected = currentOperation === op.id;
            return (
              <button
                key={op.id}
                type="button"
                disabled={isDisabled}
                onClick={() => onSelectOperation(op.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors select-none",
                  isSelected
                    ? "bg-brand-600 text-white shadow-xs"
                    : isDisabled
                    ? "opacity-40 cursor-not-allowed text-slate-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-800"
                )}
                title={isDisabled ? "Reverse not applicable for Circular lists" : op.description}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{op.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Contextual Operation Parameters Input */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-950/80 border border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {currentOperation === "traverse" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Traverse the entire list from HEAD to {variant === "circular" ? "HEAD (full circle)" : "NULL"}.
            </span>
          )}

          {currentOperation === "search" && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Search Target:
              </label>
              <input
                type="number"
                value={searchTarget}
                onChange={(e) => setSearchTarget(parseInt(e.target.value, 10) || 0)}
                className="w-20 h-8 px-2 text-xs font-mono text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

          {currentOperation === "access" && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Index:
              </label>
              <input
                type="number"
                min={0}
                max={Math.max(0, listLength - 1)}
                value={targetIndex}
                onChange={(e) => setTargetIndex(parseInt(e.target.value, 10) || 0)}
                className="w-16 h-8 px-2 text-xs font-mono text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

          {(currentOperation === "insert-beginning" || currentOperation === "insert-end") && (
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
          )}

          {currentOperation === "insert-position" && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Position:
                </label>
                <input
                  type="number"
                  min={0}
                  max={listLength}
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

          {currentOperation === "delete-position" && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Delete Index:
              </label>
              <input
                type="number"
                min={0}
                max={Math.max(0, listLength - 1)}
                value={targetIndex}
                onChange={(e) => setTargetIndex(parseInt(e.target.value, 10) || 0)}
                className="w-16 h-8 px-2 text-xs font-mono text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

          {(currentOperation === "delete-beginning" || currentOperation === "delete-end") && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Delete node from the {currentOperation === "delete-beginning" ? "head" : "tail"} of the list.
            </span>
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
                  max={Math.max(0, listLength - 1)}
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

          {currentOperation === "reverse" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Reverse all pointer links in-place using 3 tracking pointers (prev, curr, next).
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
