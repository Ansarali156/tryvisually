import { describe, it, expect } from "vitest";
import { createHashTableState } from "../validation";
import {
  generateHashTableTrace,
  generateInsertTrace,
  generateSearchTrace,
  generateUpdateTrace,
  generateDeleteTrace,
  generateContainsTrace,
  generateSizeTrace,
  generateClearTrace,
} from "../trace-generators";

describe("Hash Table Trace Generators", () => {
  describe("Separate Chaining Operations", () => {
    it("inserts non-colliding key and updates size", () => {
      const state = createHashTableState([], "chaining", 7);
      const trace = generateInsertTrace(state, "Alice", "25");

      expect(trace.steps.length).toBeGreaterThan(2);
      const lastStep = trace.steps[trace.steps.length - 1];
      expect(lastStep.state.size).toBe(1);
      expect(lastStep.state.buckets![4].entries).toHaveLength(1);
      expect(lastStep.state.buckets![4].entries[0].key).toBe("Alice");
    });

    it("inserts colliding keys Carol and Dave and chains them in bucket 0", () => {
      const state = createHashTableState([{ key: "Carol", value: "95" }], "chaining", 7);
      const trace = generateInsertTrace(state, "Dave", "88");

      const lastStep = trace.steps[trace.steps.length - 1];
      expect(lastStep.state.size).toBe(2);
      expect(lastStep.state.buckets![0].entries).toHaveLength(2);
      expect(lastStep.state.buckets![0].entries[0].key).toBe("Carol");
      expect(lastStep.state.buckets![0].entries[1].key).toBe("Dave");

      // Verify a collision step was explicitly generated
      const collisionStep = trace.steps.find((s) => s.variables.collision === true);
      expect(collisionStep).toBeDefined();
    });

    it("updates existing key in-place when inserted again", () => {
      const state = createHashTableState([{ key: "Alice", value: "25" }], "chaining", 7);
      const trace = generateInsertTrace(state, "Alice", "30");

      const lastStep = trace.steps[trace.steps.length - 1];
      expect(lastStep.state.size).toBe(1);
      expect(lastStep.state.buckets![4].entries[0].value).toBe("30");
      expect(lastStep.operation).toBe("update");
    });

    it("searches and finds key in bucket chain", () => {
      const state = createHashTableState(
        [
          { key: "Carol", value: "95" },
          { key: "Dave", value: "88" },
        ],
        "chaining",
        7
      );
      const trace = generateSearchTrace(state, "Dave");

      const foundStep = trace.steps.find((s) => s.operation === "found");
      expect(foundStep).toBeDefined();
      expect(foundStep?.variables.value).toBe("88");
    });

    it("searches for non-existent key and reports not found", () => {
      const state = createHashTableState([{ key: "Carol", value: "95" }], "chaining", 7);
      const trace = generateSearchTrace(state, "NonExistent");

      const lastStep = trace.steps[trace.steps.length - 1];
      expect(lastStep.variables.found).toBe(false);
    });

    it("deletes key from chain and updates size", () => {
      const state = createHashTableState(
        [
          { key: "Carol", value: "95" },
          { key: "Dave", value: "88" },
        ],
        "chaining",
        7
      );
      const trace = generateDeleteTrace(state, "Carol");

      const lastStep = trace.steps[trace.steps.length - 1];
      expect(lastStep.state.size).toBe(1);
      expect(lastStep.state.buckets![0].entries).toHaveLength(1);
      expect(lastStep.state.buckets![0].entries[0].key).toBe("Dave");
    });
  });

  describe("Linear Probing (Open Addressing)", () => {
    it("probes next slot on collision and inserts", () => {
      const state = createHashTableState([{ key: "Carol", value: "95" }], "linear-probing", 7);
      // Carol is at slot 0. Dave also hashes to 0, should probe to slot 1.
      const trace = generateInsertTrace(state, "Dave", "88");

      const lastStep = trace.steps[trace.steps.length - 1];
      expect(lastStep.state.slots![1].status).toBe("occupied");
      expect(lastStep.state.slots![1].entry?.key).toBe("Dave");
      expect(lastStep.variables.slotIndex).toBe(1);
    });

    it("deletes key and marks slot as deleted (tombstone)", () => {
      const state = createHashTableState(
        [
          { key: "Carol", value: "95" },
          { key: "Dave", value: "88" },
        ],
        "linear-probing",
        7
      );
      const trace = generateDeleteTrace(state, "Carol");

      const lastStep = trace.steps[trace.steps.length - 1];
      expect(lastStep.state.slots![0].status).toBe("deleted"); // Tombstone
      expect(lastStep.state.slots![0].entry).toBeNull();
      expect(lastStep.state.size).toBe(1);
    });

    it("searches through tombstone to locate probed key", () => {
      // Setup: slot 0 is deleted (tombstone), slot 1 has Dave
      const state = createHashTableState(
        [
          { key: "Carol", value: "95" },
          { key: "Dave", value: "88" },
        ],
        "linear-probing",
        7
      );
      const delTrace = generateDeleteTrace(state, "Carol");
      const stateWithTombstone = delTrace.steps[delTrace.steps.length - 1].state;

      // Search for Dave
      const searchTrace = generateSearchTrace(stateWithTombstone, "Dave");
      const foundStep = searchTrace.steps.find((s) => s.operation === "found");
      expect(foundStep).toBeDefined();
      expect(foundStep?.variables.value).toBe("88");

      // Verify probe skipped tombstone
      const tombstoneStep = searchTrace.steps.find((s) => s.variables.isTombstone === true);
      expect(tombstoneStep).toBeDefined();
    });

    it("reuses tombstone slot on subsequent insertion", () => {
      const state = createHashTableState(
        [
          { key: "Carol", value: "95" },
          { key: "Dave", value: "88" },
        ],
        "linear-probing",
        7
      );
      const delTrace = generateDeleteTrace(state, "Carol");
      const stateWithTombstone = delTrace.steps[delTrace.steps.length - 1].state;

      // Insert new key that hashes to 0 (e.g. key that reaches 0)
      const insertTrace = generateInsertTrace(stateWithTombstone, "Carol", "100");
      const lastStep = insertTrace.steps[insertTrace.steps.length - 1];
      expect(lastStep.state.slots![0].status).toBe("occupied");
      expect(lastStep.state.slots![0].entry?.key).toBe("Carol");
      expect(lastStep.state.slots![0].entry?.value).toBe("100");
    });
  });

  describe("Quadratic Probing", () => {
    it("probes slots quadratically: (hash + i^2) % capacity", () => {
      const state = createHashTableState([{ key: "Carol", value: "95" }], "quadratic-probing", 7);
      const trace = generateInsertTrace(state, "Dave", "88");

      const lastStep = trace.steps[trace.steps.length - 1];
      // i=0 -> slot 0 (occupied by Carol)
      // i=1 -> (0 + 1^2) % 7 = 1 (empty -> Dave inserted at 1)
      expect(lastStep.state.slots![1].status).toBe("occupied");
      expect(lastStep.state.slots![1].entry?.key).toBe("Dave");
    });
  });

  describe("Shared Operations", () => {
    it("contains returns boolean TRUE for present key and FALSE for missing key", () => {
      const state = createHashTableState([{ key: "Alice", value: "25" }], "chaining", 7);
      const traceTrue = generateContainsTrace(state, "Alice");
      const lastTrue = traceTrue.steps[traceTrue.steps.length - 1];
      expect(lastTrue.variables.contains).toBe(true);
      expect(lastTrue.variables.result).toBe("TRUE");

      const traceFalse = generateContainsTrace(state, "Unknown");
      const lastFalse = traceFalse.steps[traceFalse.steps.length - 1];
      expect(lastFalse.variables.contains).toBe(false);
      expect(lastFalse.variables.result).toBe("FALSE");
    });

    it("size operation returns table size and load factor", () => {
      const state = createHashTableState(
        [
          { key: "Carol", value: "95" },
          { key: "Dave", value: "88" },
        ],
        "chaining",
        7
      );
      const trace = generateSizeTrace(state);
      expect(trace.steps[0].variables.size).toBe(2);
      expect(trace.steps[0].variables.capacity).toBe(7);
      expect(trace.steps[0].variables.loadFactor).toBe(0.29);
    });

    it("clear operation resets all entries and tombstones", () => {
      const state = createHashTableState(
        [
          { key: "Carol", value: "95" },
          { key: "Dave", value: "88" },
        ],
        "linear-probing",
        7
      );
      const trace = generateClearTrace(state);
      const lastStep = trace.steps[trace.steps.length - 1];
      expect(lastStep.state.size).toBe(0);
      expect(lastStep.state.slots?.every((s) => s.status === "empty")).toBe(true);
    });

    it("maintains strict trace invariants: step IDs start at 0 and are strictly sequential", () => {
      const state = createHashTableState([{ key: "Alice", value: "25" }], "chaining", 7);
      const trace = generateHashTableTrace(state, "search", { key: "Alice" });

      for (let i = 0; i < trace.steps.length; i++) {
        expect(trace.steps[i].id).toBe(i);
      }
    });
  });
});
