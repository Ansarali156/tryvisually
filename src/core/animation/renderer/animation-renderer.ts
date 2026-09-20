/**
 * Animation Renderer Interface & Style Utilities
 *
 * Keeps animation logic strictly decoupled from rendering technology (DOM / SVG / Canvas).
 */

import type { CSSProperties } from "react";
import type { ElementPosition } from "@/core/visualization/types";
import type {
  AnimationTransition,
  InterpolatedElementTransform,
} from "../types";

export interface AnimationRenderer {
  /** Applies active transition at current normalized progress */
  applyTransition(
    transition: AnimationTransition,
    progress: number
  ): void;

  /** Cancels active rendering */
  cancelTransition(): void;

  /** Forces rendering to final settled state */
  completeTransition(): void;
}

/**
 * Derives CSS transform and opacity style from interpolated transform or fallback position.
 */
export function getElementInterpolatedStyle(
  interpolated?: InterpolatedElementTransform,
  fallbackPosition?: ElementPosition
): CSSProperties {
  if (interpolated) {
    return {
      transform: `translate3d(${interpolated.x}px, ${interpolated.y}px, 0) scale(${interpolated.scale})`,
      opacity: interpolated.opacity,
      willChange: "transform, opacity",
    };
  }

  if (fallbackPosition) {
    return {
      transform: `translate3d(${fallbackPosition.x}px, ${fallbackPosition.y}px, 0) scale(1)`,
      opacity: 1,
    };
  }

  return {};
}
