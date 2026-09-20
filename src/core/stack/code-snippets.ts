/**
 * Synchronized Source Code Snippets for Stack Operations
 *
 * Provides structured SourceCode models with 1-indexed lines for Python and TypeScript.
 */

import type { SourceCode, SupportedLanguage } from "@/core/synchronization/types";
import { parseSourceCode } from "@/core/synchronization/utils/source-code";
import type { StackOperationType } from "./types";

interface OperationCodeDefinition {
  python: string;
  typescript: string;
}

const RAW_CODE_SNIPPETS: Record<StackOperationType, OperationCodeDefinition> = {
  push: {
    python: `def push(stack, value):
    if len(stack) >= capacity:
        raise OverflowError("Stack is full")
    stack.append(value)
    return len(stack)`,
    typescript: `function push(stack: number[], value: number): number {
  if (stack.length >= capacity) {
    throw new Error("Stack is full");
  }
  stack.push(value);
  return stack.length;
}`,
  },
  pop: {
    python: `def pop(stack):
    if len(stack) == 0:
        raise IndexError("Stack underflow")
    value = stack.pop()
    return value`,
    typescript: `function pop(stack: number[]): number {
  if (stack.length === 0) {
    throw new Error("Stack underflow");
  }
  const value = stack.pop()!;
  return value;
}`,
  },
  peek: {
    python: `def peek(stack):
    if len(stack) == 0:
        raise IndexError("Stack is empty")
    return stack[-1]`,
    typescript: `function peek(stack: number[]): number {
  if (stack.length === 0) {
    throw new Error("Stack is empty");
  }
  return stack[stack.length - 1];
}`,
  },
  isEmpty: {
    python: `def is_empty(stack):
    return len(stack) == 0`,
    typescript: `function isEmpty(stack: number[]): boolean {
  return stack.length === 0;
}`,
  },
  size: {
    python: `def size(stack):
    return len(stack)`,
    typescript: `function size(stack: number[]): number {
  return stack.length;
}`,
  },
  clear: {
    python: `def clear(stack):
    stack.clear()
    return stack`,
    typescript: `function clear(stack: number[]): void {
  stack.length = 0;
}`,
  },
};

/**
 * Returns structured SourceCode snippets for a stack operation.
 */
export function getStackSourceCodes(
  operation: StackOperationType
): Partial<Record<SupportedLanguage, SourceCode>> {
  const def = RAW_CODE_SNIPPETS[operation];
  return {
    python: parseSourceCode(def.python, "python"),
    typescript: parseSourceCode(def.typescript, "typescript"),
  };
}

export const getStackOperationSourceCodes = getStackSourceCodes;
