import { describe, it, expect } from "vitest";
import { executeCodeSafely, validateCodeSecurity } from "../safe-runner";

describe("Safe Sandbox Execution Runner", () => {
  it("blocks dangerous tokens like process and require", () => {
    const check1 = validateCodeSecurity("const fs = require('fs');");
    expect(check1.safe).toBe(false);

    const check2 = validateCodeSecurity("process.exit(1);");
    expect(check2.safe).toBe(false);

    const check3 = validateCodeSecurity("fetch('https://evil.com');");
    expect(check3.safe).toBe(false);
  });

  it("safely executes standard algorithmic code and produces trace steps", () => {
    const code = `
      let sum = 0;
      for (let i = 1; i <= 3; i++) {
        sum += i;
      }
    `;
    const result = executeCodeSafely(code);
    expect(result.success).toBe(true);
    expect(result.steps.length).toBeGreaterThan(3);
  });

  it("catches infinite loops with execution step limit", () => {
    const infiniteCode = `
      let x = 0;
      while (true) {
        x++;
      }
    `;
    const result = executeCodeSafely(infiniteCode, { maxSteps: 50, timeoutMs: 200 });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/exceeded maximum step limit|timed out/);
  });
});
