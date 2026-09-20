"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PriorityQueueOperationType } from "@/core/heap/types";
import { validatePriority, validateTaskName } from "@/core/heap/validation";
import {
  Plus,
  ArrowDownCircle,
  Eye,
  Trash2,
  Edit2,
  Layers,
} from "lucide-react";

export interface PriorityQueueOperationBarProps {
  currentOperation: PriorityQueueOperationType;
  mode: "min" | "max";
  itemCount: number;
  onSelectOperation: (op: PriorityQueueOperationType, params?: Record<string, unknown>) => void;
  disabled?: boolean;
  className?: string;
}

export function PriorityQueueOperationBar({
  currentOperation,
  mode,
  itemCount,
  onSelectOperation,
  disabled = false,
  className,
}: PriorityQueueOperationBarProps) {
  const [taskName, setTaskName] = React.useState<string>("Process Event");
  const [priorityVal, setPriorityVal] = React.useState<string>("2");
  const [inputError, setInputError] = React.useState<string | null>(null);

  const handleEnqueue = (e?: React.FormEvent) => {
    e?.preventDefault();
    const taskValidation = validateTaskName(taskName);
    if (!taskValidation.isValid) {
      setInputError(taskValidation.error || "Invalid task name");
      return;
    }
    const priorityValidation = validatePriority(priorityVal);
    if (!priorityValidation.isValid) {
      setInputError(priorityValidation.error || "Invalid priority");
      return;
    }
    setInputError(null);
    onSelectOperation("enqueue", {
      task: taskValidation.sanitizedValue,
      priority: priorityValidation.sanitizedValue,
    });
  };

  const handleDequeue = () => {
    setInputError(null);
    onSelectOperation("dequeue");
  };

  const handlePeek = () => {
    setInputError(null);
    onSelectOperation("peek");
  };

  const handleSize = () => {
    setInputError(null);
    onSelectOperation("size");
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
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={currentOperation === "dequeue" ? "primary" : "outline"}
          onClick={handleDequeue}
          disabled={disabled || itemCount === 0}
          className="gap-1.5 h-8 text-xs font-medium"
        >
          <ArrowDownCircle className="w-3.5 h-3.5 text-amber-500" />
          Dequeue Highest Priority
        </Button>

        <Button
          size="sm"
          variant={currentOperation === "peek" ? "primary" : "outline"}
          onClick={handlePeek}
          disabled={disabled || itemCount === 0}
          className="gap-1.5 h-8 text-xs font-medium"
        >
          <Eye className="w-3.5 h-3.5 text-sky-500" />
          Peek Top
        </Button>

        <Button
          size="sm"
          variant={currentOperation === "size" ? "primary" : "outline"}
          onClick={handleSize}
          disabled={disabled}
          className="gap-1.5 h-8 text-xs font-medium"
        >
          <Layers className="w-3.5 h-3.5 text-purple-500" />
          Check Size
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleClear}
          disabled={disabled || itemCount === 0}
          className="gap-1.5 h-8 text-xs font-medium text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </Button>
      </div>

      {/* Enqueue Form */}
      <form
        onSubmit={handleEnqueue}
        className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 border-t border-border/40"
      >
        <Input
          type="text"
          placeholder="Task name (e.g. Render Frame)"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          disabled={disabled}
          className="h-8 text-xs flex-1 min-w-[140px]"
        />
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground font-mono">Pri:</span>
          <Input
            type="number"
            placeholder="1-999"
            value={priorityVal}
            onChange={(e) => setPriorityVal(e.target.value)}
            disabled={disabled}
            className="h-8 text-xs font-mono w-20"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          variant={currentOperation === "enqueue" ? "primary" : "secondary"}
          disabled={disabled}
          className="gap-1 h-8 text-xs px-3"
        >
          <Plus className="w-3.5 h-3.5" />
          Enqueue Task
        </Button>
      </form>

      {inputError && (
        <p className="text-xs text-destructive font-medium animate-shake">
          {inputError}
        </p>
      )}
    </div>
  );
}
