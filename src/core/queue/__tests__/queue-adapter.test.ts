import { describe, it, expect, beforeEach } from "vitest";
import { QueueAdapter } from "../queue-adapter";
import { createQueueState, resetQueueIdCounter } from "../validation";
import type { ExecutionStep } from "@/core/execution/types";
import type { QueueState } from "../types";

describe("QueueAdapter", () => {
  const adapter = new QueueAdapter();

  beforeEach(() => {
    resetQueueIdCounter(1);
  });

  it("should convert a linear queue into horizontal visualization elements with FRONT and REAR", () => {
    const state = createQueueState([10, 20, 30], "linear");
    const step: ExecutionStep<QueueState> = {
      id: 0,
      operation: "custom",
      state,
      explanation: "Initial linear queue",
      variables: {},
      highlightedElements: [],
    };

    const vizState = adapter.adapt(step);

    expect(vizState.elements).toHaveLength(3);
    expect(vizState.elements[0].id).toBe("queue-item-1");
    expect(vizState.elements[0].value).toBe(10);
    expect(vizState.elements[0].position?.x).toBe(0);

    expect(vizState.elements[2].id).toBe("queue-item-3");
    expect(vizState.elements[2].value).toBe(30);

    const frontAnno = vizState.annotations.find((a) => a.text === "FRONT");
    const rearAnno = vizState.annotations.find((a) => a.text === "REAR");

    expect(frontAnno?.targetId).toBe("queue-item-1");
    expect(rearAnno?.targetId).toBe("queue-item-3");
  });

  it("should convert a circular queue into slot buffer elements including empty slots", () => {
    const state = createQueueState([10, 20], "circular", 4);
    const step: ExecutionStep<QueueState> = {
      id: 0,
      operation: "custom",
      state,
      explanation: "Initial circular queue",
      variables: {},
      highlightedElements: [],
    };

    const vizState = adapter.adapt(step);

    expect(vizState.elements).toHaveLength(4);
    expect(vizState.elements[0].value).toBe(10);
    expect(vizState.elements[1].value).toBe(20);
    expect(vizState.elements[2].metadata?.isOccupied).toBe(false);
    expect(vizState.elements[3].metadata?.isOccupied).toBe(false);
  });

  it("should generate semantic highlights from step operation", () => {
    const state = createQueueState([10, 20], "linear");
    const step: ExecutionStep<QueueState> = {
      id: 1,
      operation: "insert",
      state,
      explanation: "Enqueued item",
      variables: {},
      highlightedElements: ["queue-item-2"],
    };

    const vizState = adapter.adapt(step);
    const highlight = vizState.highlights.find((h) => h.elementId === "queue-item-2");
    expect(highlight).toBeDefined();
    expect(highlight?.type).toBe("inserted");
  });
});
