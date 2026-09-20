/**
 * Source Code Model Utilities
 *
 * Converts raw source code strings into structured, 1-indexed line representations
 * for deterministic line-highlighting and accessibility.
 */

import type { SourceCode, SourceCodeLine, SupportedLanguage } from "../types";
import { deepFreeze } from "@/core/execution/utils/clone";

/**
 * Parses raw code text into an immutable SourceCode object with 1-indexed lines.
 */
export function parseSourceCode(
  rawCode: string,
  language: SupportedLanguage,
  metadata?: Readonly<Record<string, unknown>>
): SourceCode {
  // Normalize newline characters across OS platforms
  const rawLines = rawCode.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  const lines: SourceCodeLine[] = rawLines.map((content, idx) => ({
    lineNumber: idx + 1,
    content,
  }));

  const sourceCode: SourceCode = {
    language,
    code: rawCode,
    lines,
    metadata,
  };

  return deepFreeze(sourceCode);
}

/**
 * Safely retrieves a line by 1-indexed line number. Returns undefined if out of bounds.
 */
export function getSourceLine(
  sourceCode: SourceCode | undefined,
  lineNumber: number
): SourceCodeLine | undefined {
  if (!sourceCode || lineNumber < 1 || lineNumber > sourceCode.lines.length) {
    return undefined;
  }
  return sourceCode.lines[lineNumber - 1];
}
