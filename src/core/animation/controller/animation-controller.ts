/**
 * Animation Controller
 *
 * Drives visual transition animations using browser requestAnimationFrame.
 * Renderer-independent: Calculates progress and interpolated element transforms
 * and broadcasts updates to listeners.
 *
 * Invariant: Animation completion is NEVER required for algorithm execution correctness.
 */

import type {
  AnimationTransition,
  AnimationPlaybackState,
  InterpolatedElementTransform,
  AnimationProgressCallback,
} from "../types";
import { getEasingFunction, type EasingFunction } from "../transitions/easing";

export interface AnimationControllerConfig {
  readonly onComplete?: () => void;
  readonly defaultEasing?: string;
}

export class AnimationController {
  private state: AnimationPlaybackState = "idle";
  private progress = 0;
  private transitions: readonly AnimationTransition[] = [];
  private duration = 0;
  private startTime = 0;
  private pausedElapsed = 0;
  private rafId: number | null = null;
  private easingFn: EasingFunction;
  private readonly listeners = new Set<AnimationProgressCallback>();
  private readonly onCompleteCallback?: () => void;

  constructor(config: AnimationControllerConfig = {}) {
    this.easingFn = getEasingFunction(config.defaultEasing);
    this.onCompleteCallback = config.onComplete;
  }

  getState(): AnimationPlaybackState {
    return this.state;
  }

  isAnimating(): boolean {
    return this.state === "running";
  }

  getProgress(): number {
    return this.progress;
  }

  subscribe(callback: AnimationProgressCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    const interpolated = this.computeInterpolatedTransforms(this.progress);
    for (const listener of this.listeners) {
      try {
        listener(this.progress, this.state, interpolated);
      } catch (err) {
        console.error("Error in animation progress listener:", err);
      }
    }
  }

  /**
   * Starts a new visual transition, cancelling any in-flight transition immediately.
   */
  start(
    transitions: readonly AnimationTransition[],
    durationOverride?: number
  ): void {
    this.cancel();

    this.transitions = transitions;
    if (transitions.length === 0) {
      this.state = "completed";
      this.progress = 1.0;
      this.notify();
      this.onCompleteCallback?.();
      return;
    }

    // Determine duration from override or maximum transition duration
    const maxTransitionDuration = Math.max(...transitions.map((t) => t.duration), 0);
    this.duration = durationOverride !== undefined ? durationOverride : maxTransitionDuration;

    // Instant / zero duration (e.g. reduced motion or step jump)
    if (this.duration <= 0) {
      this.state = "completed";
      this.progress = 1.0;
      this.notify();
      this.onCompleteCallback?.();
      return;
    }

    this.state = "running";
    this.progress = 0;
    this.pausedElapsed = 0;
    this.startTime = this.getNow();

    this.scheduleFrame();
    this.notify();
  }

  pause(): void {
    if (this.state !== "running") return;

    this.clearRaf();
    this.pausedElapsed = this.getNow() - this.startTime;
    this.state = "paused";
    this.notify();
  }

  resume(): void {
    if (this.state !== "paused") return;

    this.state = "running";
    this.startTime = this.getNow() - this.pausedElapsed;
    this.scheduleFrame();
    this.notify();
  }

  cancel(): void {
    if (this.state === "idle" || this.state === "completed" || this.state === "cancelled") {
      return;
    }

    this.clearRaf();
    this.state = "cancelled";
    this.notify();
  }

  complete(): void {
    this.clearRaf();
    this.progress = 1.0;
    this.state = "completed";
    this.notify();
    this.onCompleteCallback?.();
  }

  private scheduleFrame(): void {
    this.clearRaf();
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      this.rafId = window.requestAnimationFrame(this.onFrame);
    } else {
      // Node / headless test fallback
      this.rafId = setTimeout(() => this.onFrame(this.getNow()), 16) as unknown as number;
    }
  }

  private clearRaf(): void {
    if (this.rafId !== null) {
      if (typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(this.rafId);
      } else {
        clearTimeout(this.rafId);
      }
      this.rafId = null;
    }
  }

  private onFrame = (now: number): void => {
    if (this.state !== "running") return;

    const elapsed = now - this.startTime;
    const rawProgress = Math.min(1.0, Math.max(0.0, elapsed / this.duration));
    this.progress = this.easingFn(rawProgress);

    this.notify();

    if (rawProgress >= 1.0) {
      this.clearRaf();
      this.state = "completed";
      this.progress = 1.0;
      this.notify();
      this.onCompleteCallback?.();
    } else {
      this.scheduleFrame();
    }
  };

  private getNow(): number {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  }

  /**
   * Pure interpolation: computes instantaneous positions, scales, and opacities for elements.
   */
  private computeInterpolatedTransforms(
    progress: number
  ): ReadonlyMap<string, InterpolatedElementTransform> {
    const map = new Map<string, InterpolatedElementTransform>();

    for (const tr of this.transitions) {
      if (tr.type === "move" && tr.from?.position && tr.to?.position) {
        const fromPos = tr.from.position as { x: number; y: number };
        const toPos = tr.to.position as { x: number; y: number };
        const id = tr.targetIds[0];

        map.set(id, {
          x: fromPos.x + (toPos.x - fromPos.x) * progress,
          y: fromPos.y + (toPos.y - fromPos.y) * progress,
          scale: 1,
          opacity: 1,
        });
      } else if (tr.type === "swap") {
        for (const id of tr.targetIds) {
          const fromItem = (tr.from as Record<string, { position: { x: number; y: number } }>)?.[id];
          const toItem = (tr.to as Record<string, { position: { x: number; y: number } }>)?.[id];

          if (fromItem?.position && toItem?.position) {
            map.set(id, {
              x: fromItem.position.x + (toItem.position.x - fromItem.position.x) * progress,
              y: fromItem.position.y + (toItem.position.y - fromItem.position.y) * progress,
              scale: 1 + Math.sin(progress * Math.PI) * 0.1, // Subtle lift during swap
              opacity: 1,
            });
          }
        }
      } else if (tr.type === "insert" && tr.to?.position) {
        const toPos = tr.to.position as { x: number; y: number };
        const id = tr.targetIds[0];

        map.set(id, {
          x: toPos.x,
          y: toPos.y,
          scale: 0.8 + 0.2 * progress,
          opacity: progress,
        });
      } else if (tr.type === "delete" && tr.from?.position) {
        const fromPos = tr.from.position as { x: number; y: number };
        const id = tr.targetIds[0];

        map.set(id, {
          x: fromPos.x,
          y: fromPos.y,
          scale: 1 - 0.2 * progress,
          opacity: 1 - progress,
        });
      }
    }

    return map;
  }
}
