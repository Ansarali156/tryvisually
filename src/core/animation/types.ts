/**
 * Animation & Step Controller Types
 *
 * Architecture:
 * EXECUTION ENGINE -> CURRENT EXECUTION STEP -> VISUALIZATION STATE -> ANIMATION CONTROLLER -> VISUAL RENDERER
 *
 * Core Rule: The execution engine remains authoritative.
 * Animation is strictly a visual transition between two already-known states (A -> B).
 * Animations never calculate or dictate algorithm state.
 */

import type { PlaybackSpeed } from "@/core/execution/types";

export type AnimationTransitionType =
  | "move"         // Element position changed (x, y)
  | "swap"         // Two elements exchanged positions
  | "insert"       // New element appeared (fade/scale in)
  | "delete"       // Element removed (fade/scale out)
  | "highlight"    // Element highlight state changed
  | "fade"         // Opacity interpolation
  | "scale"        // Scale interpolation
  | "connect"      // Relational edge appeared
  | "disconnect"   // Relational edge removed
  | "custom";      // Domain-specific transition

export interface AnimationTransition {
  /** Deterministic stable identifier (e.g. "tr-move-item-1", "tr-swap-item-0-item-1") */
  readonly id: string;

  /** Canonical category of visual change */
  readonly type: AnimationTransitionType;

  /** Stable IDs of targeted elements or connections */
  readonly targetIds: readonly string[];

  /** Duration of the transition in milliseconds */
  readonly duration: number;

  /** Optional delay before transition starts */
  readonly delay?: number;

  /** Easing name (e.g. "easeInOut", "linear", "easeOutCubic") */
  readonly easing?: string;

  /** Starting visual attributes (position, scale, opacity, etc.) */
  readonly from?: Readonly<Record<string, unknown>>;

  /** Ending visual attributes */
  readonly to?: Readonly<Record<string, unknown>>;

  /** Extensible transition metadata */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export type AnimationPlaybackState =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "cancelled";

export interface InterpolatedElementTransform {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly opacity: number;
  readonly highlight?: string;
}

export interface AnimationOptions {
  /** Base transition duration in ms at 1x speed (default: 400ms) */
  readonly baseDurationMs?: number;

  /** Current playback speed multiplier (0.25x to 4x) */
  readonly speed?: PlaybackSpeed;

  /** Whether reduced-motion preference is active */
  readonly reducedMotion?: boolean;

  /** Custom easing function (t: [0, 1]) => [0, 1] */
  readonly easing?: (t: number) => number;
}

export type AnimationProgressCallback = (
  progress: number,
  state: AnimationPlaybackState,
  interpolated: ReadonlyMap<string, InterpolatedElementTransform>
) => void;
