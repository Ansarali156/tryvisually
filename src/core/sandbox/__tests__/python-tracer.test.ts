import { describe, it, expect } from "vitest";
import { tracePythonCode } from "../python-tracer";

describe("Python Tracer Engine", () => {
  it("traces simple variable assignments and prints", () => {
    const code = `
x = 10
y = 20
total = x + y
print("Total is:", total)
`;
    const result = tracePythonCode(code);
    expect(result.success).toBe(true);
    expect(result.output).toContain("Total is: 30");
    expect(result.steps.length).toBeGreaterThanOrEqual(4);
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.variables.total).toBe(30);
  });

  it("traces list iteration and accumulation", () => {
    const code = `
arr = [1, 2, 3]
sum = 0
for x in arr:
    sum += x
    print("x:", x, "sum:", sum)
`;
    const result = tracePythonCode(code);
    expect(result.success).toBe(true);
    expect(result.output.length).toBe(3);
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.variables.sum).toBe(6);
  });
});
