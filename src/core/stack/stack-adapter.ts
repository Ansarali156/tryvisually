/**
 * Stack Visualization Adapter
 *
 * Transforms a StackState snapshot and ExecutionStep into declarative VisualizationState.
 * Extends BaseVisualizationAdapter, placing elements in a vertical LIFO bucket
 * with a dedicated TOP pointer annotation.
 */

import { BaseVisualizationAdapter } from "@/core/visualization/adapters/base-adapter";
import type { ExecutionStep } from "@/core/execution/types";
import type {
  VisualizationElement,
  VisualizationAnnotation,
  VisualizationHighlight,
  HighlightType,
} from "@/core/visualization/types";
import type { StackState } from "./types";

export const STACK_ELEMENT_HEIGHT = 52;
export const STACK_ELEMENT_WIDTH = 140;

export class StackAdapter extends BaseVisualizationAdapter<StackState> {
  readonly name = "stack-adapter";

  /**
   * Convenience adapter method for converting an ExecutionStep directly.
   */
  adapt(step: ExecutionStep<StackState>) {
    return this.transform(step.state, step);
  }

  /**
   * Converts stack items into visual elements positioned vertically in a bucket.
   * Top element is positioned at the top (y: 0); bottom elements stack downwards.
   */
  buildElements(
    state: StackState,
    _step?: ExecutionStep<StackState> | null
  ): readonly VisualizationElement[] {
    const total = state.items.length;

    return state.items.map((item, index) => {
      // index 0 is bottom, index total - 1 is top
      // Top element has relative y = 0, bottom has relative y = (total - 1) * STACK_ELEMENT_HEIGHT
      const visualY = (total - 1 - index) * STACK_ELEMENT_HEIGHT;

      return {
        id: item.id,
        type: "node",
        value: item.value,
        label: String(item.value),
        position: {
          x: 0,
          y: visualY,
        },
        dimensions: {
          width: STACK_ELEMENT_WIDTH,
          height: STACK_ELEMENT_HEIGHT - 6,
        },
        metadata: {
          index,
          isTop: item.id === state.topId,
          stableId: item.id,
        },
      };
    });
  }

  /**
   * Generates pointer annotation for TOP.
   */
  override buildCustomAnnotations(
    state: StackState,
    step?: ExecutionStep<StackState> | null
  ): readonly VisualizationAnnotation[] {
    const annotations: VisualizationAnnotation[] = [];

    if (state.topId) {
      annotations.push({
        id: `anno-stack-top-${state.topId}`,
        type: "pointer",
        text: "TOP",
        targetId: state.topId,
        position: { x: -60, y: 0 },
        metadata: { role: "top" },
      });
    }

    if (step?.metadata?.pointers && Array.isArray(step.metadata.pointers)) {
      const pointers = step.metadata.pointers as Array<{ index: number; label: string }>;
      pointers.forEach((ptr, i) => {
        const targetItem = state.items[ptr.index];
        if (targetItem && ptr.label !== "TOP") {
          annotations.push({
            id: `anno-step-ptr-${ptr.index}-${i}`,
            type: "pointer",
            text: ptr.label,
            targetId: targetItem.id,
            position: { x: 80, y: 0 },
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
    state: StackState,
    step?: ExecutionStep<StackState> | null
  ): readonly VisualizationHighlight[] {
    if (!step || !step.highlightedElements || step.highlightedElements.length === 0) {
      return [];
    }

    let highlightType: HighlightType = "active";
    let priority = 50;

    switch (step.operation) {
      case "insert":
        highlightType = "inserted";
        priority = 80;
        break;
      case "delete":
        highlightType = "deleted";
        priority = 80;
        break;
      case "select":
        highlightType = "active";
        priority = 70;
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

export const defaultStackAdapter = new StackAdapter();
