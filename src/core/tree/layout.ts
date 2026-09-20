/**
 * Tree Visual Layout Engine
 *
 * Computes deterministic 2D spatial coordinates for binary tree nodes.
 * Features:
 * - Deterministic, collision-free in-order column projection
 * - Strict directional preservation (left children left, right children right)
 * - Proportional vertical level stratification
 * - Automatic bounding-box and SVG viewBox calculation
 * - 100% pure function, decoupled from algorithmic correctness
 */

import type { TreeState } from "./types";

export interface NodeLayoutPosition {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly depth: number;
  readonly col: number;
}

export interface TreeLayoutResult {
  readonly positions: Readonly<Record<string, NodeLayoutPosition>>;
  readonly boundingBox: {
    readonly minX: number;
    readonly maxX: number;
    readonly minY: number;
    readonly maxY: number;
    readonly width: number;
    readonly height: number;
    readonly viewBox: string;
  };
  readonly maxDepth: number;
}

export const NODE_RADIUS = 24;
export const HORIZONTAL_SPACING = 68;
export const VERTICAL_LEVEL_HEIGHT = 84;
export const PADDING_X = 56;
export const PADDING_Y = 56;

/**
 * Computes deterministic (x, y) coordinates for all nodes in the tree state.
 */
export function computeTreeLayout(tree: TreeState<number>): TreeLayoutResult {
  if (!tree.rootId || !tree.nodes[tree.rootId]) {
    return {
      positions: Object.freeze({}),
      boundingBox: {
        minX: 0,
        maxX: 400,
        minY: 0,
        maxY: 200,
        width: 400,
        height: 200,
        viewBox: "0 0 400 200",
      },
      maxDepth: -1,
    };
  }

  const positions: Record<string, NodeLayoutPosition> = {};
  let currentInOrderIndex = 0;
  let maxDepth = 0;

  // Pass 1: Depth assignment & in-order column index calculation
  function inOrderTraversal(nodeId: string | null, depth: number) {
    if (!nodeId) return;
    const node = tree.nodes[nodeId];
    if (!node) return;

    if (depth > maxDepth) {
      maxDepth = depth;
    }

    // Traverse left
    inOrderTraversal(node.leftId, depth + 1);

    // Visit current node
    const col = currentInOrderIndex++;
    const x = PADDING_X + col * HORIZONTAL_SPACING;
    const y = PADDING_Y + depth * VERTICAL_LEVEL_HEIGHT;

    positions[nodeId] = {
      id: nodeId,
      x,
      y,
      depth,
      col,
    };

    // Traverse right
    inOrderTraversal(node.rightId, depth + 1);
  }

  inOrderTraversal(tree.rootId, 0);

  // Compute bounding box
  const allPositions = Object.values(positions);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const pos of allPositions) {
    if (pos.x < minX) minX = pos.x;
    if (pos.x > maxX) maxX = pos.x;
    if (pos.y < minY) minY = pos.y;
    if (pos.y > maxY) maxY = pos.y;
  }

  // Account for node radius and padding
  const boxMinX = Math.max(0, minX - NODE_RADIUS - PADDING_X);
  const boxMaxX = maxX + NODE_RADIUS + PADDING_X;
  const boxMinY = Math.max(0, minY - NODE_RADIUS - PADDING_Y);
  const boxMaxY = maxY + NODE_RADIUS + PADDING_Y;

  const width = Math.max(400, boxMaxX - boxMinX);
  const height = Math.max(260, boxMaxY - boxMinY);

  return {
    positions: Object.freeze(positions),
    boundingBox: {
      minX: boxMinX,
      maxX: boxMaxX,
      minY: boxMinY,
      maxY: boxMaxY,
      width,
      height,
      viewBox: `${boxMinX} ${boxMinY} ${width} ${height}`,
    },
    maxDepth,
  };
}
