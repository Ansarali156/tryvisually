import { describe, it, expect } from "vitest";
import { GenericDemoAdapter } from "../adapters/generic-demo-adapter";
import { DemoState } from "@/core/execution/demonstration/sample-trace";
import type { ExecutionStep } from "@/core/execution/types";

describe("GenericDemoAdapter & BaseVisualizationAdapter", () => {
  const sampleState: DemoState = {
    counter: 1,
    accumulator: 10,
    items: [
      { id: "elem-0", value: 10, status: "visited" },
      { id: "elem-1", value: 20, status: "default" },
      { id: "elem-2", value: 30, status: "default" },
    ],
  };

  const sampleStep: ExecutionStep<DemoState> = {
    id: 1,
    operation: "compare",
    variables: { counter: 1, accumulator: 10 },
    state: sampleState,
    highlightedElements: ["elem-1"],
    explanation: "Inspecting element elem-1 with value 20",
  };

  it("should create initial visualization state", () => {
    const adapter = new GenericDemoAdapter();
    const visState = adapter.createInitialState(sampleState);

    expect(visState).toBeDefined();
    expect(visState.sourceState).toBe(sampleState);
    expect(visState.elements).toHaveLength(3);
    expect(visState.connections).toHaveLength(2); // elem-0 -> elem-1, elem-1 -> elem-2
    expect(visState.highlights).toHaveLength(0); // initial state has no step highlights
    expect(visState.annotations).toHaveLength(0);
  });

  it("should generate stable element identifiers and properties", () => {
    const adapter = new GenericDemoAdapter();
    const visState = adapter.transform(sampleState, sampleStep);

    const first = visState.elements[0];
    expect(first.id).toBe("elem-0");
    expect(first.type).toBe("item");
    expect(first.value).toBe(10);
    expect(first.label).toBe("10");
    expect(first.position).toEqual({ x: 0, y: 0 });
    expect(first.dimensions).toEqual({ width: 72, height: 72 });
    expect(first.state).toBe("visited");

    const second = visState.elements[1];
    expect(second.id).toBe("elem-1");
    expect(second.position).toEqual({ x: 90, y: 0 });
  });

  it("should generate directed sequential connections", () => {
    const adapter = new GenericDemoAdapter();
    const visState = adapter.transform(sampleState, sampleStep);

    expect(visState.connections).toHaveLength(2);
    expect(visState.connections[0]).toEqual({
      id: "conn-elem-0-elem-1-next",
      sourceId: "elem-0",
      targetId: "elem-1",
      type: "next",
      directed: true,
    });
  });

  it("should derive highlights and callout annotations from ExecutionStep", () => {
    const adapter = new GenericDemoAdapter();
    const visState = adapter.transform(sampleState, sampleStep);

    expect(visState.highlights).toHaveLength(1);
    expect(visState.highlights[0]).toEqual({
      elementId: "elem-1",
      type: "compare",
    });

    // Contains step callout annotation + custom pointer annotation
    expect(visState.annotations.length).toBeGreaterThanOrEqual(2);
    const stepCallout = visState.annotations.find((a) => a.type === "callout");
    expect(stepCallout?.text).toBe("Inspecting element elem-1 with value 20");

    const pointer = visState.annotations.find((a) => a.type === "pointer");
    expect(pointer?.targetId).toBe("elem-1");
  });

  it("should guarantee strict immutability via deepFreeze", () => {
    const adapter = new GenericDemoAdapter();
    const visState = adapter.transform(sampleState, sampleStep);

    expect(Object.isFrozen(visState)).toBe(true);
    expect(Object.isFrozen(visState.elements)).toBe(true);
    expect(Object.isFrozen(visState.elements[0])).toBe(true);
    expect(Object.isFrozen(visState.connections)).toBe(true);
    expect(Object.isFrozen(visState.highlights)).toBe(true);
    expect(Object.isFrozen(visState.annotations)).toBe(true);

    // Modifying frozen object throws in strict mode
    expect(() => {
      (visState as unknown as Record<string, unknown>).elements = [];
    }).toThrow();

    expect(() => {
      (visState.elements[0] as unknown as Record<string, unknown>).label = "mutated";
    }).toThrow();
  });

  it("should be deterministic across repeated calls", () => {
    const adapter = new GenericDemoAdapter();
    const stateA = adapter.transform(sampleState, sampleStep);
    const stateB = adapter.transform(sampleState, sampleStep);

    expect(stateA).toEqual(stateB);
  });
});
