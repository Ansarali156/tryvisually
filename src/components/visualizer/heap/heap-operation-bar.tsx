"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { HeapOperationType, HeapType } from "@/core/heap/types";
import { HEAP_OPERATIONS } from "@/core/heap/types";
import { validateHeapValue } from "@/core/heap/validation";
import {
  Plus,
  ArrowDownCircle,
  Eye,
  Trash2,
  Edit2,
  RefreshCw,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export interface HeapOperationBarProps {
  currentOperation: HeapOperationType;
  heapType: HeapType;
  heapSize: number;
  onSelectOperation: (op: HeapOperationType, params?: Record<string, unknown>) => void;
  disabled?: boolean;
  className?: string;
}

export function HeapOperationBar({
  currentOperation,
  heapType,
  heapSize,
  onSelectOperation,
  disabled = false,
  className,
}: HeapOperationBarProps) {
  const [insertVal, setInsertVal] = React.useState<string>("15");
  const [deleteIdx, setDeleteIdx] = React.useState<string>("0");
  const [updateIdx, setUpdateIdx] = React.useState<string>("0");
  const [updateVal, setUpdateVal] = React.useState<string>("25");
  const [buildValues, setBuildValues] = React.useState<string>("45, 12, 89, 34, 23, 7");
  const [inputError, setInputError] = React.useState<string | null>(null);

  const handleInsert = (e?: React.FormEvent) => {
    e?.preventDefault();
    const validation = validateHeapValue(insertVal);
    if (!validation.isValid) {
      setInputError(validation.error || "Invalid integer");
      return;
    }
    setInputError(null);
    onSelectOperation("insert", { value: validation.sanitizedValue });
  };

  const handleExtractRoot = () => {
    setInputError(null);
    onSelectOperation("extract-root");
  };

  const handlePeek = () => {
    setInputError(null);
    onSelectOperation("peek");
  };

  const handleDelete = (e?: React.FormEvent) => {
    e?.preventDefault();
    const idx = parseInt(deleteIdx, 10);
    if (isNaN(idx) || idx < 0 || idx >= heapSize) {
      setInputError(`Index must be between 0 and ${Math.max(0, heapSize - 1)}`);
      return;
    }
    setInputError(null);
    onSelectOperation("delete", { index: idx });
  };

  const handleUpdate = (e?: React.FormEvent) => {
    e?.preventDefault();
    const idx = parseInt(updateIdx, 10);
    if (isNaN(idx) || idx < 0 || idx >= heapSize) {
      setInputError(`Index must be between 0 and ${Math.max(0, heapSize - 1)}`);
      return;
    }
    const validation = validateHeapValue(updateVal);
    if (!validation.isValid) {
      setInputError(validation.error || "Invalid integer value");
      return;
    }
    setInputError(null);
    onSelectOperation("update", { index: idx, value: validation.sanitizedValue });
  };

  const handleBuildHeap = (e?: React.FormEvent) => {
    e?.preventDefault();
    const parsed = buildValues
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10));

    if (parsed.length === 0 || parsed.some(isNaN)) {
      setInputError("Please enter comma-separated numbers (e.g. 40, 10, 30)");
      return;
    }
    if (parsed.length > 15) {
      setInputError("Maximum 15 numbers allowed for clear visualization");
      return;
    }
    setInputError(null);
    onSelectOperation("build-heap", { values: parsed });
  };

  const handleHeapify = () => {
    setInputError(null);
    onSelectOperation("heapify");
  };

  const handleClear = () => {
    setInputError(null);
    onSelectOperation("clear");
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/60 p-3 sm:p-4 backdrop-blur-sm shadow-sm space-y-3",
        className
      )}
    >
      {/* Top Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={currentOperation === "extract-root" ? "primary" : "outline"}
          onClick={handleExtractRoot}
          disabled={disabled || heapSize === 0}
          className="gap-1.5 h-8 text-xs font-medium"
        >
          <ArrowDownCircle className="w-3.5 h-3.5 text-amber-500" />
          Extract Root
        </Button>

        <Button
          size="sm"
          variant={currentOperation === "peek" ? "primary" : "outline"}
          onClick={handlePeek}
          disabled={disabled || heapSize === 0}
          className="gap-1.5 h-8 text-xs font-medium"
        >
          <Eye className="w-3.5 h-3.5 text-sky-500" />
          Peek Root
        </Button>

        <Button
          size="sm"
          variant={currentOperation === "heapify" ? "primary" : "outline"}
          onClick={handleHeapify}
          disabled={disabled || heapSize <= 1}
          className="gap-1.5 h-8 text-xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
          Heapify (Sift Down All)
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleClear}
          disabled={disabled || heapSize === 0}
          className="gap-1.5 h-8 text-xs font-medium text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </Button>
      </div>

      {/* Operation Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-border/40">
        {/* 1. Insert */}
        <form onSubmit={handleInsert} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="Value..."
              value={insertVal}
              onChange={(e) => setInsertVal(e.target.value)}
              disabled={disabled}
              className="h-8 text-xs font-mono"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            variant={currentOperation === "insert" ? "primary" : "secondary"}
            disabled={disabled}
            className="gap-1 h-8 text-xs px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            Insert
          </Button>
        </form>

        {/* 2. Delete / Update */}
        <form onSubmit={handleDelete} className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Index..."
            value={deleteIdx}
            onChange={(e) => setDeleteIdx(e.target.value)}
            disabled={disabled || heapSize === 0}
            className="h-8 text-xs font-mono w-24"
          />
          <Button
            type="submit"
            size="sm"
            variant={currentOperation === "delete" ? "primary" : "secondary"}
            disabled={disabled || heapSize === 0}
            className="gap-1 h-8 text-xs px-3"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            Delete Idx
          </Button>
        </form>

        {/* 3. Build Heap from array */}
        <form onSubmit={handleBuildHeap} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="e.g. 40, 20, 10, 50"
            value={buildValues}
            onChange={(e) => setBuildValues(e.target.value)}
            disabled={disabled}
            className="h-8 text-xs font-mono flex-1"
          />
          <Button
            type="submit"
            size="sm"
            variant={currentOperation === "build-heap" ? "primary" : "secondary"}
            disabled={disabled}
            className="gap-1 h-8 text-xs px-3"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            Build Heap
          </Button>
        </form>
      </div>

      {inputError && (
        <p className="text-xs text-destructive font-medium animate-shake">
          {inputError}
        </p>
      )}
    </div>
  );
}
