/**
 * Code Mapping Utilities
 *
 * Separates conceptual execution events from concrete source lines,
 * allowing the same algorithmic step to map to different line numbers
 * across Python, Java, C++, JavaScript, and TypeScript.
 */

import type { ExecutionStep } from "@/core/execution/types";
import type { LanguageCodeMapping, SupportedLanguage } from "../types";

export class LanguageCodeMappingRegistry {
  private readonly mappings = new Map<string, readonly number[]>();

  private makeKey(language: SupportedLanguage, stepId: number): string {
    return `${language}:${stepId}`;
  }

  /**
   * Registers a mapping between an execution step ID and source lines in a language.
   */
  register(mapping: LanguageCodeMapping): void {
    const key = this.makeKey(mapping.language, mapping.stepId);
    this.mappings.set(key, Object.freeze([...mapping.codeLines]));
  }

  /**
   * Bulk registers an array of language code mappings.
   */
  registerAll(mappings: readonly LanguageCodeMapping[]): void {
    for (const m of mappings) {
      this.register(m);
    }
  }

  /**
   * Looks up the active lines for a given language and step ID.
   */
  getLines(language: SupportedLanguage, stepId: number): readonly number[] | undefined {
    return this.mappings.get(this.makeKey(language, stepId));
  }
}

/**
 * Resolves the active source code lines for a given execution step and language.
 *
 * Priority:
 * 1. Explicit LanguageCodeMappingRegistry match
 * 2. Language-specific override in step metadata: step.metadata[language].codeLines
 * 3. Step metadata generic codeLines: step.metadata.codeLines
 * 4. Step canonical codeLine: [step.codeLine]
 * 5. Fallback: empty array
 */
export function resolveActiveLines<TState>(
  step: ExecutionStep<TState> | null | undefined,
  language: SupportedLanguage,
  registry?: LanguageCodeMappingRegistry
): readonly number[] {
  if (!step) return [];

  // 1. Registry lookup
  if (registry) {
    const fromRegistry = registry.getLines(language, step.id);
    if (fromRegistry && fromRegistry.length > 0) {
      return fromRegistry;
    }
  }

  // 2. Language-specific metadata override
  const langMeta = step.metadata?.[language] as { codeLines?: number[] } | undefined;
  if (langMeta && Array.isArray(langMeta.codeLines) && langMeta.codeLines.length > 0) {
    return langMeta.codeLines;
  }

  // 3. Generic codeLines array in metadata
  const metaCodeLines = step.metadata?.codeLines;
  if (Array.isArray(metaCodeLines) && metaCodeLines.length > 0) {
    return metaCodeLines as number[];
  }

  // 4. Canonical single codeLine
  if (typeof step.codeLine === "number" && step.codeLine > 0) {
    return [step.codeLine];
  }

  return [];
}
