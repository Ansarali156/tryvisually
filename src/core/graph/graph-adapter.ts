/**
 * Graph Visualization Adapter
 *
 * Transforms canonical GraphState snapshots and ExecutionSteps into
 * renderer-independent VisualizationState elements, connections, and semantic highlights.
 */

import type { ExecutionStep } from "@/core/execution/types";
import { BaseVisualizationAdapter } from "@/core/visualization/adapters/base-adapter";
import type {
  VisualizationElement,
  VisualizationConnection,
  VisualizationHighlight,
} from "@/core/visualization/types";
import type { GraphState } from "./types";
import { calculateNodeDegrees } from "./validation";

export class GraphAdapter extends BaseVisualizationAdapter<GraphState> {
  readonly name = "GraphAdapter";

  buildElements(
    state: GraphState,
    _step?: ExecutionStep<GraphState> | null
  ): readonly VisualizationElement[] {
    return state.nodes.map((node) => {
      const degrees = calculateNodeDegrees(state, node.id);
      return {
        id: `node:${node.id}`,
        type: "node",
        value: node.label,
        label: node.label,
        position: { x: node.x, y: node.y },
        dimensions: { width: 48, height: 48 },
        metadata: {
          rawId: node.id,
          label: node.label,
          degree: degrees.degree,
          inDegree: degrees.inDegree,
          outDegree: degrees.outDegree,
          directed: state.directed,
        },
      };
    });
  }

  override buildConnections(
    state: GraphState,
    step?: ExecutionStep<GraphState> | null
  ): readonly VisualizationConnection[] {
    const highlightedElementIds = new Set(step?.highlightedElements || []);

    return state.edges.map((edge) => {
      const isHighlighted =
        highlightedElementIds.has(edge.id) ||
        highlightedElementIds.has(`edge:${edge.id}`);

      return {
        id: `edge:${edge.id}`,
        sourceId: `node:${edge.sourceId}`,
        targetId: `node:${edge.targetId}`,
        type: "edge",
        directed: edge.directed,
        weight: state.weighted ? edge.weight : undefined,
        highlighted: isHighlighted,
        metadata: {
          rawId: edge.id,
          sourceId: edge.sourceId,
          targetId: edge.targetId,
          weight: edge.weight,
        },
      };
    });
  }

  override buildCustomHighlights(
    state: GraphState,
    step?: ExecutionStep<GraphState> | null
  ): readonly VisualizationHighlight[] {
    const highlights: VisualizationHighlight[] = [];

    // 1. Highlight selected node
    if (state.selectedNodeId) {
      highlights.push({
        elementId: `node:${state.selectedNodeId}`,
        type: "selected",
        priority: 15,
      });
    }

    // 2. Highlight selected edge
    if (state.selectedEdgeId) {
      highlights.push({
        elementId: `edge:${state.selectedEdgeId}`,
        type: "selected",
        priority: 15,
      });
    }

    // 3. Highlight elements from step execution
    if (step?.highlightedElements) {
      for (const rawId of step.highlightedElements) {
        if (rawId.startsWith("node-")) {
          highlights.push({
            elementId: `node:${rawId}`,
            type: "current",
            priority: 20,
          });
        } else if (rawId.startsWith("edge-")) {
          highlights.push({
            elementId: `edge:${rawId}`,
            type: "current",
            priority: 20,
          });
        }
      }
    }

    return highlights;
  }
}
