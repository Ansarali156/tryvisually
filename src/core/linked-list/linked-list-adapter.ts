/**
 * Linked List Visualization Adapter
 *
 * Transforms a LinkedListState snapshot and current ExecutionStep into renderer-independent VisualizationState.
 * Extends BaseVisualizationAdapter, generating nodes, relational next/prev connections, pointers, and highlights.
 */

import { BaseVisualizationAdapter } from "@/core/visualization/adapters/base-adapter";
import type { ExecutionStep } from "@/core/execution/types";
import type {
  VisualizationElement,
  VisualizationConnection,
  VisualizationAnnotation,
  VisualizationHighlight,
  HighlightType,
} from "@/core/visualization/types";
import type { LinkedListState } from "./types";

export const LINKED_LIST_NODE_SPACING = 160;

export class LinkedListAdapter extends BaseVisualizationAdapter<LinkedListState> {
  readonly name = "linked-list-adapter";

  /**
   * Convenience adapter method for converting an ExecutionStep directly.
   */
  adapt(step: ExecutionStep<LinkedListState>) {
    return this.transform(step.state, step);
  }

  /**
   * Converts linked list nodes into visual elements with stable IDs and spatial coordinates.
   */
  buildElements(
    state: LinkedListState,
    _step?: ExecutionStep<LinkedListState> | null
  ): readonly VisualizationElement[] {
    return state.nodes.map((node, index) => ({
      id: node.id,
      type: "node",
      value: node.value,
      label: String(node.value),
      position: {
        x: index * LINKED_LIST_NODE_SPACING,
        y: 0,
      },
      dimensions: {
        width: 88,
        height: 56,
      },
      metadata: {
        index,
        stableId: node.id,
        variant: state.variant,
        isHead: node.id === state.headId,
        isTail: node.id === state.tailId,
        nextId: state.next[node.id] ?? null,
        prevId: state.previous ? state.previous[node.id] ?? null : undefined,
      },
    }));
  }

  /**
   * Builds explicit relational connections for next (and previous for doubly linked lists).
   */
  override buildConnections(
    state: LinkedListState,
    _step?: ExecutionStep<LinkedListState> | null
  ): readonly VisualizationConnection[] {
    const connections: VisualizationConnection[] = [];

    // Next pointer connections
    for (const [sourceId, targetId] of Object.entries(state.next)) {
      if (targetId) {
        const isCircularReturn = state.variant === "circular" && sourceId === state.tailId && targetId === state.headId;

        connections.push({
          id: `next:${sourceId}:${targetId}`,
          sourceId,
          targetId,
          type: "next",
          directed: true,
          label: isCircularReturn ? "next (return)" : "next",
          metadata: {
            isCircularReturn,
          },
        });
      }
    }

    // Previous pointer connections for doubly linked lists
    if (state.previous) {
      for (const [sourceId, targetId] of Object.entries(state.previous)) {
        if (targetId) {
          connections.push({
            id: `prev:${sourceId}:${targetId}`,
            sourceId,
            targetId,
            type: "previous",
            directed: true,
            label: "prev",
          });
        }
      }
    }

    return Object.freeze(connections);
  }

  /**
   * Generates pointer annotations for HEAD, TAIL, and runtime pointers (current, prev, next).
   */
  override buildCustomAnnotations(
    state: LinkedListState,
    step?: ExecutionStep<LinkedListState> | null
  ): readonly VisualizationAnnotation[] {
    const annotations: VisualizationAnnotation[] = [];

    // Permanent HEAD and TAIL annotations if list has nodes
    if (state.headId) {
      const headNode = state.nodes.find((n) => n.id === state.headId);
      if (headNode) {
        annotations.push({
          id: `anno-head-${state.headId}`,
          type: "pointer",
          text: "HEAD",
          targetId: state.headId,
          position: { x: 0, y: -30 },
          metadata: { role: "head" },
        });
      }
    }

    if (state.tailId && state.tailId !== state.headId) {
      const tailIndex = state.nodes.findIndex((n) => n.id === state.tailId);
      if (tailIndex >= 0) {
        annotations.push({
          id: `anno-tail-${state.tailId}`,
          type: "pointer",
          text: "TAIL",
          targetId: state.tailId,
          position: { x: tailIndex * LINKED_LIST_NODE_SPACING, y: 50 },
          metadata: { role: "tail" },
        });
      }
    }

    // Runtime pointers from active step metadata
    if (step?.metadata?.pointers && Array.isArray(step.metadata.pointers)) {
      const pointers = step.metadata.pointers as Array<{ index: number; label: string }>;
      pointers.forEach((ptr, i) => {
        const targetNode = state.nodes[ptr.index];
        if (targetNode) {
          annotations.push({
            id: `anno-step-ptr-${ptr.index}-${i}`,
            type: "pointer",
            text: ptr.label,
            targetId: targetNode.id,
            position: { x: ptr.index * LINKED_LIST_NODE_SPACING, y: -30 },
            metadata: { index: ptr.index, label: ptr.label },
          });
        }
      });
    }

    return Object.freeze(annotations);
  }

  /**
   * Derives semantic highlights from current step operation.
   */
  override buildCustomHighlights(
    state: LinkedListState,
    step?: ExecutionStep<LinkedListState> | null
  ): readonly VisualizationHighlight[] {
    if (!step || !step.highlightedElements || step.highlightedElements.length === 0) {
      return [];
    }

    let highlightType: HighlightType = "active";
    let priority = 50;

    switch (step.operation) {
      case "compare":
        highlightType = "compare";
        priority = 70;
        break;
      case "found":
        highlightType = "found";
        priority = 90;
        break;
      case "insert":
        highlightType = "inserted";
        priority = 80;
        break;
      case "delete":
        highlightType = "deleted";
        priority = 80;
        break;
      case "visit":
      case "select":
      case "update":
        highlightType = "active";
        priority = 60;
        break;
      default:
        highlightType = "active";
    }

    return step.highlightedElements.map((elemId) => ({
      elementId: elemId,
      type: highlightType,
      priority,
      label: step.operation,
    }));
  }
}

export const defaultLinkedListAdapter = new LinkedListAdapter();
