/**
 * Deterministic Graph Layout Utilities
 *
 * Provides predictable, stable spatial positioning for graph vertices.
 */

import type { GraphNode } from "./types";

export interface LayoutBounds {
  readonly width: number;
  readonly height: number;
  readonly padding?: number;
}

/**
 * Computes deterministic circular layout coordinates for a list of nodes
 */
export function computeCircularLayout(
  nodes: readonly GraphNode[],
  bounds: LayoutBounds = { width: 640, height: 400, padding: 50 }
): readonly GraphNode[] {
  const n = nodes.length;
  if (n === 0) return [];

  const padding = bounds.padding ?? 50;
  const cx = bounds.width / 2;
  const cy = bounds.height / 2;
  const rx = Math.max(80, (bounds.width - padding * 2) / 2);
  const ry = Math.max(80, (bounds.height - padding * 2) / 2);

  if (n === 1) {
    return [{ ...nodes[0], x: cx, y: cy }];
  }

  // Start from top (-PI / 2) and distribute clockwise
  return nodes.map((node, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    const x = Math.round(cx + rx * Math.cos(angle));
    const y = Math.round(cy + ry * Math.sin(angle));
    return {
      ...node,
      x,
      y,
    };
  });
}

/**
 * Computes deterministic coordinates for an added node so it doesn't overlap existing nodes
 */
export function computeNextNodePosition(
  existingNodes: readonly GraphNode[],
  bounds: LayoutBounds = { width: 640, height: 400, padding: 50 }
): { x: number; y: number } {
  const n = existingNodes.length + 1;
  const padding = bounds.padding ?? 50;
  const cx = bounds.width / 2;
  const cy = bounds.height / 2;
  const rx = Math.max(80, (bounds.width - padding * 2) / 2);
  const ry = Math.max(80, (bounds.height - padding * 2) / 2);

  const angle = -Math.PI / 2 + (2 * Math.PI * (n - 1)) / Math.max(n, 4);
  const x = Math.round(cx + rx * Math.cos(angle));
  const y = Math.round(cy + ry * Math.sin(angle));

  return { x, y };
}

/**
 * Clamps coordinates within the canvas bounding box
 */
export function clampCoordinates(
  x: number,
  y: number,
  bounds: LayoutBounds,
  nodeRadius = 24
): { x: number; y: number } {
  const minX = nodeRadius + 10;
  const maxX = bounds.width - nodeRadius - 10;
  const minY = nodeRadius + 10;
  const maxY = bounds.height - nodeRadius - 10;

  return {
    x: Math.max(minX, Math.min(maxX, Math.round(x))),
    y: Math.max(minY, Math.min(maxY, Math.round(y))),
  };
}
