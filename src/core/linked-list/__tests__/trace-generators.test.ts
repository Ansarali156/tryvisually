import { describe, it, expect, beforeEach } from "vitest";
import { createLinkedListState, resetNodeIdCounter } from "../validation";
import {
  generateTraverseTrace,
  generateSearchTrace,
  generateAccessTrace,
  generateInsertBeginningTrace,
  generateInsertEndTrace,
  generateInsertPositionTrace,
  generateDeleteBeginningTrace,
  generateDeleteEndTrace,
  generateDeletePositionTrace,
  generateUpdateTrace,
  generateReverseTrace,
  generateLinkedListTrace,
} from "../trace-generators";
import type { LinkedListState } from "../types";

describe("LinkedList Trace Generators", () => {
  beforeEach(() => {
    resetNodeIdCounter(1);
  });

  describe("Traverse", () => {
    it("should generate traversal trace for Singly Linked List", () => {
      const state = createLinkedListState([10, 20, 30], "singly");
      const trace = generateTraverseTrace(state);

      expect(trace.steps.length).toBeGreaterThan(3);
      expect(trace.steps[0].explanation).toContain("Starting singly linked list traversal from HEAD");
      expect(trace.steps[trace.steps.length - 1].explanation).toContain(
        "Current pointer reached null. Traversal complete across all nodes."
      );

      // Verify each node was visited
      const stepWithNode2 = trace.steps.find((s) => s.variables.value === 20);
      expect(stepWithNode2).toBeDefined();
      expect(stepWithNode2?.variables.current).toBe("node-2");
    });

    it("should deterministically terminate for Circular Linked List traversal", () => {
      const state = createLinkedListState([10, 20, 30], "circular");
      const trace = generateTraverseTrace(state);

      // Must terminate!
      expect(trace.steps.length).toBeGreaterThan(0);
      expect(trace.steps.length).toBeLessThan(20);

      // Verify loop termination step
      const loopStep = trace.steps.find((s) =>
        s.explanation.includes("points back to HEAD instead of null")
      );
      expect(loopStep).toBeDefined();
      expect(loopStep?.variables.returnedToHead).toBe(true);
    });

    it("should handle single node circular traversal and terminate", () => {
      const state = createLinkedListState([99], "circular");
      const trace = generateTraverseTrace(state);

      expect(trace.steps.length).toBeGreaterThan(0);
      expect(trace.steps.length).toBeLessThan(10);
      const loopStep = trace.steps.find((s) =>
        s.explanation.includes("points back to HEAD instead of null")
      );
      expect(loopStep).toBeDefined();
    });

    it("should handle empty list traversal", () => {
      const state = createLinkedListState([], "singly");
      const trace = generateTraverseTrace(state);

      expect(trace.steps.length).toBe(2);
      expect(trace.steps[1].explanation).toContain("List is empty");
    });
  });

  describe("Search", () => {
    it("should find an existing value and report found", () => {
      const state = createLinkedListState([10, 20, 30, 40], "singly");
      const trace = generateSearchTrace(state, 30);

      const foundStep = trace.steps.find((s) => s.variables.found === true);
      expect(foundStep).toBeDefined();
      expect(foundStep?.variables.current).toBe("node-3");
      expect(foundStep?.explanation).toContain("Found target value 30 at position 2");
    });

    it("should not find a missing value and report not found", () => {
      const state = createLinkedListState([10, 20, 30], "singly");
      const trace = generateSearchTrace(state, 999);

      const notFoundStep = trace.steps.find((s) => s.variables.found === false);
      expect(notFoundStep).toBeDefined();
      expect(notFoundStep?.explanation).toContain("Target value 999 is NOT present");
    });

    it("should terminate deterministically in Circular list when value is NOT found", () => {
      const state = createLinkedListState([10, 20, 30], "circular");
      const trace = generateSearchTrace(state, 999);

      expect(trace.steps.length).toBeLessThan(25);
      const notFoundStep = trace.steps.find((s) => s.variables.found === false);
      expect(notFoundStep).toBeDefined();
      expect(notFoundStep?.explanation).toContain(
        "Completed full cycle back to HEAD without finding target value 999"
      );
    });
  });

  describe("Access", () => {
    it("should access node at valid index", () => {
      const state = createLinkedListState([10, 20, 30], "singly");
      const trace = generateAccessTrace(state, 1);

      const accessStep = trace.steps.find((s) =>
        s.explanation.includes("Access complete: Returned value 20 at position 1")
      );
      expect(accessStep).toBeDefined();
      expect(accessStep?.variables.returnedValue).toBe(20);
    });

    it("should report out of bounds for invalid index", () => {
      const state = createLinkedListState([10, 20, 30], "singly");
      const trace = generateAccessTrace(state, 5);

      const lastStep = trace.steps[trace.steps.length - 1];
      expect(lastStep.explanation).toContain("Position 5 is out of bounds");
    });
  });

  describe("Insert Operations", () => {
    it("should insert at beginning for Singly list", () => {
      const state = createLinkedListState([20, 30], "singly");
      const trace = generateInsertBeginningTrace(state, 10);

      const finalState = trace.steps[trace.steps.length - 1].state as LinkedListState;
      expect(finalState.nodes).toHaveLength(3);
      expect(finalState.headId).toBe("node-3"); // new ID
      expect(finalState.nodes[0].value).toBe(10);
      expect(finalState.next["node-3"]).toBe("node-1");
      expect(finalState.tailId).toBe("node-2");
    });

    it("should insert at beginning for Doubly list with correct prev pointer", () => {
      const state = createLinkedListState([20, 30], "doubly");
      const trace = generateInsertBeginningTrace(state, 10);

      const finalState = trace.steps[trace.steps.length - 1].state as LinkedListState;
      const newHeadId = finalState.headId!;
      expect(finalState.nodes[0].value).toBe(10);
      expect(finalState.next[newHeadId]).toBe("node-1");
      expect(finalState.previous![newHeadId]).toBeNull();
      expect(finalState.previous!["node-1"]).toBe(newHeadId);
    });

    it("should insert at beginning for Circular list updating tail.next", () => {
      const state = createLinkedListState([20, 30], "circular");
      const trace = generateInsertBeginningTrace(state, 10);

      const finalState = trace.steps[trace.steps.length - 1].state as LinkedListState;
      const newHeadId = finalState.headId!;
      expect(finalState.nodes[0].value).toBe(10);
      expect(finalState.next[finalState.tailId!]).toBe(newHeadId);
    });

    it("should insert at end for Singly list", () => {
      const state = createLinkedListState([10, 20], "singly");
      const trace = generateInsertEndTrace(state, 30);

      const finalState = trace.steps[trace.steps.length - 1].state as LinkedListState;
      expect(finalState.nodes).toHaveLength(3);
      expect(finalState.headId).toBe("node-1");
      expect(finalState.next["node-2"]).toBe("node-3");
      expect(finalState.tailId).toBe("node-3");
      expect(finalState.nodes[2].value).toBe(30);
    });

    it("should insert at end for Circular list updating new tail.next to head", () => {
      const state = createLinkedListState([10, 20], "circular");
      const trace = generateInsertEndTrace(state, 30);

      const finalState = trace.steps[trace.steps.length - 1].state as LinkedListState;
      const newTailId = finalState.tailId!;
      expect(finalState.next[newTailId]).toBe(finalState.headId);
    });

    it("should insert at specific position", () => {
      const state = createLinkedListState([10, 30], "singly");
      const trace = generateInsertPositionTrace(state, 1, 20);

      const finalState = trace.steps[trace.steps.length - 1].state as LinkedListState;
      expect(finalState.nodes).toHaveLength(3);
      expect(finalState.nodes[1].value).toBe(20);
      expect(finalState.next["node-1"]).toBe("node-3"); // newly inserted node
      expect(finalState.next["node-3"]).toBe("node-2");
    });
  });

  describe("Delete Operations", () => {
    it("should delete from beginning", () => {
      const state = createLinkedListState([10, 20, 30], "singly");
      const trace = generateDeleteBeginningTrace(state);

      const finalState = trace.steps[trace.steps.length - 1].state as LinkedListState;
      expect(finalState.nodes).toHaveLength(2);
      expect(finalState.headId).toBe("node-2");
      expect(finalState.nodes.find((n) => n.id === "node-1")).toBeUndefined();
    });

    it("should delete from beginning in Circular list and update tail.next", () => {
      const state = createLinkedListState([10, 20, 30], "circular");
      const trace = generateDeleteBeginningTrace(state);

      const finalState = trace.steps[trace.steps.length - 1].state as LinkedListState;
      expect(finalState.headId).toBe("node-2");
      expect(finalState.next[finalState.tailId!]).toBe("node-2");
    });

    it("should delete from end", () => {
      const state = createLinkedListState([10, 20, 30], "singly");
      const trace = generateDeleteEndTrace(state);

      const finalState = trace.steps[trace.steps.length - 1].state as LinkedListState;
      expect(finalState.nodes).toHaveLength(2);
      expect(finalState.tailId).toBe("node-2");
      expect(finalState.next["node-2"]).toBeNull();
      expect(finalState.nodes.find((n) => n.id === "node-3")).toBeUndefined();
    });

    it("should delete at middle position", () => {
      const state = createLinkedListState([10, 20, 30], "singly");
      const trace = generateDeletePositionTrace(state, 1);

      const finalState = trace.steps[trace.steps.length - 1].state as LinkedListState;
      expect(finalState.nodes).toHaveLength(2);
      expect(finalState.next["node-1"]).toBe("node-3");
      expect(finalState.nodes.find((n) => n.id === "node-2")).toBeUndefined();
    });
  });

  describe("Update Value", () => {
    it("should update value of node at index while preserving node identity and pointers", () => {
      const state = createLinkedListState([10, 20, 30], "singly");
      const trace = generateUpdateTrace(state, 1, 99);

      const finalState = trace.steps[trace.steps.length - 1].state as LinkedListState;
      const node2 = finalState.nodes.find((n) => n.id === "node-2");
      expect(node2?.value).toBe(99);
      expect(finalState.next["node-2"]).toBe("node-3");
      expect(finalState.next["node-1"]).toBe("node-2");
    });
  });

  describe("Reverse Operation", () => {
    it("should reverse a Singly Linked List while preserving stable node IDs", () => {
      const state = createLinkedListState([10, 20, 30], "singly");
      const trace = generateReverseTrace(state);

      const finalState = trace.steps[trace.steps.length - 1].state as LinkedListState;
      expect(finalState.headId).toBe("node-3");
      expect(finalState.tailId).toBe("node-1");

      // Node identities preserved!
      expect(finalState.next["node-3"]).toBe("node-2");
      expect(finalState.next["node-2"]).toBe("node-1");
      expect(finalState.next["node-1"]).toBeNull();

      expect(finalState.nodes[0].value).toBe(30);
      expect(finalState.nodes[1].value).toBe(20);
      expect(finalState.nodes[2].value).toBe(10);
    });

    it("should reverse a Doubly Linked List swapping both next and prev pointers", () => {
      const state = createLinkedListState([10, 20, 30], "doubly");
      const trace = generateReverseTrace(state);

      const finalState = trace.steps[trace.steps.length - 1].state as LinkedListState;
      expect(finalState.headId).toBe("node-3");
      expect(finalState.tailId).toBe("node-1");

      expect(finalState.next["node-3"]).toBe("node-2");
      expect(finalState.previous!["node-3"]).toBeNull();

      expect(finalState.next["node-2"]).toBe("node-1");
      expect(finalState.previous!["node-2"]).toBe("node-3");

      expect(finalState.next["node-1"]).toBeNull();
      expect(finalState.previous!["node-1"]).toBe("node-2");
    });
  });

  describe("generateLinkedListTrace Dispatcher", () => {
    it("should correctly dispatch all operations", () => {
      const state = createLinkedListState([10, 20, 30], "singly");
      const trace = generateLinkedListTrace(state, "search", { value: 20 });
      expect(trace.steps.length).toBeGreaterThan(0);
      const foundStep = trace.steps.find((s) => s.variables.found === true);
      expect(foundStep).toBeDefined();
    });
  });
});
