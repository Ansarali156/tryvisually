/**
 * Tree Visualization Adapter
 *
 * Transforms raw TreeState snapshots into generic VisualizationState elements
 * and connections, calculating deterministic coordinates via computeTreeLayout.
 */

import type { ExecutionStep } from "@/core/execution/types";
import { BaseVisualizationAdapter } from "@/core/visualization/adapters/base-adapter";
import type {
  VisualizationElement,
  VisualizationConnection,
  VisualizationHighlight,
} from "@/core/visualization/types";
import type { TreeState } from "./types";
import { computeTreeLayout } from "./layout";

export class TreeAdapter extends BaseVisualizationAdapter<TreeState<number>> {
  readonly name = "TreeAdapter";

  buildElements(
    state: TreeState<number>,
    _step?: ExecutionStep<TreeState<number>> | null
  ): readonly VisualizationElement[] {
    const layout = computeTreeLayout(state);
    const elements: VisualizationElement[] = [];

    for (const [id, node] of Object.entries(state.nodes)) {
      const pos = layout.positions[id];
      const isRoot = id === state.rootId;
      const isLeaf = !node.leftId && !node.rightId;

      elements.push({
        id,
        type: "node",
        value: node.value,
        label: String(node.value),
        position: pos ? { x: pos.x, y: pos.y } : { x: 0, y: 0 },
        metadata: {
          nodeId: id,
          leftId: node.leftId,
          rightId: node.rightId,
          parentId: node.parentId,
          isRoot,
          isLeaf,
          depth: pos ? pos.depth : 0,
          col: pos ? pos.col : 0,
        },
      });
    }

    return elements;
  }

  override buildConnections(
    state: TreeState<number>,
    step?: ExecutionStep<TreeState<number>> | null
  ): readonly VisualizationConnection[] {
    const connections: VisualizationConnection[] = [];
    const highlightedNodeIds = new Set(step?.highlightedElements || []);

    for (const [id, node] of Object.entries(state.nodes)) {
      // Left child edge
      if (node.leftId && state.nodes[node.leftId]) {
        const edgeId = `edge-${id}-${node.leftId}`;
        const isHighlighted = highlightedNodeIds.has(id) && highlightedNodeIds.has(node.leftId);
        connections.push({
          id: edgeId,
          sourceId: id,
          targetId: node.leftId,
          type: "child",
          directed: true,
          label: "L",
          highlighted: isHighlighted,
          metadata: { branch: "left" },
        });
      }

      // Right child edge
      if (node.rightId && state.nodes[node.rightId]) {
        const edgeId = `edge-${id}-${node.rightId}`;
        const isHighlighted = highlightedNodeIds.has(id) && highlightedNodeIds.has(node.rightId);
        connections.push({
          id: edgeId,
          sourceId: id,
          targetId: node.rightId,
          type: "child",
          directed: true,
          label: "R",
          highlighted: isHighlighted,
          metadata: { branch: "right" },
        });
      }
    }

    return connections;
  }

  override buildCustomHighlights(
    state: TreeState<number>,
    step?: ExecutionStep<TreeState<number>> | null
  ): readonly VisualizationHighlight[] {
    const highlights: VisualizationHighlight[] = [];

    // Root highlight indicator if empty highlight in step
    if (state.rootId && (!step || !step.highlightedElements || step.highlightedElements.length === 0)) {
      highlights.push({
        elementId: state.rootId,
        type: "selected",
        priority: 1,
      });
    }

    return highlights;
  }
}

export const defaultTreeAdapter = new TreeAdapter();
