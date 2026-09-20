/**
 * Synchronized Source Code Snippets for Linked List Operations
 *
 * Provides structured SourceCode models with 1-indexed lines for Python and TypeScript.
 */

import type { SourceCode, SupportedLanguage } from "@/core/synchronization/types";
import { parseSourceCode } from "@/core/synchronization/utils/source-code";
import type { LinkedListOperationType } from "./types";

interface OperationCodeDefinition {
  python: string;
  typescript: string;
}

const RAW_CODE_SNIPPETS: Record<LinkedListOperationType, OperationCodeDefinition> = {
  traverse: {
    python: `def traverse(head):
    current = head
    while current is not None:
        visit(current.val)
        current = current.next`,
    typescript: `function traverse(head: ListNode | null): void {
  let current = head;
  while (current !== null) {
    visit(current.val);
    current = current.next;
  }
}`,
  },
  search: {
    python: `def search(head, target):
    current = head
    pos = 0
    while current is not None:
        if current.val == target:
            return pos  # Target found
        current = current.next
        pos += 1
    return -1  # Target not found`,
    typescript: `function search(head: ListNode | null, target: number): number {
  let current = head;
  let pos = 0;
  while (current !== null) {
    if (current.val === target) {
      return pos; // Target found
    }
    current = current.next;
    pos++;
  }
  return -1; // Target not found
}`,
  },
  access: {
    python: `def access_by_position(head, position):
    current = head
    for i in range(position):
        current = current.next
    return current.val`,
    typescript: `function accessByPosition(head: ListNode | null, position: number): number {
  let current = head;
  for (let i = 0; i < position; i++) {
    current = current?.next ?? null;
  }
  return current?.val ?? -1;
}`,
  },
  "insert-beginning": {
    python: `def insert_beginning(head, value):
    new_node = Node(value)
    new_node.next = head
    head = new_node
    return head`,
    typescript: `function insertBeginning(head: ListNode | null, value: number): ListNode {
  const newNode = new ListNode(value);
  newNode.next = head;
  head = newNode;
  return head;
}`,
  },
  "insert-end": {
    python: `def insert_end(head, tail, value):
    new_node = Node(value)
    if tail is not None:
        tail.next = new_node
    tail = new_node
    return head, tail`,
    typescript: `function insertEnd(head: ListNode | null, tail: ListNode | null, value: number) {
  const newNode = new ListNode(value);
  if (tail !== null) {
    tail.next = newNode;
  }
  tail = newNode;
  return { head: head ?? newNode, tail };
}`,
  },
  "insert-position": {
    python: `def insert_at_position(head, position, value):
    new_node = Node(value)
    current = head
    for i in range(position - 1):
        current = current.next
    new_node.next = current.next
    current.next = new_node
    return head`,
    typescript: `function insertAtPosition(head: ListNode | null, position: number, value: number) {
  const newNode = new ListNode(value);
  let current = head;
  for (let i = 0; i < position - 1; i++) {
    current = current?.next ?? null;
  }
  newNode.next = current?.next ?? null;
  if (current) current.next = newNode;
  return head;
}`,
  },
  "delete-beginning": {
    python: `def delete_beginning(head):
    if head is None:
        return None
    old_head = head
    head = head.next
    old_head.next = None
    return head`,
    typescript: `function deleteBeginning(head: ListNode | null): ListNode | null {
  if (head === null) return null;
  const oldHead = head;
  head = head.next;
  oldHead.next = null;
  return head;
}`,
  },
  "delete-end": {
    python: `def delete_end(head):
    if head is None or head.next is None:
        return None
    current = head
    while current.next.next is not None:
        current = current.next
    current.next = None
    return head`,
    typescript: `function deleteEnd(head: ListNode | null): ListNode | null {
  if (head === null || head.next === null) return null;
  let current = head;
  while (current.next?.next !== null) {
    current = current.next!;
  }
  current.next = null;
  return head;
}`,
  },
  "delete-position": {
    python: `def delete_at_position(head, position):
    current = head
    for i in range(position - 1):
        current = current.next
    target_node = current.next
    current.next = target_node.next
    return head`,
    typescript: `function deleteAtPosition(head: ListNode | null, position: number) {
  let current = head;
  for (let i = 0; i < position - 1; i++) {
    current = current?.next ?? null;
  }
  const targetNode = current?.next;
  if (current && targetNode) {
    current.next = targetNode.next;
  }
  return head;
}`,
  },
  update: {
    python: `def update_value(head, position, new_val):
    current = head
    for i in range(position):
        current = current.next
    current.val = new_val
    return head`,
    typescript: `function updateValue(head: ListNode | null, position: number, newVal: number) {
  let current = head;
  for (let i = 0; i < position; i++) {
    current = current?.next ?? null;
  }
  if (current) current.val = newVal;
  return head;
}`,
  },
  reverse: {
    python: `def reverse(head):
    prev = None
    current = head
    while current is not None:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node
    return prev`,
    typescript: `function reverse(head: ListNode | null): ListNode | null {
  let prev = null;
  let current = head;
  while (current !== null) {
    const nextNode = current.next;
    current.next = prev;
    prev = current;
    current = nextNode;
  }
  return prev;
}`,
  },
};

/**
 * Returns structured SourceCode snippets for a linked list operation.
 */
export function getLinkedListSourceCodes(
  operation: LinkedListOperationType
): Partial<Record<SupportedLanguage, SourceCode>> {
  const def = RAW_CODE_SNIPPETS[operation];
  return {
    python: parseSourceCode(def.python, "python"),
    typescript: parseSourceCode(def.typescript, "typescript"),
  };
}

export const getLinkedListOperationSourceCodes = getLinkedListSourceCodes;
