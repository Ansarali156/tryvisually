"use client";

import * as React from "react";
import {
  ExecutionController,
  ExecutionControllerOptions,
} from "../controller/execution-controller";
import {
  ExecutionRuntimeState,
  ExecutionStep,
  ExecutionTrace,
  PlaybackSpeed,
} from "../types";

export interface UseExecutionEngineReturn<TState> {
  // Runtime State
  currentStep: ExecutionStep<TState> | null;
  currentState: Readonly<TState> | null;
  currentStepIndex: number;
  totalSteps: number;
  status: ExecutionRuntimeState<TState>["status"];
  speed: PlaybackSpeed;
  progress: number;
  isPlaying: boolean;
  isCompleted: boolean;

  // Actions
  play: () => boolean;
  pause: () => void;
  resume: () => boolean;
  next: () => boolean;
  previous: () => boolean;
  reset: () => void;
  replay: () => void;
  jumpTo: (index: number) => void;
  jumpToStart: () => void;
  jumpToEnd: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;

  // Direct Controller reference for advanced operations
  controller: ExecutionController<TState>;
}

export function useExecutionEngine<TState = unknown>(
  trace: ExecutionTrace<TState>,
  options: ExecutionControllerOptions = {}
): UseExecutionEngineReturn<TState> {
  const { initialSpeed, baseDelayMs } = options;

  // Maintain a stable controller instance across renders, recreating only if trace or options change
  const controller = React.useMemo(() => {
    return new ExecutionController<TState>(trace, { initialSpeed, baseDelayMs });
  }, [trace, initialSpeed, baseDelayMs]);

  // Clean up controller on unmount or when trace changes
  React.useEffect(() => {
    return () => {
      controller.destroy();
    };
  }, [controller]);

  // Subscribe to controller state changes via useSyncExternalStore for optimal React 18/19 integration
  const runtimeState = React.useSyncExternalStore(
    React.useCallback((onStoreChange) => controller.subscribe(onStoreChange), [controller]),
    React.useCallback(() => controller.getRuntimeState(), [controller]),
    React.useCallback(() => controller.getRuntimeState(), [controller])
  );

  // Memoized action callbacks
  const play = React.useCallback(() => controller.play(), [controller]);
  const pause = React.useCallback(() => controller.pause(), [controller]);
  const resume = React.useCallback(() => controller.resume(), [controller]);
  const next = React.useCallback(() => controller.next(), [controller]);
  const previous = React.useCallback(() => controller.previous(), [controller]);
  const reset = React.useCallback(() => controller.reset(), [controller]);
  const replay = React.useCallback(() => controller.replay(), [controller]);
  const jumpTo = React.useCallback((index: number) => controller.jumpTo(index), [controller]);
  const jumpToStart = React.useCallback(() => controller.jumpToStart(), [controller]);
  const jumpToEnd = React.useCallback(() => controller.jumpToEnd(), [controller]);
  const setSpeed = React.useCallback(
    (speed: PlaybackSpeed) => controller.setSpeed(speed),
    [controller]
  );

  return {
    currentStep: runtimeState.currentStep,
    currentState: runtimeState.currentState,
    currentStepIndex: runtimeState.currentStepIndex,
    totalSteps: runtimeState.totalSteps,
    status: runtimeState.status,
    speed: runtimeState.speed,
    progress: runtimeState.progress,
    isPlaying: runtimeState.status === "playing",
    isCompleted: runtimeState.status === "completed",
    play,
    pause,
    resume,
    next,
    previous,
    reset,
    replay,
    jumpTo,
    jumpToStart,
    jumpToEnd,
    setSpeed,
    controller,
  };
}
