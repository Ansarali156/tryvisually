import { describe, it, expect } from "vitest";
import { GraphAdapter } from "../graph-adapter";
import {
  createSampleUndirectedWeightedGraph,
  createSampleDirectedGraph,
} from "../sample-graphs";
import type { ExecutionStep } from "@/core/execution/types";
import type { GraphState } from "../types";

describe("GraphAdapter", () => {
  const adapter = new GraphAdapter();

  it("should generate stable visual node IDs for vertices", () => {
    const graph = createSampleUndirectedWeightedGraph();
    const elements = adapter.buildElements(graph);

    expect(elements).toHaveLength(4);
    for (const el of elements) {
      expect(el.id).toMatch(/^node:node-[a-z0-9]+$/);
      expect(el.type).toBe("node");
      expect(el.label).toBeDefined();
      expect(el.position).toBeDefined();
      expect(typeof el.position?.x).toBe("number");
      expect(typeof el.position?.y).toBe("number");
    }
  });

  it("should generate stable visual connection IDs with weights and direction", () => {
    const graph = createSampleUndirectedWeightedGraph();
    const connections = adapter.buildConnections(graph);

    expect(connections).toHaveLength(4);
    for (const conn of connections) {
      expect(conn.id).toMatch(/^edge:edge-.+$/);
      expect(conn.sourceId).toMatch(/^node:node-.+$/);
      expect(conn.targetId).toMatch(/^node:node-.+$/);
      expect(conn.type).toBe("edge");
      expect(conn.directed).toBe(false);
      expect(typeof conn.weight).toBe("number");
    }
  });

  it("should correctly handle directed connections", () => {
    const graph = createSampleDirectedGraph();
    const connections = adapter.buildConnections(graph);

    expect(connections).toHaveLength(4);
    for (const conn of connections) {
      expect(conn.directed).toBe(true);
      expect(conn.weight).toBeUndefined(); // Unweighted
    }
  });

  it("should derive semantic highlights for selected and step-highlighted elements", () => {
    const graph = createSampleUndirectedWeightedGraph();
    const step: ExecutionStep<GraphState> = {
      id: 1,
      operation: "insert",
      variables: {},
      state: graph,
      highlightedElements: ["node-a", "edge-node-a--node-b"],
      explanation: "Testing highlights",
    };

    const highlights = adapter.buildCustomHighlights(
      { ...graph, selectedNodeId: "node-c" },
      step
    );

    expect(highlights.some((h) => h.elementId === "node:node-c" && h.type === "selected")).toBe(true);
    expect(highlights.some((h) => h.elementId === "node:node-a" && h.type === "current")).toBe(true);
    expect(highlights.some((h) => h.elementId === "edge:edge-node-a--node-b" && h.type === "current")).toBe(true);
  });
});
