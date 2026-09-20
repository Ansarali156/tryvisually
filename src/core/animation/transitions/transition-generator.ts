/**
 * Transition Generator
 *
 * Compares previous and current VisualizationStates and deterministically generates
 * the required visual transitions (move, swap, insert, delete, highlight, connect, disconnect).
 *
 * PURE PRESENTATION LOGIC: Never modifies or creates algorithm state.
 */

import type { VisualizationState, ElementPosition } from "@/core/visualization/types";
import { resolveHighlightsByElement } from "@/core/visualization/utils/highlight-priority";
import type { AnimationTransition, AnimationOptions } from "../types";

function arePositionsEqual(
  posA?: ElementPosition,
  posB?: ElementPosition
): boolean {
  if (!posA && !posB) return true;
  if (!posA || !posB) return false;
  return posA.x === posB.x && posA.y === posB.y;
}

export function calculateEffectiveDuration(options?: AnimationOptions): number {
  if (options?.reducedMotion) {
    return 0;
  }
  const base = options?.baseDurationMs ?? 400;
  const speed = options?.speed ?? 1;
  return Math.max(50, Math.round(base / speed));
}

/**
 * Deterministically generates an array of AnimationTransitions between two visual states.
 */
export function generateTransitions<TState>(
  previousState: VisualizationState<TState> | null | undefined,
  currentState: VisualizationState<TState>,
  options?: AnimationOptions
): readonly AnimationTransition[] {
  const transitions: AnimationTransition[] = [];
  const duration = calculateEffectiveDuration(options);

  // 1. Initial State (no previous state)
  if (!previousState || previousState.elements.length === 0) {
    for (const elem of currentState.elements) {
      transitions.push({
        id: `tr-insert-${elem.id}`,
        type: "insert",
        targetIds: [elem.id],
        duration,
        from: {
          opacity: 0,
          scale: 0.8,
          position: elem.position ?? { x: 0, y: 0 },
        },
        to: {
          opacity: 1,
          scale: 1,
          position: elem.position ?? { x: 0, y: 0 },
        },
      });
    }

    for (const conn of currentState.connections) {
      transitions.push({
        id: `tr-connect-${conn.id}`,
        type: "connect",
        targetIds: [conn.id],
        duration,
      });
    }

    return Object.freeze(transitions);
  }

  // 2. Build Element and Highlight Lookup Maps
  const prevElems = new Map(previousState.elements.map((e) => [e.id, e]));
  const currElems = new Map(currentState.elements.map((e) => [e.id, e]));

  const prevConns = new Map(previousState.connections.map((c) => [c.id, c]));
  const currConns = new Map(currentState.connections.map((c) => [c.id, c]));

  const prevHighlights = resolveHighlightsByElement(previousState.highlights);
  const currHighlights = resolveHighlightsByElement(currentState.highlights);

  // Track elements that participated in a swap to avoid duplicate move transitions
  const swappedElementIds = new Set<string>();

  // 3. Detect Swaps
  const commonIds = Array.from(prevElems.keys()).filter((id) => currElems.has(id));

  for (let i = 0; i < commonIds.length; i++) {
    const idA = commonIds[i];
    if (swappedElementIds.has(idA)) continue;

    const prevA = prevElems.get(idA)!;
    const currA = currElems.get(idA)!;

    if (arePositionsEqual(prevA.position, currA.position)) continue;

    for (let j = i + 1; j < commonIds.length; j++) {
      const idB = commonIds[j];
      if (swappedElementIds.has(idB)) continue;

      const prevB = prevElems.get(idB)!;
      const currB = currElems.get(idB)!;

      // Check if A and B exchanged positions
      if (
        arePositionsEqual(prevA.position, currB.position) &&
        arePositionsEqual(prevB.position, currA.position)
      ) {
        swappedElementIds.add(idA);
        swappedElementIds.add(idB);

        const sortedIds = [idA, idB].sort();
        transitions.push({
          id: `tr-swap-${sortedIds[0]}-${sortedIds[1]}`,
          type: "swap",
          targetIds: [idA, idB],
          duration,
          from: {
            [idA]: { position: prevA.position },
            [idB]: { position: prevB.position },
          },
          to: {
            [idA]: { position: currA.position },
            [idB]: { position: currB.position },
          },
        });
        break;
      }
    }
  }

  // 4. Detect Position Changes (Moves)
  for (const id of commonIds) {
    if (swappedElementIds.has(id)) continue;

    const prevElem = prevElems.get(id)!;
    const currElem = currElems.get(id)!;

    if (!arePositionsEqual(prevElem.position, currElem.position)) {
      transitions.push({
        id: `tr-move-${id}`,
        type: "move",
        targetIds: [id],
        duration,
        from: { position: prevElem.position ?? { x: 0, y: 0 } },
        to: { position: currElem.position ?? { x: 0, y: 0 } },
      });
    }
  }

  // 5. Detect Insertions (new elements)
  for (const [id, currElem] of currElems.entries()) {
    if (!prevElems.has(id)) {
      transitions.push({
        id: `tr-insert-${id}`,
        type: "insert",
        targetIds: [id],
        duration,
        from: {
          opacity: 0,
          scale: 0.8,
          position: currElem.position ?? { x: 0, y: 0 },
        },
        to: {
          opacity: 1,
          scale: 1,
          position: currElem.position ?? { x: 0, y: 0 },
        },
      });
    }
  }

  // 6. Detect Deletions (removed elements)
  for (const [id, prevElem] of prevElems.entries()) {
    if (!currElems.has(id)) {
      transitions.push({
        id: `tr-delete-${id}`,
        type: "delete",
        targetIds: [id],
        duration,
        from: {
          opacity: 1,
          scale: 1,
          position: prevElem.position ?? { x: 0, y: 0 },
        },
        to: {
          opacity: 0,
          scale: 0.8,
          position: prevElem.position ?? { x: 0, y: 0 },
        },
      });
    }
  }

  // 7. Detect Highlight Changes
  for (const [id] of currElems.entries()) {
    const prevHl = prevHighlights.get(id)?.type ?? "none";
    const currHl = currHighlights.get(id)?.type ?? "none";

    if (prevHl !== currHl) {
      transitions.push({
        id: `tr-highlight-${id}-${currHl}`,
        type: "highlight",
        targetIds: [id],
        duration,
        from: { highlight: prevHl },
        to: { highlight: currHl },
      });
    }
  }

  // 8. Detect Connection Additions (connect)
  for (const [id] of currConns.entries()) {
    if (!prevConns.has(id)) {
      transitions.push({
        id: `tr-connect-${id}`,
        type: "connect",
        targetIds: [id],
        duration,
      });
    }
  }

  // 9. Detect Connection Removals (disconnect)
  for (const [id] of prevConns.entries()) {
    if (!currConns.has(id)) {
      transitions.push({
        id: `tr-disconnect-${id}`,
        type: "disconnect",
        targetIds: [id],
        duration,
      });
    }
  }

  return Object.freeze(transitions);
}
