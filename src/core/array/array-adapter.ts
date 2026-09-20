/**
 * Array Visualization Adapter
 *
 * Transforms an ArrayState snapshot and current ExecutionStep into renderer-independent VisualizationState.
 * Adheres strictly to the BaseVisualizationAdapter contract.
 */

import { BaseVisualizationAdapter } from "@/core/visualization/adapters/base-adapter";
import type { ExecutionStep } from "@/core/execution/types";
import type {
  VisualizationElement,
  VisualizationAnnotation,
  VisualizationHighlight,
  HighlightType,
} from "@/core/visualization/types";
import type { ArrayState } from "./types";

export const ARRAY_ITEM_WIDTH = 64;
export const ARRAY_ITEM_HEIGHT = 64;

export class ArrayAdapter extends BaseVisualizationAdapter<ArrayState> {
  readonly name = "array-adapter";

  /**
   * Converts array items to visual elements with stable IDs and spatial coordinates.
   */
  buildElements(
    state: ArrayState,
    _step?: ExecutionStep<ArrayState> | null
  ): readonly VisualizationElement[] {
    return state.items.map((item, index) => ({
      id: item.id,
      type: "item",
      value: item.value,
      label: String(item.value),
      position: {
        x: index * ARRAY_ITEM_WIDTH,
        y: 0,
      },
      dimensions: {
        width: 56,
        height: 56,
      },
      metadata: {
        index,
        stableId: item.id,
      },
    }));
  }

  /**
   * Extracts educational pointer annotations from step metadata.
   */
  override buildCustomAnnotations(
    state: ArrayState,
    step?: ExecutionStep<ArrayState> | null
  ): readonly VisualizationAnnotation[] {
    if (!step?.metadata?.pointers || !Array.isArray(step.metadata.pointers)) {
      return [];
    }

    const annotations: VisualizationAnnotation[] = [];
    const pointers = step.metadata.pointers as Array<{ index: number; label: string }>;

    pointers.forEach((ptr, i) => {
      const targetElem = state.items[ptr.index];
      if (targetElem) {
        annotations.push({
          id: `anno-ptr-${ptr.index}-${i}`,
          type: "pointer",
          text: ptr.label,
          targetId: targetElem.id,
          position: {
            x: ptr.index * ARRAY_ITEM_WIDTH,
            y: -24, // Pointer positioned slightly above element
          },
          metadata: {
            index: ptr.index,
            label: ptr.label,
          },
        });
      }
    });

    return annotations;
  }

  /**
   * Translates step operation into semantic visual highlights.
   */
  override buildCustomHighlights(
    state: ArrayState,
    step?: ExecutionStep<ArrayState> | null
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
      case "swap":
        highlightType = "swapped";
        priority = 80;
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
      case "select":
      case "update":
        highlightType = "active";
        priority = 60;
        break;
      case "custom":
        if (step.metadata?.settledId) {
          highlightType = "visited";
          priority = 40;
        }
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

export const defaultArrayAdapter = new ArrayAdapter();
