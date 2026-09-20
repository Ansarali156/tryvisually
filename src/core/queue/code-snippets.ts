/**
 * Synchronized Source Code Snippets for Queue Operations
 *
 * Provides structured SourceCode models with 1-indexed lines for Python and TypeScript,
 * explicitly showing modulo wrap-around logic for Circular Queue.
 */

import type { SourceCode, SupportedLanguage } from "@/core/synchronization/types";
import { parseSourceCode } from "@/core/synchronization/utils/source-code";
import type { QueueOperationType, QueueVariant } from "./types";

interface OperationCodeDefinition {
  python: string;
  typescript: string;
}

const RAW_CODE_SNIPPETS: Record<QueueOperationType, OperationCodeDefinition> = {
  enqueue: {
    python: `def enqueue(queue, value):
    if size == capacity:
        raise OverflowError("Queue is full")
    rear = (rear + 1) % capacity
    slots[rear] = value
    size += 1
    return size`,
    typescript: `function enqueue(value: number): number {
  if (size === capacity) {
    throw new Error("Queue is full");
  }
  rear = (rear + 1) % capacity;
  slots[rear] = value;
  size++;
  return size;
}`,
  },
  dequeue: {
    python: `def dequeue(queue):
    if size == 0:
        raise IndexError("Queue underflow")
    value = slots[front]
    slots[front] = None
    front = (front + 1) % capacity
    size -= 1
    return value`,
    typescript: `function dequeue(): number {
  if (size === 0) {
    throw new Error("Queue underflow");
  }
  const value = slots[front]!;
  slots[front] = null;
  front = (front + 1) % capacity;
  size--;
  return value;
}`,
  },
  front: {
    python: `def get_front(queue):
    if size == 0:
        raise IndexError("Queue is empty")
    return slots[front]`,
    typescript: `function getFront(): number {
  if (size === 0) {
    throw new Error("Queue is empty");
  }
  return slots[front]!;
}`,
  },
  rear: {
    python: `def get_rear(queue):
    if size == 0:
        raise IndexError("Queue is empty")
    return slots[rear]`,
    typescript: `function getRear(): number {
  if (size === 0) {
    throw new Error("Queue is empty");
  }
  return slots[rear]!;
}`,
  },
  isEmpty: {
    python: `def is_empty(queue):
    return size == 0`,
    typescript: `function isEmpty(): boolean {
  return size === 0;
}`,
  },
  isFull: {
    python: `def is_full(queue):
    return size == capacity`,
    typescript: `function isFull(): boolean {
  return size === capacity;
}`,
  },
  size: {
    python: `def get_size(queue):
    return size`,
    typescript: `function getSize(): number {
  return size;
}`,
  },
  clear: {
    python: `def clear(queue):
    slots = [None] * capacity
    front = 0
    rear = -1
    size = 0`,
    typescript: `function clear(): void {
  slots.fill(null);
  front = 0;
  rear = -1;
  size = 0;
}`,
  },
};

/**
 * Returns structured SourceCode snippets for a queue operation.
 */
export function getQueueSourceCodes(
  operation: QueueOperationType,
  _variant?: QueueVariant
): Partial<Record<SupportedLanguage, SourceCode>> {
  const def = RAW_CODE_SNIPPETS[operation];
  return {
    python: parseSourceCode(def.python, "python"),
    typescript: parseSourceCode(def.typescript, "typescript"),
  };
}

export const getQueueOperationSourceCodes = getQueueSourceCodes;
