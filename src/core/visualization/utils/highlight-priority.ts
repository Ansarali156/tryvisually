/**
 * Highlight Priority System
 *
 * When an element matches multiple highlight states (for example, an item that was
 * previously visited, is currently being compared, and is also the found target),
 * this module resolves the visual style deterministically based on priority.
 *
 * Hierarchy:
 * current (100) > found (90) > selected (80) > active (70) > compare (60) >
 * swapped (50) > inserted (40) > deleted (35) > path (30) > visited (20) >
 * warning (10) > custom (0)
 */

import type { HighlightType, VisualizationHighlight } from "../types";
import type { ExecutionOperation, ExecutionStep } from "@/core/execution/types";

export const HIGHLIGHT_PRIORITIES: Readonly<Record<HighlightType, number>> = Object.freeze({
  current: 100,
  found: 90,
  selected: 80,
  active: 70,
  compare: 60,
  swapped: 50,
  inserted: 40,
  deleted: 35,
  path: 30,
  visited: 20,
  warning: 10,
  custom: 0,
});

/**
 * Returns the effective priority for a highlight item, respecting custom overrides.
 */
export function getHighlightPriority(highlight: VisualizationHighlight): number {
  if (typeof highlight.priority === "number") {
    return highlight.priority;
  }
  return HIGHLIGHT_PRIORITIES[highlight.type] ?? 0;
}

/**
 * Resolves the single highest-priority highlight for a specific list of highlights.
 * Returns null if the list is empty.
 */
export function resolveElementHighlight(
  highlights: readonly VisualizationHighlight[]
): VisualizationHighlight | null {
  if (highlights.length === 0) {
    return null;
  }

  let highest = highlights[0];
  let highestPriority = getHighlightPriority(highest);

  for (let i = 1; i < highlights.length; i++) {
    const current = highlights[i];
    const priority = getHighlightPriority(current);
    if (priority > highestPriority) {
      highest = current;
      highestPriority = priority;
    }
  }

  return highest;
}

/**
 * Maps a list of highlights into a lookup map where each elementId maps to its
 * resolved highest-priority highlight.
 */
export function resolveHighlightsByElement(
  highlights: readonly VisualizationHighlight[]
): ReadonlyMap<string, VisualizationHighlight> {
  const grouped = new Map<string, VisualizationHighlight[]>();

  for (const hl of highlights) {
    const existing = grouped.get(hl.elementId);
    if (existing) {
      existing.push(hl);
    } else {
      grouped.set(hl.elementId, [hl]);
    }
  }

  const resolved = new Map<string, VisualizationHighlight>();
  for (const [elementId, list] of grouped.entries()) {
    const winner = resolveElementHighlight(list);
    if (winner) {
      resolved.set(elementId, winner);
    }
  }

  return resolved;
}

/**
 * Maps an ExecutionOperation to a canonical HighlightType.
 */
export function operationToHighlightType(operation: ExecutionOperation): HighlightType {
  switch (operation) {
    case "compare":
      return "compare";
    case "swap":
      return "swapped";
    case "insert":
    case "push":
    case "enqueue":
      return "inserted";
    case "delete":
    case "pop":
    case "dequeue":
      return "deleted";
    case "visit":
      return "visited";
    case "found":
      return "found";
    case "select":
    case "partition":
      return "selected";
    case "relax":
    case "call":
      return "active";
    default:
      return "current";
  }
}

/**
 * Derives step highlights from an ExecutionStep's operation and highlightedElements,
 * and merges them with any additional custom highlights.
 */
export function deriveStepHighlights<TState>(
  step: ExecutionStep<TState>,
  additionalHighlights: readonly VisualizationHighlight[] = []
): readonly VisualizationHighlight[] {
  const stepHighlightType = operationToHighlightType(step.operation);

  const stepHighlights: VisualizationHighlight[] = step.highlightedElements.map((elementId) => ({
    elementId,
    type: stepHighlightType,
  }));

  return [...stepHighlights, ...additionalHighlights];
}
