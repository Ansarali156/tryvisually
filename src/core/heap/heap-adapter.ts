/**
 * Heap Visualization Adapter
 *
 * Transforms raw HeapState snapshots into generic VisualizationState elements
 * and connections, calculating deterministic complete binary tree coordinates
 * via computeHeapTreeLayout while preserving linear index ordering metadata.
 */

import type { ExecutionStep } from "@/core/execution/types";
import { BaseVisualizationAdapter } from "@/core/visualization/adapters/base-adapter";
import type {
  VisualizationElement,
  VisualizationConnection,
  VisualizationHighlight,
} from "@/core/visualization/types";
import type { HeapState } from "./types";
import { computeHeapTreeLayout } from "./layout";
import { getLeftChildIndex, getRightChildIndex, getParentIndex } from "./validation";

export class HeapAdapter extends BaseVisualizationAdapter<HeapState<number>> {
  readonly name = "HeapAdapter";

  buildElements(
    state: HeapState<number>,
    _step?: ExecutionStep<HeapState<number>> | null
  ): readonly VisualizationElement[] {
    const layout = computeHeapTreeLayout(state.items);
    const elements: VisualizationElement[] = [];

    for (let i = 0; i < state.items.length; i++) {
      const item = state.items[i];
      const pos = layout.positions[item.id];
      const leftIdx = getLeftChildIndex(i);
      const rightIdx = getRightChildIndex(i);
      const parentIdx = i > 0 ? getParentIndex(i) : null;

      elements.push({
        id: item.id,
        type: "node",
        value: item.value,
        label: String(item.value),
        position: pos ? { x: pos.x, y: pos.y } : { x: 0, y: 0 },
        metadata: {
          index: i,
          heapType: state.heapType,
          isRoot: i === 0,
          isLeaf: leftIdx >= state.items.length,
          parentId: parentIdx !== null && state.items[parentIdx] ? state.items[parentIdx].id : null,
          leftId: leftIdx < state.items.length ? state.items[leftIdx].id : null,
          rightId: rightIdx < state.items.length ? state.items[rightIdx].id : null,
          depth: pos ? pos.depth : 0,
        },
      });
    }

    return elements;
  }

  override buildConnections(
    state: HeapState<number>,
    step?: ExecutionStep<HeapState<number>> | null
  ): readonly VisualizationConnection[] {
    const connections: VisualizationConnection[] = [];
    const highlightedNodeIds = new Set(step?.highlightedElements || []);

    for (let i = 0; i < state.items.length; i++) {
      const parent = state.items[i];
      const leftIdx = getLeftChildIndex(i);
      const rightIdx = getRightChildIndex(i);

      if (leftIdx < state.items.length) {
        const leftChild = state.items[leftIdx];
        const edgeId = `edge-${parent.id}-${leftChild.id}`;
        const isHighlighted = highlightedNodeIds.has(parent.id) && highlightedNodeIds.has(leftChild.id);

        connections.push({
          id: edgeId,
          sourceId: parent.id,
          targetId: leftChild.id,
          type: "child",
          label: "L",
          highlighted: isHighlighted,
          directed: true,
        });
      }

      if (rightIdx < state.items.length) {
        const rightChild = state.items[rightIdx];
        const edgeId = `edge-${parent.id}-${rightChild.id}`;
        const isHighlighted = highlightedNodeIds.has(parent.id) && highlightedNodeIds.has(rightChild.id);

        connections.push({
          id: edgeId,
          sourceId: parent.id,
          targetId: rightChild.id,
          type: "child",
          label: "R",
          highlighted: isHighlighted,
          directed: true,
        });
      }
    }

    return connections;
  }

  override buildCustomHighlights(
    _state: HeapState<number>,
    step?: ExecutionStep<HeapState<number>> | null
  ): readonly VisualizationHighlight[] {
    if (!step?.highlightedElements?.length) {
      return [];
    }

    const op = step.operation;
    let type: "compare" | "swapped" | "inserted" | "deleted" | "current" = "current";
    if (op === "compare") type = "compare";
    else if (op === "swap") type = "swapped";
    else if (op === "insert") type = "inserted";
    else if (op === "delete") type = "deleted";

    return step.highlightedElements.map((elemId) => ({
      elementId: elemId,
      type,
      label: op.toUpperCase(),
    }));
  }
}
