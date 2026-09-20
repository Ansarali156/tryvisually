/**
 * Heap & Priority Queue Multi-Language Code Snippets
 *
 * Provides educational source code implementations across Python, JavaScript,
 * TypeScript, Java, and C++ for Heap and Priority Queue operations.
 * Line numbers are 1-indexed for synchronization with ExecutionStep codeLine mappings.
 */

import type { SourceCode, SupportedLanguage } from "@/core/synchronization/types";
import { parseSourceCode } from "@/core/synchronization/utils/source-code";
import type { HeapOperationType, PriorityQueueOperationType } from "./types";

const HEAP_INSERT_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def insert(heap, val):
    heap.append(val)
    i = len(heap) - 1
    # Sift Up
    while i > 0:
        parent = (i - 1) // 2
        if heap[i] < heap[parent]:  # for Min Heap
            heap[i], heap[parent] = heap[parent], heap[i]
            i = parent
        else:
            break`,
  javascript: `function insert(heap, val) {
  heap.push(val);
  let i = heap.length - 1;
  // Sift Up
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (heap[i] < heap[parent]) { // for Min Heap
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    } else {
      break;
    }
  }
}`,
  typescript: `function insert(heap: number[], val: number): void {
  heap.push(val);
  let i = heap.length - 1;
  // Sift Up
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (heap[i] < heap[parent]) { // for Min Heap
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    } else {
      break;
    }
  }
}`,
  java: `public void insert(List<Integer> heap, int val) {
    heap.add(val);
    int i = heap.size() - 1;
    // Sift Up
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap.get(i) < heap.get(parent)) {
            Collections.swap(heap, i, parent);
            i = parent;
        } else {
            break;
        }
    }
}`,
  cpp: `void insert(std::vector<int>& heap, int val) {
    heap.push_back(val);
    int i = heap.size() - 1;
    // Sift Up
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap[i] < heap[parent]) {
            std::swap(heap[i], heap[parent]);
            i = parent;
        } else {
            break;
        }
    }
}`,
};

const HEAP_EXTRACT_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def extract_root(heap):
    if not heap: return None
    root = heap[0]
    last = heap.pop()
    if heap:
        heap[0] = last
        sift_down(heap, 0)
    return root

def sift_down(heap, i):
    n = len(heap)
    while True:
        target = i
        left = 2 * i + 1
        right = 2 * i + 2
        if left < n and heap[left] < heap[target]:
            target = left
        if right < n and heap[right] < heap[target]:
            target = right
        if target != i:
            heap[i], heap[target] = heap[target], heap[i]
            i = target
        else:
            break`,
  javascript: `function extractRoot(heap) {
  if (heap.length === 0) return null;
  const root = heap[0];
  const last = heap.pop();
  if (heap.length > 0) {
    heap[0] = last;
    siftDown(heap, 0);
  }
  return root;
}

function siftDown(heap, i) {
  const n = heap.length;
  while (true) {
    let target = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < n && heap[left] < heap[target]) target = left;
    if (right < n && heap[right] < heap[target]) target = right;
    if (target !== i) {
      [heap[i], heap[target]] = [heap[target], heap[i]];
      i = target;
    } else {
      break;
    }
  }
}`,
  typescript: `function extractRoot(heap: number[]): number | null {
  if (heap.length === 0) return null;
  const root = heap[0];
  const last = heap.pop()!;
  if (heap.length > 0) {
    heap[0] = last;
    siftDown(heap, 0);
  }
  return root;
}

function siftDown(heap: number[], i: number): void {
  const n = heap.length;
  while (true) {
    let target = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < n && heap[left] < heap[target]) target = left;
    if (right < n && heap[right] < heap[target]) target = right;
    if (target !== i) {
      [heap[i], heap[target]] = [heap[target], heap[i]];
      i = target;
    } else {
      break;
    }
  }
}`,
  java: `public Integer extractRoot(List<Integer> heap) {
    if (heap.isEmpty()) return null;
    int root = heap.get(0);
    int last = heap.remove(heap.size() - 1);
    if (!heap.isEmpty()) {
        heap.set(0, last);
        siftDown(heap, 0);
    }
    return root;
}

void siftDown(List<Integer> heap, int i) {
    int n = heap.size();
    while (true) {
        int target = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        if (left < n && heap.get(left) < heap.get(target)) target = left;
        if (right < n && heap.get(right) < heap.get(target)) target = right;
        if (target != i) {
            Collections.swap(heap, i, target);
            i = target;
        } else {
            break;
        }
    }
}`,
  cpp: `int extractRoot(std::vector<int>& heap) {
    if (heap.empty()) return -1;
    int root = heap[0];
    int last = heap.back();
    heap.pop_back();
    if (!heap.empty()) {
        heap[0] = last;
        siftDown(heap, 0);
    }
    return root;
}

void siftDown(std::vector<int>& heap, int i) {
    int n = heap.size();
    while (true) {
        int target = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        if (left < n && heap[left] < heap[target]) target = left;
        if (right < n && heap[right] < heap[target]) target = right;
        if (target != i) {
            std::swap(heap[i], heap[target]);
            i = target;
        } else {
            break;
        }
    }
}`,
};

const HEAP_PEEK_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def peek(heap):
    if not heap:
        return None
    return heap[0]  # O(1) constant time`,
  javascript: `function peek(heap) {
  if (heap.length === 0) return null;
  return heap[0]; // O(1) constant time
}`,
  typescript: `function peek(heap: number[]): number | null {
  if (heap.length === 0) return null;
  return heap[0]; // O(1) constant time
}`,
  java: `public Integer peek(List<Integer> heap) {
    if (heap.isEmpty()) return null;
    return heap.get(0); // O(1) constant time
}`,
  cpp: `int peek(const std::vector<int>& heap) {
    if (heap.empty()) return -1;
    return heap[0]; // O(1) constant time
}`,
};

const HEAP_BUILD_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def build_heap(arr):
    n = len(arr)
    # Start at last internal node: floor(n/2) - 1
    for i in range(n // 2 - 1, -1, -1):
        sift_down(arr, i)
    return arr  # O(n) linear time`,
  javascript: `function buildHeap(arr) {
  const n = arr.length;
  // Start at last internal node: floor(n/2) - 1
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(arr, i);
  }
  return arr; // O(n) linear time
}`,
  typescript: `function buildHeap(arr: number[]): number[] {
  const n = arr.length;
  // Start at last internal node: floor(n/2) - 1
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(arr, i);
  }
  return arr; // O(n) linear time
}`,
  java: `public void buildHeap(List<Integer> arr) {
    int n = arr.size();
    // Start at last internal node: floor(n/2) - 1
    for (int i = n / 2 - 1; i >= 0; i--) {
        siftDown(arr, i);
    }
}`,
  cpp: `void buildHeap(std::vector<int>& arr) {
    int n = arr.size();
    // Start at last internal node: floor(n/2) - 1
    for (int i = n / 2 - 1; i >= 0; i--) {
        siftDown(arr, i);
    }
}`,
};

const HEAP_DELETE_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def delete_element(heap, index):
    n = len(heap)
    if index < 0 or index >= n: return
    # Swap target with last element
    heap[index] = heap.pop()
    if index < len(heap):
        parent = (index - 1) // 2
        if index > 0 and heap[index] < heap[parent]:
            sift_up(heap, index)
        else:
            sift_down(heap, index)`,
  javascript: `function deleteElement(heap, index) {
  if (index < 0 || index >= heap.length) return;
  const last = heap.pop();
  if (index < heap.length) {
    heap[index] = last;
    const parent = Math.floor((index - 1) / 2);
    if (index > 0 && heap[index] < heap[parent]) {
      siftUp(heap, index);
    } else {
      siftDown(heap, index);
    }
  }
}`,
  typescript: `function deleteElement(heap: number[], index: number): void {
  if (index < 0 || index >= heap.length) return;
  const last = heap.pop()!;
  if (index < heap.length) {
    heap[index] = last;
    const parent = Math.floor((index - 1) / 2);
    if (index > 0 && heap[index] < heap[parent]) {
      siftUp(heap, index);
    } else {
      siftDown(heap, index);
    }
  }
}`,
  java: `public void deleteElement(List<Integer> heap, int index) {
    if (index < 0 || index >= heap.size()) return;
    int last = heap.remove(heap.size() - 1);
    if (index < heap.size()) {
        heap.set(index, last);
        int parent = (index - 1) / 2;
        if (index > 0 && heap.get(index) < heap.get(parent)) {
            siftUp(heap, index);
        } else {
            siftDown(heap, index);
        }
    }
}`,
  cpp: `void deleteElement(std::vector<int>& heap, int index) {
    if (index < 0 || index >= (int)heap.size()) return;
    int last = heap.back();
    heap.pop_back();
    if (index < (int)heap.size()) {
        heap[index] = last;
        int parent = (index - 1) / 2;
        if (index > 0 && heap[index] < heap[parent]) {
            siftUp(heap, index);
        } else {
            siftDown(heap, index);
        }
    }
}`,
};

const PQ_ENQUEUE_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def enqueue(pq, task, priority):
    pq.append({"task": task, "priority": priority})
    i = len(pq) - 1
    # Sift Up according to priority
    while i > 0:
        parent = (i - 1) // 2
        if pq[i]["priority"] < pq[parent]["priority"]:
            pq[i], pq[parent] = pq[parent], pq[i]
            i = parent
        else:
            break`,
  javascript: `function enqueue(pq, task, priority) {
  pq.push({ task, priority });
  let i = pq.length - 1;
  // Sift Up according to priority
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (pq[i].priority < pq[parent].priority) {
      [pq[i], pq[parent]] = [pq[parent], pq[i]];
      i = parent;
    } else {
      break;
    }
  }
}`,
  typescript: `function enqueue(pq: PriorityQueueItem[], task: string, priority: number): void {
  pq.push({ task, priority });
  let i = pq.length - 1;
  // Sift Up according to priority
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (pq[i].priority < pq[parent].priority) {
      [pq[i], pq[parent]] = [pq[parent], pq[i]];
      i = parent;
    } else {
      break;
    }
  }
}`,
  java: `public void enqueue(List<PQItem> pq, String task, int priority) {
    pq.add(new PQItem(task, priority));
    int i = pq.size() - 1;
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (pq.get(i).priority < pq.get(parent).priority) {
            Collections.swap(pq, i, parent);
            i = parent;
        } else {
            break;
        }
    }
}`,
  cpp: `void enqueue(std::vector<PQItem>& pq, std::string task, int priority) {
    pq.push_back({task, priority});
    int i = pq.size() - 1;
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (pq[i].priority < pq[parent].priority) {
            std::swap(pq[i], pq[parent]);
            i = parent;
        } else {
            break;
        }
    }
}`,
};

const PQ_DEQUEUE_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def dequeue(pq):
    if not pq: return None
    highest = pq[0]
    last = pq.pop()
    if pq:
        pq[0] = last
        sift_down_pq(pq, 0)
    return highest`,
  javascript: `function dequeue(pq) {
  if (pq.length === 0) return null;
  const highest = pq[0];
  const last = pq.pop();
  if (pq.length > 0) {
    pq[0] = last;
    siftDownPQ(pq, 0);
  }
  return highest;
}`,
  typescript: `function dequeue(pq: PriorityQueueItem[]): PriorityQueueItem | null {
  if (pq.length === 0) return null;
  const highest = pq[0];
  const last = pq.pop()!;
  if (pq.length > 0) {
    pq[0] = last;
    siftDownPQ(pq, 0);
  }
  return highest;
}`,
  java: `public PQItem dequeue(List<PQItem> pq) {
    if (pq.isEmpty()) return null;
    PQItem highest = pq.get(0);
    PQItem last = pq.remove(pq.size() - 1);
    if (!pq.isEmpty()) {
        pq.set(0, last);
        siftDownPQ(pq, 0);
    }
    return highest;
}`,
  cpp: `PQItem dequeue(std::vector<PQItem>& pq) {
    PQItem highest = pq[0];
    PQItem last = pq.back();
    pq.pop_back();
    if (!pq.empty()) {
        pq[0] = last;
        siftDownPQ(pq, 0);
    }
    return highest;
}`,
};

/**
 * Returns multi-language source code dictionary for a given heap operation.
 */
export function getHeapSourceCodes(operation: HeapOperationType): Record<SupportedLanguage, SourceCode> {
  let dictionary = HEAP_INSERT_SNIPPETS;

  switch (operation) {
    case "insert":
      dictionary = HEAP_INSERT_SNIPPETS;
      break;
    case "extract-root":
      dictionary = HEAP_EXTRACT_SNIPPETS;
      break;
    case "peek":
      dictionary = HEAP_PEEK_SNIPPETS;
      break;
    case "build-heap":
    case "heapify":
      dictionary = HEAP_BUILD_SNIPPETS;
      break;
    case "delete":
    case "update":
      dictionary = HEAP_DELETE_SNIPPETS;
      break;
    case "clear":
      dictionary = HEAP_PEEK_SNIPPETS;
      break;
    default:
      dictionary = HEAP_INSERT_SNIPPETS;
      break;
  }

  return {
    python: parseSourceCode(dictionary.python, "python"),
    javascript: parseSourceCode(dictionary.javascript, "javascript"),
    typescript: parseSourceCode(dictionary.typescript, "typescript"),
    java: parseSourceCode(dictionary.java, "java"),
    cpp: parseSourceCode(dictionary.cpp, "cpp"),
  };
}

/**
 * Returns multi-language source code dictionary for a given priority queue operation.
 */
export function getPriorityQueueSourceCodes(operation: PriorityQueueOperationType): Record<SupportedLanguage, SourceCode> {
  let dictionary = PQ_ENQUEUE_SNIPPETS;

  switch (operation) {
    case "enqueue":
      dictionary = PQ_ENQUEUE_SNIPPETS;
      break;
    case "dequeue":
    case "remove":
      dictionary = PQ_DEQUEUE_SNIPPETS;
      break;
    case "peek":
    case "size":
    case "clear":
      dictionary = HEAP_PEEK_SNIPPETS;
      break;
    case "change-priority":
      dictionary = HEAP_DELETE_SNIPPETS;
      break;
    default:
      dictionary = PQ_ENQUEUE_SNIPPETS;
      break;
  }

  return {
    python: parseSourceCode(dictionary.python, "python"),
    javascript: parseSourceCode(dictionary.javascript, "javascript"),
    typescript: parseSourceCode(dictionary.typescript, "typescript"),
    java: parseSourceCode(dictionary.java, "java"),
    cpp: parseSourceCode(dictionary.cpp, "cpp"),
  };
}
