/**
 * Generic Demonstration Visualization Adapter
 *
 * Implements BaseVisualizationAdapter for DemoState.
 * Transforms DemoState into semantic elements (items), sequential connections,
 * and annotations for accumulator / counter state.
 */

import { BaseVisualizationAdapter } from "./base-adapter";
import type { DemoState } from "@/core/execution/demonstration/sample-trace";
import type { ExecutionStep } from "@/core/execution/types";
import type {
  VisualizationElement,
  VisualizationConnection,
  VisualizationAnnotation,
} from "../types";
import { createConnectionId } from "../utils/stable-id";

export class GenericDemoAdapter extends BaseVisualizationAdapter<DemoState> {
  readonly name = "generic-demo-adapter";

  buildElements(
    state: DemoState,
    _step?: ExecutionStep<DemoState> | null
  ): readonly VisualizationElement[] {
    return state.items.map((item, index) => ({
      id: item.id,
      type: "item",
      value: item.value,
      label: String(item.value),
      position: { x: index * 90, y: 0 },
      dimensions: { width: 72, height: 72 },
      state: item.status,
      metadata: {
        index,
        originalStatus: item.status,
      },
    }));
  }

  buildConnections(
    state: DemoState,
    _step?: ExecutionStep<DemoState> | null
  ): readonly VisualizationConnection[] {
    const connections: VisualizationConnection[] = [];
    for (let i = 0; i < state.items.length - 1; i++) {
      const source = state.items[i];
      const target = state.items[i + 1];
      connections.push({
        id: createConnectionId(source.id, target.id, "next"),
        sourceId: source.id,
        targetId: target.id,
        type: "next",
        directed: true,
      });
    }
    return connections;
  }

  buildCustomAnnotations(
    state: DemoState,
    step?: ExecutionStep<DemoState> | null
  ): readonly VisualizationAnnotation[] {
    const annotations: VisualizationAnnotation[] = [];

    // If step references a current element, add a pointer annotation
    if (step && step.highlightedElements.length > 0) {
      const activeId = step.highlightedElements[0];
      annotations.push({
        id: `pointer-${activeId}`,
        text: `Target (counter=${state.counter})`,
        targetId: activeId,
        type: "pointer",
      });
    }

    return annotations;
  }
}
