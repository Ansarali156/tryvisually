import { describe, it, expect } from "vitest";
import {
  generateAddNodeTrace,
  generateAddEdgeTrace,
  generateDeleteNodeTrace,
} from "../trace-generators";
import { createSampleUndirectedWeightedGraph } from "../sample-graphs";

describe("Graph Execution Trace Immutability", () => {
  it("should maintain immutable snapshots across add node trace steps", () => {
    const initial = createSampleUndirectedWeightedGraph();
    const initialNodeCount = initial.nodes.length;
    const initialEdgeCount = initial.edges.length;

    const trace = generateAddNodeTrace(initial, "E");

    // Verify step count
    expect(trace.steps.length).toBeGreaterThanOrEqual(3);

    // Initial state before trace must be untouched
    expect(initial.nodes).toHaveLength(initialNodeCount);
    expect(initial.edges).toHaveLength(initialEdgeCount);

    // Step 0 must reflect 4 nodes
    expect(trace.steps[0].state.nodes).toHaveLength(4);

    // Final step must reflect 5 nodes
    const finalStep = trace.steps[trace.steps.length - 1];
    expect(finalStep.state.nodes).toHaveLength(5);
    expect(finalStep.state.nodes.some((n) => n.label === "E")).toBe(true);

    // Verify that modifying a local reference does not mutate past step states
    expect(trace.steps[0].state.nodes).toHaveLength(4);
  });

  it("should maintain immutable snapshots across delete node trace steps", () => {
    const initial = createSampleUndirectedWeightedGraph(); // 4 nodes, 4 edges
    const trace = generateDeleteNodeTrace(initial, "B");

    expect(trace.steps.length).toBeGreaterThanOrEqual(3);

    // Step 0: all 4 nodes and 4 edges intact
    expect(trace.steps[0].state.nodes).toHaveLength(4);
    expect(trace.steps[0].state.edges).toHaveLength(4);

    // Final step: node B and its incident edges (A-B, B-D) removed
    const finalStep = trace.steps[trace.steps.length - 1];
    expect(finalStep.state.nodes).toHaveLength(3);
    expect(finalStep.state.nodes.some((n) => n.label === "B")).toBe(false);
    expect(finalStep.state.edges).toHaveLength(2); // Only A-C and C-D remain

    // Step 0 still has 4 nodes and 4 edges
    expect(trace.steps[0].state.nodes).toHaveLength(4);
    expect(trace.steps[0].state.edges).toHaveLength(4);
  });

  it("should maintain immutable snapshots across add edge trace steps", () => {
    const initial = createSampleUndirectedWeightedGraph();
    const trace = generateAddEdgeTrace(initial, "B", "C", 7);

    // Step 0 should have original 4 edges
    expect(trace.steps[0].state.edges).toHaveLength(4);

    // Final step should have 5 edges
    const finalStep = trace.steps[trace.steps.length - 1];
    expect(finalStep.state.edges).toHaveLength(5);
    const added = finalStep.state.edges.find(
      (e) =>
        (e.sourceId === "node-b" && e.targetId === "node-c") ||
        (e.sourceId === "node-c" && e.targetId === "node-b")
    );
    expect(added).toBeDefined();
    expect(added?.weight).toBe(7);

    // Step 0 untouched
    expect(trace.steps[0].state.edges).toHaveLength(4);
  });
});
