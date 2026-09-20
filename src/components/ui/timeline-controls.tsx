import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Gauge,
} from "lucide-react";
import { Button } from "./button";
import { PlaybackSpeed } from "@/core/engine/types";

export interface TimelineControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onGoToStart: () => void;
  onGoToEnd: () => void;
  onSeek: (step: number) => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  className?: string;
}

export function TimelineControls({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onGoToStart,
  onGoToEnd,
  onSeek,
  onSpeedChange,
  className,
}: TimelineControlsProps) {
  const maxStep = Math.max(0, totalSteps - 1);
  const isAtStart = currentStep <= 0;
  const isAtEnd = currentStep >= maxStep;

  const speeds: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-surface-900 shadow-xs select-none",
        className
      )}
    >
      {/* Playback Action Buttons */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onGoToStart}
          disabled={isAtStart}
          title="Go to Beginning"
          aria-label="First step"
        >
          <SkipBack className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">First</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onStepBackward}
          disabled={isAtStart}
          title="Step Backward"
          aria-label="Previous step"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        {isPlaying ? (
          <Button
            variant="primary"
            size="sm"
            onClick={onPause}
            className="w-20"
            title="Pause Execution"
            aria-label="Pause"
          >
            <Pause className="h-3.5 w-3.5 fill-current" />
            <span>Pause</span>
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={onPlay}
            disabled={totalSteps <= 1}
            className="w-20"
            title="Play Execution"
            aria-label="Play"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Play</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onStepForward}
          disabled={isAtEnd}
          title="Step Forward"
          aria-label="Next step"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onGoToEnd}
          disabled={isAtEnd}
          title="Go to End"
          aria-label="Last step"
        >
          <span className="hidden sm:inline">Last</span>
          <SkipForward className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Scrubber / Progress Step Slider */}
      <div className="flex-1 min-w-[160px] flex items-center gap-3 px-2">
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
          Step <span className="font-semibold text-slate-800 dark:text-slate-200">{totalSteps > 0 ? currentStep + 1 : 0}</span> / {totalSteps}
        </span>
        <input
          type="range"
          min={0}
          max={maxStep}
          value={currentStep}
          onChange={(e) => onSeek(Number(e.target.value))}
          disabled={totalSteps <= 1}
          className="w-full h-1.5 bg-slate-200 dark:bg-surface-800 rounded-lg appearance-none cursor-pointer accent-brand-600 disabled:opacity-40"
          aria-label="Execution timeline scrubber"
        />
      </div>

      {/* Speed Selector */}
      <div className="flex items-center gap-1.5">
        <Gauge className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-xs text-slate-500 dark:text-slate-400">Speed:</span>
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-surface-50 dark:border-slate-800 dark:bg-surface-950">
          {speeds.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSpeedChange(s)}
              className={cn(
                "px-2 py-0.5 text-xs font-mono rounded transition-colors",
                speed === s
                  ? "bg-brand-600 text-white font-medium shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
