import { describe, it, expect } from "vitest";

// Test indentation calculation logic
function calculateIndentOnEnter(line: string): string {
  const indentMatch = line.match(/^\s*/);
  let indent = indentMatch ? indentMatch[0] : "";
  const trimmed = line.trim();
  if (
    trimmed.endsWith(":") ||
    trimmed.endsWith("{") ||
    trimmed.endsWith("(") ||
    trimmed.endsWith("[")
  ) {
    indent += "    ";
  }
  return indent;
}

describe("Code Editor Auto-Indentation Logic", () => {
  it("preserves leading whitespace on Enter", () => {
    const line = "    x = 10";
    expect(calculateIndentOnEnter(line)).toBe("    ");
  });

  it("adds 4 spaces of indentation when line ends with a colon in Python", () => {
    const line = "def binary_search(arr, target):";
    expect(calculateIndentOnEnter(line)).toBe("    ");

    const nestedLine = "    while low <= high:";
    expect(calculateIndentOnEnter(nestedLine)).toBe("        ");
  });

  it("adds 4 spaces when line ends with an opening brace in C++/Java/JS", () => {
    const line = "int main() {";
    expect(calculateIndentOnEnter(line)).toBe("    ");

    const forLoop = "    for (int i = 0; i < n; i++) {";
    expect(calculateIndentOnEnter(forLoop)).toBe("        ");
  });

  it("calculates playback interval correctly for all speed multipliers", () => {
    const getInterval = (speed: number) => Math.max(Math.round(1000 / speed), 100);
    expect(getInterval(0.25)).toBe(4000);
    expect(getInterval(0.5)).toBe(2000);
    expect(getInterval(1)).toBe(1000);
    expect(getInterval(1.5)).toBe(667);
    expect(getInterval(2)).toBe(500);
    expect(getInterval(3)).toBe(333);
  });
});
