import { describe, it, expect } from "vitest";
import {
  generateTransitions,
  calculateEffectiveDuration,
} from "../transitions/transition-generator";
import type { VisualizationState } from "@/core/visualization/types";

describe("Transition Generator", () => {
  const stateA: VisualizationState = {
    sourceState: {},
    elements: [
      { id: "elem-0", type: "item", value: 10, position: { x: 0, y: 0 } },
      { id: "elem-1", type: "item", value: 20, position: { x: 50, y: 0 } },
    ],
    connections: [
      { id: "conn-0-1", sourceId: "elem-0", targetId: "elem-1", type: "next" },
    ],
    highlights: [
      { elementId: "elem-0", type: "compare" },
    ],
    annotations: [],
  };

  it("generates insert transitions for all elements in initial state", () => {
    const transitions = generateTransitions(null, stateA);

    expect(transitions).toHaveLength(3); // 2 inserts + 1 connect
    expect(transitions[0]).toMatchObject({
      id: "tr-insert-elem-0",
      type: "insert",
      targetIds: ["elem-0"],
    });
    expect(transitions[1]).toMatchObject({
      id: "tr-insert-elem-1",
      type: "insert",
      targetIds: ["elem-1"],
    });
    expect(transitions[2]).toMatchObject({
      id: "tr-connect-conn-0-1",
      type: "connect",
      targetIds: ["conn-0-1"],
    });
  });

  it("generates swap transition when two elements exchange positions", () => {
    const stateB: VisualizationState = {
      sourceState: {},
      elements: [
        { id: "elem-0", type: "item", value: 10, position: { x: 50, y: 0 } },
        { id: "elem-1", type: "item", value: 20, position: { x: 0, y: 0 } },
      ],
      connections: stateA.connections,
      highlights: stateA.highlights,
      annotations: [],
    };

    const transitions = generateTransitions(stateA, stateB);

    const swapTr = transitions.find((t) => t.type === "swap");
    expect(swapTr).toBeDefined();
    expect(swapTr?.targetIds).toEqual(["elem-0", "elem-1"]);
  });

  it("generates move transition when single element moves", () => {
    const stateB: VisualizationState = {
      sourceState: {},
      elements: [
        { id: "elem-0", type: "item", value: 10, position: { x: 100, y: 0 } },
        { id: "elem-1", type: "item", value: 20, position: { x: 50, y: 0 } }, // unchanged
      ],
      connections: stateA.connections,
      highlights: stateA.highlights,
      annotations: [],
    };

    const transitions = generateTransitions(stateA, stateB);

    const moveTr = transitions.find((t) => t.type === "move");
    expect(moveTr).toBeDefined();
    expect(moveTr?.targetIds).toEqual(["elem-0"]);
  });

  it("generates insert transition when new element is added", () => {
    const stateWithNewElem: VisualizationState = {
      sourceState: {},
      elements: [
        ...stateA.elements,
        { id: "elem-2", type: "item", value: 30, position: { x: 100, y: 0 } },
      ],
      connections: stateA.connections,
      highlights: stateA.highlights,
      annotations: [],
    };

    const transitions = generateTransitions(stateA, stateWithNewElem);

    const insertTr = transitions.find((t) => t.type === "insert");
    expect(insertTr).toBeDefined();
    expect(insertTr?.targetIds).toEqual(["elem-2"]);
  });

  it("generates delete transition when an element is removed", () => {
    const stateWithRemovedElem: VisualizationState = {
      sourceState: {},
      elements: [stateA.elements[0]], // elem-1 removed
      connections: [],
      highlights: stateA.highlights,
      annotations: [],
    };

    const transitions = generateTransitions(stateA, stateWithRemovedElem);

    const deleteTr = transitions.find((t) => t.type === "delete");
    expect(deleteTr).toBeDefined();
    expect(deleteTr?.targetIds).toEqual(["elem-1"]);
  });

  it("generates highlight transition when semantic highlight changes", () => {
    const stateWithNewHighlight: VisualizationState = {
      sourceState: {},
      elements: stateA.elements,
      connections: stateA.connections,
      highlights: [
        { elementId: "elem-0", type: "found" }, // changed from "compare" to "found"
      ],
      annotations: [],
    };

    const transitions = generateTransitions(stateA, stateWithNewHighlight);

    const hlTr = transitions.find((t) => t.type === "highlight");
    expect(hlTr).toBeDefined();
    expect(hlTr?.targetIds).toEqual(["elem-0"]);
  });

  it("is strictly deterministic across multiple runs", () => {
    const stateB: VisualizationState = {
      sourceState: {},
      elements: [
        { id: "elem-0", type: "item", value: 10, position: { x: 50, y: 0 } },
        { id: "elem-1", type: "item", value: 20, position: { x: 0, y: 0 } },
      ],
      connections: [],
      highlights: [{ elementId: "elem-1", type: "found" }],
      annotations: [],
    };

    const run1 = generateTransitions(stateA, stateB);
    const run2 = generateTransitions(stateA, stateB);

    expect(run1).toEqual(run2);
  });

  it("returns 0 duration when reducedMotion is active", () => {
    const duration = calculateEffectiveDuration({ reducedMotion: true });
    expect(duration).toBe(0);
  });
});
