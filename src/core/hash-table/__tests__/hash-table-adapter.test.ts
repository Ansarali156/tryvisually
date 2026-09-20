import { describe, it, expect } from "vitest";
import { createHashTableState } from "../validation";
import { defaultHashTableAdapter } from "../hash-table-adapter";

describe("HashTableAdapter", () => {
  it("builds chaining visualization elements with bucket headers and chained items", () => {
    const state = createHashTableState(
      [
        { key: "Carol", value: "95" },
        { key: "Dave", value: "88" },
      ],
      "chaining",
      7
    );

    const elements = defaultHashTableAdapter.buildElements(state);
    expect(elements.length).toBe(7 + 2); // 7 bucket headers + 2 chained entries

    const bucket0 = elements.find((e) => e.id === "bucket-0");
    expect(bucket0).toBeDefined();
    expect(bucket0?.type).toBe("bucket");
    expect(bucket0?.metadata?.entriesCount).toBe(2);

    const carolEntry = elements.find((e) => e.id === "entry-Carol");
    expect(carolEntry).toBeDefined();
    expect(carolEntry?.type).toBe("item");
    expect(carolEntry?.label).toBe("Carol: 95");

    // Connections
    const connections = defaultHashTableAdapter.buildConnections(state);
    expect(connections.length).toBe(2); // 1 bucket->Carol, 1 Carol->Dave
  });

  it("builds open addressing visualization elements with slot cards and status badges", () => {
    const state = createHashTableState([{ key: "Carol", value: "95" }], "linear-probing", 7);
    const elements = defaultHashTableAdapter.buildElements(state);

    const slot0 = elements.find((e) => e.id === "slot-0" && e.type === "bucket");
    expect(slot0).toBeDefined();
    expect(slot0?.state).toBe("occupied");

    const slot1 = elements.find((e) => e.id === "slot-1" && e.type === "bucket");
    expect(slot1).toBeDefined();
    expect(slot1?.state).toBe("empty");
  });
});
