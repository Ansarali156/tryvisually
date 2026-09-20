"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { CollisionStrategy, HashTableOperationType } from "@/core/hash-table/types";
import { HASH_TABLE_OPERATIONS } from "@/core/hash-table/types";
import {
  validateKey,
  validateValue,
  DEFAULT_HASH_ENTRIES,
} from "@/core/hash-table/validation";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import {
  Shuffle,
  RotateCcw,
  Play,
  PlusCircle,
  Search,
  RefreshCw,
  Trash2,
  HelpCircle,
  Hash,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export interface HashTableOperationBarProps {
  strategy: CollisionStrategy;
  onSelectStrategy: (strategy: CollisionStrategy) => void;
  currentOperation: HashTableOperationType;
  onSelectOperation: (op: HashTableOperationType) => void;
  onExecuteOperation: (params: Record<string, string | number>) => void;
  onResetSample: () => void;
  onInsertRandom: (key: string, value: string) => void;
  size: number;
  capacity: number;
  loadFactor: number;
  className?: string;
}

const SAMPLE_NAMES = ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank", "Grace", "Heidi", "Judy"];

export function HashTableOperationBar({
  strategy,
  onSelectStrategy,
  currentOperation,
  onSelectOperation,
  onExecuteOperation,
  onResetSample,
  onInsertRandom,
  size,
  capacity,
  loadFactor,
  className,
}: HashTableOperationBarProps) {
  // Input states
  const [keyInput, setKeyInput] = React.useState("Frank");
  const [valueInput, setValueInput] = React.useState("50");
  const [updateValueInput, setUpdateValueInput] = React.useState("99");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
  }, [currentOperation, strategy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    switch (currentOperation) {
      case "insert": {
        const kVal = validateKey(keyInput);
        if (!kVal.isValid) {
          setError(kVal.error || "Invalid key");
          return;
        }
        const vVal = validateValue(valueInput);
        if (!vVal.isValid) {
          setError(vVal.error || "Invalid value");
          return;
        }
        onExecuteOperation({ key: kVal.data!, value: vVal.data! });
        break;
      }
      case "search":
      case "delete":
      case "contains": {
        const kVal = validateKey(keyInput);
        if (!kVal.isValid) {
          setError(kVal.error || "Invalid key");
          return;
        }
        onExecuteOperation({ key: kVal.data! });
        break;
      }
      case "update": {
        const kVal = validateKey(keyInput);
        if (!kVal.isValid) {
          setError(kVal.error || "Invalid key");
          return;
        }
        const vVal = validateValue(updateValueInput);
        if (!vVal.isValid) {
          setError(vVal.error || "Invalid new value");
          return;
        }
        onExecuteOperation({ key: kVal.data!, newValue: vVal.data! });
        break;
      }
      case "size":
      case "clear":
        onExecuteOperation({});
        break;
    }
  };

  const handleGenerateRandom = () => {
    const randomName = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
    const randomScore = String(Math.floor(Math.random() * 90) + 10);
    setKeyInput(randomName);
    setValueInput(randomScore);
    onInsertRandom(randomName, randomScore);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-surface-900 space-y-4",
        className
      )}
    >
      {/* Top Bar: Collision Strategy Dropdown & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
            Strategy:
          </span>
          <div className="flex items-center gap-1 p-1 bg-surface-100 dark:bg-surface-950 rounded-xl">
            <button
              type="button"
              onClick={() => onSelectStrategy("chaining")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all select-none",
                strategy === "chaining"
                  ? "bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              Separate Chaining
            </button>
            <button
              type="button"
              onClick={() => onSelectStrategy("linear-probing")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all select-none",
                strategy === "linear-probing"
                  ? "bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              Linear Probing
            </button>
            <button
              type="button"
              onClick={() => onSelectStrategy("quadratic-probing")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all select-none",
                strategy === "quadratic-probing"
                  ? "bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              Quadratic Probing
            </button>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
          <span>
            Size: <strong className="text-brand-600 dark:text-brand-400">{size}</strong>/{capacity}
          </span>
          <span>
            Load Factor:{" "}
            <strong
              className={cn(
                loadFactor > 0.7 ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-slate-200"
              )}
            >
              {loadFactor}
            </strong>
          </span>
        </div>
      </div>

      {/* Operation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
        {HASH_TABLE_OPERATIONS.map((op) => {
          const isActive = currentOperation === op.id;
          const getIcon = () => {
            switch (op.id) {
              case "insert":
                return <PlusCircle className="h-3.5 w-3.5" />;
              case "search":
                return <Search className="h-3.5 w-3.5" />;
              case "update":
                return <RefreshCw className="h-3.5 w-3.5" />;
              case "delete":
                return <Trash2 className="h-3.5 w-3.5" />;
              case "contains":
                return <HelpCircle className="h-3.5 w-3.5" />;
              case "size":
                return <Hash className="h-3.5 w-3.5" />;
              case "clear":
                return <RotateCcw className="h-3.5 w-3.5" />;
            }
          };

          return (
            <button
              key={op.id}
              type="button"
              onClick={() => onSelectOperation(op.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0",
                isActive
                  ? "bg-brand-600 text-white font-semibold shadow-xs"
                  : "bg-surface-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-surface-950 dark:text-slate-400 dark:hover:bg-surface-800 dark:hover:text-white"
              )}
            >
              {getIcon()}
              <span>{op.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Contextual Operation Controls Form */}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 pt-1">
        {/* Key Input */}
        {(currentOperation === "insert" ||
          currentOperation === "search" ||
          currentOperation === "update" ||
          currentOperation === "delete" ||
          currentOperation === "contains") && (
          <div className="flex items-center gap-1.5">
            <label htmlFor="ht-key" className="text-xs font-semibold text-slate-500 font-mono">
              Key:
            </label>
            <input
              id="ht-key"
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="e.g. Alice"
              maxLength={16}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-800 dark:bg-surface-950 dark:text-slate-200 w-28"
            />
          </div>
        )}

        {/* Value Input for Insert */}
        {currentOperation === "insert" && (
          <div className="flex items-center gap-1.5">
            <label htmlFor="ht-val" className="text-xs font-semibold text-slate-500 font-mono">
              Val:
            </label>
            <input
              id="ht-val"
              type="text"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              placeholder="e.g. 25"
              maxLength={16}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-800 dark:bg-surface-950 dark:text-slate-200 w-28"
            />
          </div>
        )}

        {/* New Value Input for Update */}
        {currentOperation === "update" && (
          <div className="flex items-center gap-1.5">
            <label htmlFor="ht-new-val" className="text-xs font-semibold text-slate-500 font-mono">
              New:
            </label>
            <input
              id="ht-new-val"
              type="text"
              value={updateValueInput}
              onChange={(e) => setUpdateValueInput(e.target.value)}
              placeholder="e.g. 99"
              maxLength={16}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-800 dark:bg-surface-950 dark:text-slate-200 w-28"
            />
          </div>
        )}

        {/* Action Button */}
        <PrimaryButton type="submit" size="sm" className="gap-1.5">
          <Play className="h-3 w-3" />
          <span>Execute {currentOperation}</span>
        </PrimaryButton>

        {/* Quick Data Helpers */}
        <div className="ml-auto flex items-center gap-2">
          <SecondaryButton
            type="button"
            size="sm"
            onClick={handleGenerateRandom}
            className="gap-1 text-xs"
            title="Generate a random key/value pair"
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Random Entry</span>
          </SecondaryButton>

          <SecondaryButton
            type="button"
            size="sm"
            onClick={onResetSample}
            className="gap-1 text-xs text-slate-500"
            title="Reset to default sample dataset (Carol, Dave, Alice)"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Sample</span>
          </SecondaryButton>
        </div>
      </form>

      {/* Validation Feedback */}
      {error && (
        <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/60">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
