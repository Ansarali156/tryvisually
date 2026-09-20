/**
 * Multi-Language Sample Code for Synchronization Demonstration
 *
 * Demonstrates language switching and language-specific line mapping for the demo trace.
 */

import { parseSourceCode } from "../utils/source-code";
import { LanguageCodeMappingRegistry } from "../utils/code-mapping";
import type { SourceCode, SupportedLanguage } from "../types";

export const SAMPLE_PYTHON_CODE = `def accumulate_items(items):
    total = 0
    for item in items:
        total += item.value
        print(f"Accumulated: {total}")
    
    return total`;

export const SAMPLE_TYPESCRIPT_CODE = `function accumulateItems(items: Item[]): number {
  let total = 0;
  for (const item of items) {
    total += item.value;
  }
  return total;
}`;

export const SAMPLE_JAVA_CODE = `public class Accumulator {
    public static int accumulate(Item[] items) {
        int total = 0;
        for (Item item : items) {
            total += item.getValue();
        }
        return total;
    }
}`;

export const SAMPLE_CPP_CODE = `#include <vector>

int accumulateItems(const std::vector<Item>& items) {
    int total = 0;
    for (const auto& item : items) {
        total += item.value;
    }
    return total;
}`;

export const DEMO_SOURCE_CODES: Record<SupportedLanguage, SourceCode> = {
  python: parseSourceCode(SAMPLE_PYTHON_CODE, "python"),
  typescript: parseSourceCode(SAMPLE_TYPESCRIPT_CODE, "typescript"),
  javascript: parseSourceCode(SAMPLE_TYPESCRIPT_CODE, "javascript"),
  java: parseSourceCode(SAMPLE_JAVA_CODE, "java"),
  cpp: parseSourceCode(SAMPLE_CPP_CODE, "cpp"),
};

/**
 * Registry configuring language-specific line mappings for the 4-step demonstration trace.
 */
export function createDemoCodeMappingRegistry(): LanguageCodeMappingRegistry {
  const registry = new LanguageCodeMappingRegistry();

  // Python mappings
  registry.register({ language: "python", stepId: 0, codeLines: [1, 2] });
  registry.register({ language: "python", stepId: 1, codeLines: [4] });
  registry.register({ language: "python", stepId: 2, codeLines: [4] });
  registry.register({ language: "python", stepId: 3, codeLines: [7] });

  // TypeScript / JavaScript mappings
  registry.register({ language: "typescript", stepId: 0, codeLines: [1, 2] });
  registry.register({ language: "typescript", stepId: 1, codeLines: [4] });
  registry.register({ language: "typescript", stepId: 2, codeLines: [4] });
  registry.register({ language: "typescript", stepId: 3, codeLines: [6] });

  registry.register({ language: "javascript", stepId: 0, codeLines: [1, 2] });
  registry.register({ language: "javascript", stepId: 1, codeLines: [4] });
  registry.register({ language: "javascript", stepId: 2, codeLines: [4] });
  registry.register({ language: "javascript", stepId: 3, codeLines: [6] });

  // Java mappings (class wrapper shifts lines down)
  registry.register({ language: "java", stepId: 0, codeLines: [2, 3] });
  registry.register({ language: "java", stepId: 1, codeLines: [5] });
  registry.register({ language: "java", stepId: 2, codeLines: [5] });
  registry.register({ language: "java", stepId: 3, codeLines: [7] });

  // C++ mappings (includes shift lines down)
  registry.register({ language: "cpp", stepId: 0, codeLines: [3, 4] });
  registry.register({ language: "cpp", stepId: 1, codeLines: [6] });
  registry.register({ language: "cpp", stepId: 2, codeLines: [6] });
  registry.register({ language: "cpp", stepId: 3, codeLines: [8] });

  return registry;
}
