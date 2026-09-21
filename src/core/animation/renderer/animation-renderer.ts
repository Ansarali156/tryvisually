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

/**
 * Derives CSS transform and opacity for elements arranged in standard document/flex flow.
 * In flex/flow layouts, the base coordinate is already arranged by CSS.
 * Only the delta offset (interpolated.x - basePosition.x) is applied during animations,
 * preventing layout duplication and massive gaps.
 */
export function getElementFlowStyle(
  interpolated?: InterpolatedElementTransform,
  basePosition?: ElementPosition
): CSSProperties {
  if (interpolated) {
    const dx = basePosition ? interpolated.x - basePosition.x : 0;
    const dy = basePosition ? interpolated.y - basePosition.y : 0;
    const hasTranslation = Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5;
    const hasScale = Math.abs(interpolated.scale - 1) > 0.01;

    const transform = hasTranslation
      ? `translate3d(${dx}px, ${dy}px, 0) scale(${interpolated.scale})`
      : hasScale
      ? `scale(${interpolated.scale})`
      : undefined;

    return {
      transform,
      opacity: interpolated.opacity,
      willChange:
        hasTranslation || hasScale || interpolated.opacity < 1
          ? "transform, opacity"
          : undefined,
    };
  }

  return {};
}
