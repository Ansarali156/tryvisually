import { describe, it, expect } from "vitest";
import { getHashTableSourceCodes } from "../code-snippets";
import type { SupportedLanguage } from "@/core/synchronization/types";

describe("Hash Table Code Synchronization", () => {
  const languages: SupportedLanguage[] = ["python", "javascript", "typescript", "java", "cpp"];

  it("provides structured 1-indexed source code snippets across all 5 languages for Separate Chaining", () => {
    const snippets = getHashTableSourceCodes("insert", "chaining");

    for (const lang of languages) {
      const code = snippets[lang];
      expect(code).toBeDefined();
      expect(code.language).toBe(lang);
      expect(code.lines.length).toBeGreaterThan(0);
      expect(code.lines[0].lineNumber).toBe(1);
    }
  });

  it("provides structured 1-indexed source code snippets across all 5 languages for Open Addressing", () => {
    const snippets = getHashTableSourceCodes("insert", "linear-probing");

    for (const lang of languages) {
      const code = snippets[lang];
      expect(code).toBeDefined();
      expect(code.language).toBe(lang);
      expect(code.lines.length).toBeGreaterThan(0);
      expect(code.lines[0].lineNumber).toBe(1);
    }
  });
});
