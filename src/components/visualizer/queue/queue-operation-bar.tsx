"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { QueueOperationType, QueueVariant } from "@/core/queue/types";
import { QUEUE_OPERATIONS } from "@/core/queue/types";
import { parseQueueInput, MAX_QUEUE_CAPACITY } from "@/core/queue/validation";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import {
  Shuffle,
  Play,
  ArrowRightToLine,
  ArrowLeftFromLine,
  Eye,
  HelpCircle,
  Hash,
  Trash2,
  AlertCircle,
  Maximize2,
  Layers,
} from "lucide-react";

export interface QueueOperationBarProps {
  variant: QueueVariant;
  onSelectVariant: (v: QueueVariant) => void;
  currentOperation: QueueOperationType;
  onSelectOperation: (op: QueueOperationType) => void;
  onApplyCustomQueue: (values: number[]) => void;
  onExecuteOperation: (params: Record<string, number>) => void;
  queueLength: number;
  capacity: number;
  className?: string;
}

export function QueueOperationBar({
  variant,
  onSelectVariant,
  currentOperation,
  onSelectOperation,
  onApplyCustomQueue,
  onExecuteOperation,
  queueLength,
  capacity,
  className,
}: QueueOperationBarProps) {
  // Custom queue input state
  const [queueInputText, setQueueInputText] = React.useState("");
  const [queueInputError, setQueueInputError] = React.useState<string | null>(null);

  // Operation specific parameter states
  const [enqueueValue, setEnqueueValue] = React.useState<number>(42);
  const [opError, setOpError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setOpError(null);
  }, [currentOperation, variant]);

  const handleApplyCustomQueue = (e: React.FormEvent) => {
    e.preventDefault();
    const result = parseQueueInput(queueInputText, capacity);
    if (!result.isValid || !result.data) {
      setQueueInputError(result.error || "Invalid queue input");
      return;
    }
    setQueueInputError(null);
    onApplyCustomQueue(result.data);
    setQueueInputText("");
  };

  const handleGenerateRandom = () => {
    const len = Math.floor(Math.random() * 3) + 2; // 2 to 4 items
    const randomVals = Array.from({ length: len }, () => Math.floor(Math.random() * 90) + 10);
    setQueueInputError(null);
    onApplyCustomQueue(randomVals);
  };

  const handleTriggerOperation = () => {
    setOpError(null);

    switch (currentOperation) {
      case "enqueue": {
        if (queueLength >= capacity) {
          setOpError(`Queue Overflow: Queue is full (${queueLength}/${capacity} elements).`);
          return;
        }
        onExecuteOperation({ value: enqueueValue });
        break;
      }
      case "dequeue": {
        if (queueLength === 0) {
          setOpError("Queue Underflow: Cannot dequeue from an empty queue.");
          return;
        }
        onExecuteOperation({});
        break;
      }
      case "front": {
        if (queueLength === 0) {
          setOpError("Queue is empty: Cannot read FRONT of an empty queue.");
          return;
        }
        onExecuteOperation({});
        break;
      }
      case "rear": {
        if (queueLength === 0) {
          setOpError("Queue is empty: Cannot read REAR of an empty queue.");
          return;
        }
        onExecuteOperation({});
        break;
      }
      case "isEmpty":
      case "isFull":
      case "size":
      case "clear": {
        onExecuteOperation({});
        break;
      }
    }
  };

  const getOpIcon = (type: QueueOperationType) => {
    switch (type) {
      case "enqueue":
        return ArrowRightToLine;
      case "dequeue":
        return ArrowLeftFromLine;
      case "front":
        return Eye;
      case "rear":
        return Eye;
      case "isEmpty":
        return HelpCircle;
      case "isFull":
        return Maximize2;
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
      {/* 1. Variant Selector & Summary */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-surface-100 dark:bg-surface-950 rounded-xl">
          <button
            type="button"
            onClick={() => onSelectVariant("linear")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none",
              variant === "linear"
                ? "bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Linear Queue
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
            Circular Queue
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
          <Layers className="h-3.5 w-3.5 text-brand-600" />
          <span>
            {queueLength} / {capacity} slots
          </span>
        </div>
      </div>

      {/* 2. Custom Input Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleApplyCustomQueue} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={queueInputText}
            onChange={(e) => setQueueInputText(e.target.value)}
            placeholder={`Custom queue, e.g. 10, 20, 30 (max ${capacity})`}
            className="flex-1 h-9 px-3 text-xs rounded-lg border border-slate-200 bg-surface-50 dark:border-slate-700 dark:bg-surface-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
          />
          <PrimaryButton type="submit" size="sm" className="whitespace-nowrap">
            Load Queue
          </PrimaryButton>
        </form>

        <SecondaryButton
          type="button"
          onClick={handleGenerateRandom}
          size="sm"
          className="gap-1.5 whitespace-nowrap justify-center"
        >
          <Shuffle className="h-3.5 w-3.5" />
          <span>Random Queue</span>
        </SecondaryButton>
      </div>

      {queueInputError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{queueInputError}</span>
        </div>
      )}

      {/* 3. Operations Selector Tabs */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Queue Operations (FIFO)
        </span>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {QUEUE_OPERATIONS.map((op) => {
            if (op.id === "isFull" && variant !== "circular") {
              return null; // Is Full is only for bounded circular queues
            }

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

      {/* 4. Contextual Operation Parameters Input */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-950/80 border border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {currentOperation === "enqueue" && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Enqueue Value:
              </label>
              <input
                type="number"
                value={enqueueValue}
                onChange={(e) => setEnqueueValue(parseInt(e.target.value, 10) || 0)}
                className="w-20 h-8 px-2 text-xs font-mono text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

          {currentOperation === "dequeue" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Remove and return the oldest element from the FRONT of the queue.
            </span>
          )}

          {currentOperation === "front" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              View the element at FRONT without removing it.
            </span>
          )}

          {currentOperation === "rear" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              View the most recently enqueued element at REAR.
            </span>
          )}

          {currentOperation === "isEmpty" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Check whether the queue contains zero elements.
            </span>
          )}

          {currentOperation === "isFull" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Check whether all {capacity} buffer slots are currently occupied.
            </span>
          )}

          {currentOperation === "size" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Query total count of elements currently stored in the queue.
            </span>
          )}

          {currentOperation === "clear" && (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Empty the queue completely.
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
