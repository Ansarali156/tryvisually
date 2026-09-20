/**
 * Queue Visualization Adapter
 *
 * Transforms a QueueState snapshot and ExecutionStep into declarative VisualizationState.
 * Supports horizontal FIFO queue lanes (linear) and bounded buffer slots (circular)
 * with dedicated FRONT and REAR pointer annotations.
 */

import { BaseVisualizationAdapter } from "@/core/visualization/adapters/base-adapter";
import type { ExecutionStep } from "@/core/execution/types";
import type {
  VisualizationElement,
  VisualizationAnnotation,
  VisualizationHighlight,
  HighlightType,
} from "@/core/visualization/types";
import type { QueueState } from "./types";

export const QUEUE_SLOT_WIDTH = 76;

export class QueueAdapter extends BaseVisualizationAdapter<QueueState> {
  readonly name = "queue-adapter";

  /**
   * Convenience adapter method for converting an ExecutionStep directly.
   */
  adapt(step: ExecutionStep<QueueState>) {
    return this.transform(step.state, step);
  }

  /**
   * Converts queue slots/elements into horizontal visual elements.
   */
  buildElements(
    state: QueueState,
    _step?: ExecutionStep<QueueState> | null
  ): readonly VisualizationElement[] {
    const isCircular = state.variant === "circular";

    if (isCircular) {
      // Circular queue renders all capacity slots (occupied or empty)
      return state.items.map((item, slotIndex) => {
        const isOccupied = item !== null;
        const isFront = slotIndex === state.frontIndex && state.size > 0;
        const isRear = slotIndex === state.rearIndex && state.size > 0;

        return {
          id: isOccupied ? item.id : `empty-slot-${slotIndex}`,
          type: "node",
          value: isOccupied ? item.value : 0,
          label: isOccupied ? String(item.value) : "—",
          position: {
            x: slotIndex * QUEUE_SLOT_WIDTH,
            y: 0,
          },
          dimensions: {
            width: 56,
            height: 56,
          },
          metadata: {
            slotIndex,
            isOccupied,
            isFront,
            isRear,
            stableId: isOccupied ? item.id : null,
            variant: "circular",
          },
        };
      });
    }

    // Linear queue renders active items
    return state.items.map((item, index) => {
      if (!item) {
        return {
          id: `empty-${index}`,
          type: "node",
          value: 0,
          label: "",
        };
      }

      const isFront = index === 0;
      const isRear = index === state.size - 1;

      return {
        id: item.id,
        type: "node",
        value: item.value,
        label: String(item.value),
        position: {
          x: index * QUEUE_SLOT_WIDTH,
          y: 0,
        },
        dimensions: {
          width: 56,
          height: 56,
        },
        metadata: {
          index,
          isFront,
          isRear,
          stableId: item.id,
          variant: "linear",
        },
      };
    });
  }

  /**
   * Generates pointer annotations for FRONT and REAR.
   */
  override buildCustomAnnotations(
    state: QueueState,
    _step?: ExecutionStep<QueueState> | null
  ): readonly VisualizationAnnotation[] {
    const annotations: VisualizationAnnotation[] = [];

    if (state.frontId) {
      annotations.push({
        id: `anno-queue-front-${state.frontId}`,
        type: "pointer",
        text: "FRONT",
        targetId: state.frontId,
        position: { x: 0, y: -30 },
        metadata: { role: "front" },
      });
    }

    if (state.rearId) {
      annotations.push({
        id: `anno-queue-rear-${state.rearId}`,
        type: "pointer",
        text: "REAR",
        targetId: state.rearId,
        position: { x: 0, y: 50 },
        metadata: { role: "rear" },
      });
    }

    return Object.freeze(annotations);
  }

  /**
   * Derives semantic highlights from current step operation.
   */
  override buildCustomHighlights(
    state: QueueState,
    step?: ExecutionStep<QueueState> | null
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

export const defaultQueueAdapter = new QueueAdapter();
