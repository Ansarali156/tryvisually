/**
 * Complete Binary Tree Layout Engine for Heaps
 *
 * Deterministically maps array index i -> (x, y) coordinates.
 * Features:
 * - Symmetrical complete binary tree pyramid layout
 * - Exact parent-centering: x_parent = (x_left + x_right) / 2
 * - Dynamic width scaling based on heap depth
 * - Deterministic SVG viewBox and bounding box calculations
 */

export interface HeapNodeLayoutPosition {
  readonly id: string;
  readonly index: number;
  readonly x: number;
  readonly y: number;
  readonly depth: number;
  readonly posInLevel: number;
}

export interface HeapTreeLayoutResult {
  readonly positions: Readonly<Record<string, HeapNodeLayoutPosition>>;
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

export const HEAP_NODE_RADIUS = 24;
export const HEAP_LEVEL_HEIGHT = 80;
export const HEAP_MIN_LEAF_SPACING = 56;
export const HEAP_PADDING_X = 48;
export const HEAP_PADDING_Y = 48;

/**
 * Computes deterministic (x, y) coordinates for all elements in a complete binary heap.
 */
export function computeHeapTreeLayout(
  items: readonly { id: string }[]
): HeapTreeLayoutResult {
  const n = items.length;

  if (n === 0) {
    return {
      positions: Object.freeze({}),
      boundingBox: {
        minX: 0,
        maxX: 500,
        minY: 0,
        maxY: 240,
        width: 500,
        height: 240,
        viewBox: "0 0 500 240",
      },
      maxDepth: -1,
    };
  }

  const maxDepth = Math.floor(Math.log2(n));
  const maxSlots = Math.pow(2, maxDepth);
  const totalContentWidth = Math.max(520, maxSlots * HEAP_MIN_LEAF_SPACING);
  const width = totalContentWidth + HEAP_PADDING_X * 2;
  const height = (maxDepth + 1) * HEAP_LEVEL_HEIGHT + HEAP_PADDING_Y * 2;

  const positions: Record<string, HeapNodeLayoutPosition> = {};

  for (let i = 0; i < n; i++) {
    const el = items[i];
    const depth = Math.floor(Math.log2(i + 1));
    const slotsInLevel = Math.pow(2, depth);
    const posInLevel = i - (slotsInLevel - 1);

    // Center nodes horizontally in their level partition
    const x = HEAP_PADDING_X + ((posInLevel + 0.5) / slotsInLevel) * totalContentWidth;
    const y = HEAP_PADDING_Y + depth * HEAP_LEVEL_HEIGHT;

    positions[el.id] = {
      id: el.id,
      index: i,
      x,
      y,
      depth,
      posInLevel,
    };
  }

  return {
    positions: Object.freeze(positions),
    boundingBox: {
      minX: 0,
      maxX: width,
      minY: 0,
      maxY: height,
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
    },
    maxDepth,
  };
}
