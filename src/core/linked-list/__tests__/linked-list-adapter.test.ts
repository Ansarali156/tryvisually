import { describe, it, expect, beforeEach } from "vitest";
import { LinkedListAdapter } from "../linked-list-adapter";
import { createLinkedListState, resetNodeIdCounter } from "../validation";
import { ExecutionStep } from "../../execution/types";
import type { LinkedListState } from "../types";

describe("LinkedListAdapter", () => {
  const adapter = new LinkedListAdapter();

  beforeEach(() => {
    resetNodeIdCounter(1);
  });

  it("should convert a singly linked list state into visualization elements and connections", () => {
    const state = createLinkedListState([10, 20, 30], "singly");
    const step: ExecutionStep<LinkedListState> = {
      id: 0,
      operation: "custom",
      state,
      explanation: "Initial state",
      variables: {},
      highlightedElements: [],
    };

    const vizState = adapter.adapt(step);

    // Should have 3 node elements
    expect(vizState.elements).toHaveLength(3);
    expect(vizState.elements[0].id).toBe("node-1");
    expect(vizState.elements[0].value).toBe(10);
    expect(vizState.elements[0].position?.x).toBe(0);

    expect(vizState.elements[1].id).toBe("node-2");
    expect(vizState.elements[1].value).toBe(20);
    expect(vizState.elements[1].position?.x).toBe(160);

    expect(vizState.elements[2].id).toBe("node-3");
    expect(vizState.elements[2].value).toBe(30);
    expect(vizState.elements[2].position?.x).toBe(320);

    // Connections: 2 forward next connections
    expect(vizState.connections).toHaveLength(2);
    expect(vizState.connections[0]).toMatchObject({
      sourceId: "node-1",
      targetId: "node-2",
      label: "next",
      directed: true,
    });
    expect(vizState.connections[1]).toMatchObject({
      sourceId: "node-2",
      targetId: "node-3",
      label: "next",
      directed: true,
    });

    // Annotations: HEAD on node-1, TAIL on node-3
    const headAnnotation = vizState.annotations.find((a) => a.text === "HEAD");
    const tailAnnotation = vizState.annotations.find((a) => a.text === "TAIL");
    expect(headAnnotation?.targetId).toBe("node-1");
    expect(tailAnnotation?.targetId).toBe("node-3");
  });

  it("should create bidirectional connections for doubly linked list", () => {
    const state = createLinkedListState([10, 20], "doubly");
    const step: ExecutionStep<LinkedListState> = {
      id: 0,
      operation: "custom",
      state,
      explanation: "Doubly list",
      variables: {},
      highlightedElements: [],
    };

    const vizState = adapter.adapt(step);

    // Should have next and prev connections
    const nextConns = vizState.connections.filter((c) => c.label === "next");
    const prevConns = vizState.connections.filter((c) => c.label === "prev");
    expect(nextConns).toHaveLength(1);
    expect(prevConns).toHaveLength(1);
    expect(prevConns[0]).toMatchObject({
      sourceId: "node-2",
      targetId: "node-1",
      label: "prev",
      directed: true,
    });
  });

  it("should create circular loopback connection for circular linked list", () => {
    const state = createLinkedListState([10, 20, 30], "circular");
    const step: ExecutionStep<LinkedListState> = {
      id: 0,
      operation: "custom",
      state,
      explanation: "Circular list",
      variables: {},
      highlightedElements: [],
    };

    const vizState = adapter.adapt(step);

    // Should have 3 connections: node-1 -> node-2, node-2 -> node-3, and node-3 -> node-1
    expect(vizState.connections).toHaveLength(3);
    const loopback = vizState.connections.find((c) => c.sourceId === "node-3" && c.targetId === "node-1");
    expect(loopback).toBeDefined();
    expect(loopback?.metadata?.isCircularReturn).toBe(true);
  });

  it("should annotate active pointer variables and highlights", () => {
    const state = createLinkedListState([10, 20, 30], "singly");
    const step: ExecutionStep<LinkedListState> = {
      id: 2,
      operation: "visit",
      state,
      explanation: "Examining node-2",
      variables: {
        current: "node-2",
      },
      highlightedElements: ["node-2"],
      metadata: {
        pointers: [{ index: 1, label: "curr" }],
      },
    };

    const vizState = adapter.adapt(step);

    // curr annotation on node-2
    const currAnnotation = vizState.annotations.find((a) => a.text === "curr");
    expect(currAnnotation?.targetId).toBe("node-2");

    // node-2 should be highlighted as visited (derived from operation: 'visit')
    const highlight = vizState.highlights.find((h) => h.elementId === "node-2");
    expect(highlight).toBeDefined();
    expect(highlight?.type).toBe("visited");
  });
});
