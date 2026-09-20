import { describe, it, expect } from "vitest";
import {
  validateKey,
  validateValue,
  clampCapacity,
  createHashTableState,
  generateHashEntryId,
} from "../validation";

describe("Hash Table Validation & State Factory", () => {
  describe("validateKey", () => {
    it("accepts valid alphanumeric keys", () => {
      const res = validateKey("Alice");
      expect(res.isValid).toBe(true);
      expect(res.data).toBe("Alice");
    });

    it("rejects empty keys or whitespace", () => {
      expect(validateKey("").isValid).toBe(false);
      expect(validateKey("   ").isValid).toBe(false);
    });

    it("rejects keys longer than MAX_KEY_LENGTH", () => {
      const longKey = "a".repeat(25);
      const res = validateKey(longKey);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("16 or fewer characters");
    });
  });

  describe("validateValue", () => {
    it("accepts valid string and numeric payloads", () => {
      expect(validateValue("25").isValid).toBe(true);
      expect(validateValue("Engineer").isValid).toBe(true);
    });

    it("rejects empty values", () => {
      expect(validateValue("").isValid).toBe(false);
    });
  });

  describe("clampCapacity", () => {
    it("clamps capacity within safe bounds [5, 15]", () => {
      expect(clampCapacity(3)).toBe(7); // falls back to default
      expect(clampCapacity(10)).toBe(10);
      expect(clampCapacity(20)).toBe(15);
    });
  });

  describe("createHashTableState", () => {
    it("creates separate chaining state with populated buckets and stable entry IDs", () => {
      const state = createHashTableState(
        [
          { key: "Carol", value: "95" },
          { key: "Dave", value: "88" },
        ],
        "chaining",
        7
      );

      expect(state.collisionStrategy).toBe("chaining");
      expect(state.capacity).toBe(7);
      expect(state.size).toBe(2);
      expect(state.buckets).toBeDefined();
      expect(state.buckets![0].entries).toHaveLength(2); // Carol and Dave collide at 0
      expect(state.buckets![0].entries[0].id).toBe(generateHashEntryId("Carol"));
      expect(state.buckets![0].entries[1].id).toBe(generateHashEntryId("Dave"));
    });

    it("creates open addressing state with empty and occupied slots", () => {
      const state = createHashTableState(
        [
          { key: "Carol", value: "95" },
          { key: "Dave", value: "88" },
        ],
        "linear-probing",
        7
      );

      expect(state.collisionStrategy).toBe("linear-probing");
      expect(state.capacity).toBe(7);
      expect(state.size).toBe(2);
      expect(state.slots).toBeDefined();
      // Carol at index 0, Dave linearly probed to index 1
      expect(state.slots![0].status).toBe("occupied");
      expect(state.slots![0].entry?.key).toBe("Carol");
      expect(state.slots![1].status).toBe("occupied");
      expect(state.slots![1].entry?.key).toBe("Dave");
      expect(state.slots![2].status).toBe("empty");
    });
  });
});
