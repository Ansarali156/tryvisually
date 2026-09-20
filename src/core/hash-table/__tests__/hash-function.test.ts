import { describe, it, expect } from "vitest";
import { computeHash } from "../hash-function";

describe("Hash Function", () => {
  it("computes deterministic hash output for given key and capacity", () => {
    const res1 = computeHash("Alice", 7);
    const res2 = computeHash("Alice", 7);
    expect(res1.hash).toBe(res2.hash);
    expect(res1.hash).toBeGreaterThanOrEqual(0);
    expect(res1.hash).toBeLessThan(7);
  });

  it("consistently produces collision for colliding keys Carol and Dave on capacity 7", () => {
    const carol = computeHash("Carol", 7);
    const dave = computeHash("Dave", 7);
    expect(carol.hash).toBe(dave.hash); // Both hash to 0
    expect(carol.hash).toBe(0);
  });

  it("handles single-character and long keys within bounds", () => {
    const single = computeHash("A", 10);
    expect(single.hash).toBe(65 % 10);

    const long = computeHash("Supercalifragilisticexpialidocious", 13);
    expect(long.hash).toBeGreaterThanOrEqual(0);
    expect(long.hash).toBeLessThan(13);
  });

  it("returns step-by-step mathematical breakdown for educational explanations", () => {
    const res = computeHash("CAT", 7);
    expect(res.details).toHaveLength(3);
    expect(res.details[0].char).toBe("C");
    expect(res.details[0].ascii).toBe(67);
    expect(res.explanation).toContain("hash(\"CAT\")");
  });

  it("handles empty key gracefully without crashing", () => {
    const res = computeHash("", 7);
    expect(res.hash).toBe(0);
  });
});
