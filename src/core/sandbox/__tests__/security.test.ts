import { describe, it, expect } from "vitest";
import { validateExecutionSecurity } from "../security";

describe("Execution Security Policy Validator", () => {
  it("permits standard algorithms and arithmetic in Python", () => {
    const safePython = `
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(6))
`;
    const result = validateExecutionSecurity(safePython, "python");
    expect(result.safe).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("blocks dangerous imports like os, subprocess, sys, and socket", () => {
    const maliciousCodes = [
      "import os\nos.system('dir')",
      "import subprocess\nsubprocess.Popen(['calc'])",
      "import socket\ns = socket.socket()",
      "from os import system\nsystem('echo 1')",
      "from shutil import rmtree",
    ];

    for (const code of maliciousCodes) {
      const res = validateExecutionSecurity(code, "python");
      expect(res.safe).toBe(false);
      expect(res.reason).toMatch(/system, network, or process control modules is restricted/i);
    }
  });

  it("blocks dynamic imports and introspection escapes", () => {
    const dynamicImport = "x = __import__('os').system('dir')";
    expect(validateExecutionSecurity(dynamicImport, "python").safe).toBe(false);

    const introspection = "().__class__.__bases__[0].__subclasses__()";
    expect(validateExecutionSecurity(introspection, "python").safe).toBe(false);
  });

  it("blocks file open calls", () => {
    const fileAccess = "f = open('secrets.txt', 'r')";
    const res = validateExecutionSecurity(fileAccess, "python");
    expect(res.safe).toBe(false);
    expect(res.reason).toMatch(/file system access/i);
  });

  it("blocks oversized payloads exceeding 64KB", () => {
    const hugeCode = "x = 1\n".repeat(20000); // > 100KB
    const res = validateExecutionSecurity(hugeCode, "python");
    expect(res.safe).toBe(false);
    expect(res.reason).toMatch(/exceeds maximum permitted limit/i);
  });
});
