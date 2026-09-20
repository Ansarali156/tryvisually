import { describe, it, expect } from "vitest";
import { defaultTreeAdapter } from "../tree-adapter";
import { createSampleBSTState } from "../validation";

describe("Tree Adapter", () => {
  it("should transform tree state into visualization elements with positions and metadata", () => {
    const sample = createSampleBSTState();
    const visState = defaultTreeAdapter.createInitialState(sample);

    expect(visState.elements.length).toBe(7);

    const rootElement = visState.elements.find((el) => el.id === "node-50");
    expect(rootElement).toBeDefined();
    expect(rootElement?.type).toBe("node");
    expect(rootElement?.label).toBe("50");
    expect(rootElement?.position).toBeDefined();
    expect(rootElement?.metadata?.isRoot).toBe(true);
  });

  it("should generate directed child connections with stable IDs", () => {
    const sample = createSampleBSTState();
    const visState = defaultTreeAdapter.createInitialState(sample);

    // 7 nodes in balanced binary tree has 6 edges
    expect(visState.connections.length).toBe(6);

    const edge50to30 = visState.connections.find((c) => c.sourceId === "node-50" && c.targetId === "node-30");
    expect(edge50to30).toBeDefined();
    expect(edge50to30?.directed).toBe(true);
    expect(edge50to30?.id).toBe("edge-node-50-node-30");
  });
});
