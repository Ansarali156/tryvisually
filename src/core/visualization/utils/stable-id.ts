/**
 * Stable Identifier Utilities
 *
 * Algorithm elements (nodes, items, cells, edges) must retain stable IDs
 * across swaps, insertions, deletions, and structural reorganizations.
 * Using volatile array indices as IDs breaks animations and transitions.
 */

/**
 * Creates a stable identifier from a prefix and a discrete key/index.
 * Example: `createStableId("node", 4)` -> `"node-4"`
 */
export function createStableId(prefix: string, key: string | number): string {
  const sanitizedPrefix = prefix.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return `${sanitizedPrefix}-${key}`;
}

/**
 * Generates a stable connection ID connecting source and target.
 * Example: `createConnectionId("node-1", "node-2", "next")` -> `"conn-node-1-node-2-next"`
 */
export function createConnectionId(
  sourceId: string,
  targetId: string,
  type = "edge"
): string {
  return `conn-${sourceId}-${targetId}-${type}`;
}

/**
 * Generates a stable cell ID for 2D grids / DP tables.
 * Example: `createCellId(2, 5)` -> `"cell-2-5"`
 */
export function createCellId(row: number, col: number): string {
  return `cell-${row}-${col}`;
}

/**
 * Validates that an ID is a non-empty, well-formed stable string identifier.
 */
export function isValidStableId(id: unknown): id is string {
  return typeof id === "string" && id.trim().length > 0;
}
