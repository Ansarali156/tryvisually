import { describe, it, expect } from "vitest";
import { BaseVisualizationAdapter } from "../adapters/base-adapter";
import type {
  VisualizationElement,
  VisualizationConnection,
  VisualizationHighlight,
  VisualizationState,
} from "../types";
import { createCellId, createStableId, createConnectionId } from "../utils/stable-id";
import type { ExecutionStep } from "@/core/execution/types";

describe("Data Structure Compatibility Proof", () => {
  // 1. ARRAY COMPATIBILITY
  it("should cleanly model an Array data structure with swaps and comparisons", () => {
    interface ArrayState {
      array: number[];
      comparing: [number, number] | null;
    }

    class ArrayAdapter extends BaseVisualizationAdapter<ArrayState> {
      readonly name = "array-adapter";
      buildElements(state: ArrayState): readonly VisualizationElement[] {
        return state.array.map((val, idx) => ({
          id: createStableId("arr", idx),
          type: "bar",
          value: val,
          label: String(val),
          position: { x: idx * 40, y: 0 },
          dimensions: { width: 32, height: val * 4 },
        }));
      }

      buildCustomHighlights(state: ArrayState): readonly VisualizationHighlight[] {
        if (!state.comparing) return [];
        return [
          { elementId: createStableId("arr", state.comparing[0]), type: "compare" },
          { elementId: createStableId("arr", state.comparing[1]), type: "compare" },
        ];
      }
    }

    const adapter = new ArrayAdapter();
    const vis = adapter.transform({ array: [50, 20, 80], comparing: [0, 1] });

    expect(vis.elements).toHaveLength(3);
    expect(vis.elements[0].type).toBe("bar");
    expect(vis.highlights).toHaveLength(2);
    expect(vis.highlights[0].type).toBe("compare");
  });

  // 2. LINKED LIST COMPATIBILITY
  it("should cleanly model a Singly & Doubly Linked List with pointers", () => {
    interface ListNode {
      id: string;
      value: string;
      nextId: string | null;
      prevId: string | null;
    }

    interface LinkedListState {
      nodes: Record<string, ListNode>;
      headId: string | null;
    }

    class LinkedListAdapter extends BaseVisualizationAdapter<LinkedListState> {
      readonly name = "linked-list-adapter";
      buildElements(state: LinkedListState): readonly VisualizationElement[] {
        return Object.values(state.nodes).map((node, index) => ({
          id: node.id,
          type: "node",
          value: node.value,
          label: node.value,
          position: { x: index * 120, y: 0 },
        }));
      }

      buildConnections(state: LinkedListState): readonly VisualizationConnection[] {
        const conns: VisualizationConnection[] = [];
        for (const node of Object.values(state.nodes)) {
          if (node.nextId) {
            conns.push({
              id: createConnectionId(node.id, node.nextId, "next"),
              sourceId: node.id,
              targetId: node.nextId,
              type: "next",
              directed: true,
            });
          }
          if (node.prevId) {
            conns.push({
              id: createConnectionId(node.id, node.prevId, "previous"),
              sourceId: node.id,
              targetId: node.prevId,
              type: "previous",
              directed: true,
            });
          }
        }
        return conns;
      }
    }

    const adapter = new LinkedListAdapter();
    const vis = adapter.transform({
      nodes: {
        "node-1": { id: "node-1", value: "A", nextId: "node-2", prevId: null },
        "node-2": { id: "node-2", value: "B", nextId: null, prevId: "node-1" },
      },
      headId: "node-1",
    });

    expect(vis.elements).toHaveLength(2);
    expect(vis.connections).toHaveLength(2); // forward and backward
    expect(vis.connections[0].type).toBe("next");
    expect(vis.connections[1].type).toBe("previous");
  });

  // 3. TREE COMPATIBILITY
  it("should cleanly model a Binary Tree with parent/child relationships", () => {
    interface TreeNode {
      id: string;
      value: number;
      left?: string;
      right?: string;
      depth: number;
    }

    interface TreeState {
      nodes: Record<string, TreeNode>;
      rootId: string;
    }

    class TreeAdapter extends BaseVisualizationAdapter<TreeState> {
      readonly name = "tree-adapter";
      buildElements(state: TreeState): readonly VisualizationElement[] {
        return Object.values(state.nodes).map((n) => ({
          id: n.id,
          type: "node",
          value: n.value,
          label: String(n.value),
          metadata: { depth: n.depth },
        }));
      }

      buildConnections(state: TreeState): readonly VisualizationConnection[] {
        const conns: VisualizationConnection[] = [];
        for (const node of Object.values(state.nodes)) {
          if (node.left) {
            conns.push({
              id: createConnectionId(node.id, node.left, "child"),
              sourceId: node.id,
              targetId: node.left,
              type: "child",
              label: "L",
              directed: true,
            });
          }
          if (node.right) {
            conns.push({
              id: createConnectionId(node.id, node.right, "child"),
              sourceId: node.id,
              targetId: node.right,
              type: "child",
              label: "R",
              directed: true,
            });
          }
        }
        return conns;
      }
    }

    const adapter = new TreeAdapter();
    const vis = adapter.transform({
      rootId: "tree-1",
      nodes: {
        "tree-1": { id: "tree-1", value: 50, left: "tree-2", right: "tree-3", depth: 0 },
        "tree-2": { id: "tree-2", value: 30, depth: 1 },
        "tree-3": { id: "tree-3", value: 70, depth: 1 },
      },
    });

    expect(vis.elements).toHaveLength(3);
    expect(vis.connections).toHaveLength(2);
    expect(vis.connections[0].sourceId).toBe("tree-1");
  });

  // 4. GRAPH COMPATIBILITY
  it("should cleanly model a Weighted Directed Graph with shortest-path highlights", () => {
    interface GraphState {
      vertices: string[];
      edges: Array<{ from: string; to: string; weight: number }>;
      shortestPath: string[];
    }

    class GraphAdapter extends BaseVisualizationAdapter<GraphState> {
      readonly name = "graph-adapter";
      buildElements(state: GraphState): readonly VisualizationElement[] {
        return state.vertices.map((v) => ({
          id: v,
          type: "node",
          value: v,
          label: v,
        }));
      }

      buildConnections(state: GraphState): readonly VisualizationConnection[] {
        return state.edges.map((e) => ({
          id: createConnectionId(e.from, e.to, "edge"),
          sourceId: e.from,
          targetId: e.to,
          type: "edge",
          weight: e.weight,
          directed: true,
        }));
      }

      buildCustomHighlights(state: GraphState): readonly VisualizationHighlight[] {
        return state.shortestPath.map((v) => ({
          elementId: v,
          type: "path",
        }));
      }
    }

    const adapter = new GraphAdapter();
    const vis = adapter.transform({
      vertices: ["A", "B", "C"],
      edges: [
        { from: "A", to: "B", weight: 4 },
        { from: "B", to: "C", weight: 2 },
      ],
      shortestPath: ["A", "B", "C"],
    });

    expect(vis.elements).toHaveLength(3);
    expect(vis.connections).toHaveLength(2);
    expect(vis.connections[0].weight).toBe(4);
    expect(vis.highlights).toHaveLength(3);
    expect(vis.highlights.every((h) => h.type === "path")).toBe(true);
  });

  // 5. RECURSION CALL STACK COMPATIBILITY
  it("should cleanly model a Recursion Call Stack with stack frames", () => {
    interface StackFrame {
      callId: string;
      functionName: string;
      args: Record<string, unknown>;
      returnValue?: unknown;
    }

    interface RecursionState {
      stack: StackFrame[];
      currentDepth: number;
    }

    class RecursionAdapter extends BaseVisualizationAdapter<RecursionState> {
      readonly name = "recursion-adapter";
      buildElements(state: RecursionState): readonly VisualizationElement[] {
        return state.stack.map((frame, index) => ({
          id: frame.callId,
          type: "frame",
          value: frame.args,
          label: `${frame.functionName}(${JSON.stringify(frame.args)})`,
          position: { x: 0, y: index * 50 },
          metadata: { depth: index, returnValue: frame.returnValue },
        }));
      }
    }

    const adapter = new RecursionAdapter();
    const vis = adapter.transform({
      stack: [
        { callId: "frame-0", functionName: "fib", args: { n: 4 } },
        { callId: "frame-1", functionName: "fib", args: { n: 3 } },
      ],
      currentDepth: 2,
    });

    expect(vis.elements).toHaveLength(2);
    expect(vis.elements[0].type).toBe("frame");
    expect(vis.elements[1].label).toBe('fib({"n":3})');
  });

  // 6. DYNAMIC PROGRAMMING GRID COMPATIBILITY
  it("should cleanly model a 2D DP table with cell coordinates and dependencies", () => {
    interface DPState {
      table: number[][];
      activeCell: [number, number] | null;
    }

    class DPAdapter extends BaseVisualizationAdapter<DPState> {
      readonly name = "dp-adapter";
      buildElements(state: DPState): readonly VisualizationElement[] {
        const elements: VisualizationElement[] = [];
        state.table.forEach((row, r) => {
          row.forEach((val, c) => {
            elements.push({
              id: createCellId(r, c),
              type: "cell",
              value: val,
              label: String(val),
              position: { x: c * 50, y: r * 50 },
              dimensions: { width: 45, height: 45 },
            });
          });
        });
        return elements;
      }

      buildCustomHighlights(state: DPState): readonly VisualizationHighlight[] {
        if (!state.activeCell) return [];
        return [
          {
            elementId: createCellId(state.activeCell[0], state.activeCell[1]),
            type: "current",
          },
        ];
      }
    }

    const adapter = new DPAdapter();
    const vis = adapter.transform({
      table: [
        [0, 1],
        [1, 2],
      ],
      activeCell: [1, 1],
    });

    expect(vis.elements).toHaveLength(4);
    expect(vis.elements[3].id).toBe("cell-1-1");
    expect(vis.elements[3].type).toBe("cell");
    expect(vis.highlights).toHaveLength(1);
    expect(vis.highlights[0].elementId).toBe("cell-1-1");
  });
});
