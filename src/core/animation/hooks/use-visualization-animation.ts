/**
 * React Hook: useVisualizationAnimation
 *
 * Orchestrates visual transitions when visualizationState updates.
 * Derives transitions from (previousState -> currentState) and drives the AnimationController.
 *
 * Invariant: Animation is presentation only; algorithm execution correctness is independent of animations.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { VisualizationState } from "@/core/visualization/types";
import type { PlaybackSpeed } from "@/core/execution/types";
import type {
  AnimationTransition,
  AnimationPlaybackState,
  InterpolatedElementTransform,
} from "../types";
import { AnimationController } from "../controller/animation-controller";
import { generateTransitions } from "../transitions/transition-generator";
import { useReducedMotion } from "./use-reduced-motion";

export interface UseVisualizationAnimationOptions<TState> {
  /** The active, authoritative visualization state */
  readonly visualizationState: VisualizationState<TState> | null;

  /** Playback speed multiplier (0.25x to 4x) */
  readonly speed?: PlaybackSpeed;

  /** Base duration at 1x speed in milliseconds (default: 350ms) */
  readonly baseDurationMs?: number;

  /** Whether animations are enabled (default: true) */
  readonly enabled?: boolean;

  /** Optional callback fired when animation transition completes */
  readonly onComplete?: () => void;
}

export interface UseVisualizationAnimationReturn {
  /** Whether a visual transition is actively interpolating */
  readonly isAnimating: boolean;

  /** Normalized progress of the current transition [0, 1] */
  readonly progress: number;

  /** Playback state (idle, running, paused, completed, cancelled) */
  readonly playbackState: AnimationPlaybackState;

  /** Active transition instructions */
  readonly transitions: readonly AnimationTransition[];

  /** Instantaneous interpolated transforms for elements by elementId */
  readonly interpolatedTransforms: ReadonlyMap<string, InterpolatedElementTransform>;

  /** Manually cancel the in-flight transition */
  readonly cancel: () => void;

  /** Settle transition immediately to end state */
  readonly complete: () => void;
}

export function useVisualizationAnimation<TState>({
  visualizationState,
  speed = 1,
  baseDurationMs = 350,
  enabled = true,
  onComplete,
}: UseVisualizationAnimationOptions<TState>): UseVisualizationAnimationReturn {
  const reducedMotion = useReducedMotion();
  const previousStateRef = useRef<VisualizationState<TState> | null>(null);

  const [progress, setProgress] = useState(1.0);
  const [playbackState, setPlaybackState] = useState<AnimationPlaybackState>("idle");
  const [activeTransitions, setActiveTransitions] = useState<readonly AnimationTransition[]>([]);
  const [interpolatedTransforms, setInterpolatedTransforms] = useState<
    ReadonlyMap<string, InterpolatedElementTransform>
  >(new Map());

  // Store onComplete in ref to prevent re-instantiating controller
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const controller = useMemo(() => {
    return new AnimationController({
      onComplete: () => onCompleteRef.current?.(),
    });
  }, []);

  // Subscribe to controller frame broadcasts
  useEffect(() => {
    const unsubscribe = controller.subscribe((p, state, transforms) => {
      setProgress(p);
      setPlaybackState(state);
      setInterpolatedTransforms(transforms);
    });

    return () => {
      unsubscribe();
      controller.cancel();
    };
  }, [controller]);

  // Trigger transitions when visualizationState updates
  useEffect(() => {
    if (!visualizationState) {
      previousStateRef.current = null;
      return;
    }

    const prevState = previousStateRef.current;

    // Only generate transitions if state reference changed
    if (prevState !== visualizationState) {
      const transitions = generateTransitions(prevState, visualizationState, {
        speed,
        baseDurationMs,
        reducedMotion: reducedMotion || !enabled,
      });

      setActiveTransitions(transitions);

      if (enabled && transitions.length > 0 && !reducedMotion) {
        controller.start(transitions);
      } else {
        // Instant settle
        controller.complete();
      }

      previousStateRef.current = visualizationState;
    }
  }, [visualizationState, speed, baseDurationMs, enabled, reducedMotion, controller]);

  const cancel = useCallback(() => controller.cancel(), [controller]);
  const complete = useCallback(() => controller.complete(), [controller]);

  return {
    isAnimating: playbackState === "running",
    progress,
    playbackState,
    transitions: activeTransitions,
    interpolatedTransforms,
    cancel,
    complete,
  };
}
