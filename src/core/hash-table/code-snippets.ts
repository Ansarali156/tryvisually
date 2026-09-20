/**
 * Synchronized Source Code Snippets for Hash Table Operations
 *
 * Provides structured SourceCode models with 1-indexed lines across 5 languages:
 * Python, JavaScript, TypeScript, Java, and C++.
 *
 * Tailored for Separate Chaining, Linear Probing, and Quadratic Probing.
 */

import type { SourceCode, SupportedLanguage } from "@/core/synchronization/types";
import { parseSourceCode } from "@/core/synchronization/utils/source-code";
import type { CollisionStrategy, HashTableOperationType } from "./types";

interface SnippetDictionary {
  readonly python: string;
  readonly javascript: string;
  readonly typescript: string;
  readonly java: string;
  readonly cpp: string;
}

// Separate Chaining Snippets
const CHAINING_SNIPPETS: Record<HashTableOperationType, SnippetDictionary> = {
  insert: {
    python: `def insert(table, key, value):
    index = hash_func(key) % capacity
    bucket = table[index]
    for entry in bucket:
        if entry.key == key:
            entry.value = value
            return
    bucket.append(Entry(key, value))
    size += 1`,
    javascript: `function insert(table, key, value) {
  const index = hash(key) % capacity;
  const bucket = table[index];
  for (const entry of bucket) {
    if (entry.key === key) {
      entry.value = value;
      return;
    }
  }
  bucket.push({ key, value });
  size++;
}`,
    typescript: `function insert(key: string, value: string): void {
  const index = hash(key) % capacity;
  const bucket = table[index];
  for (const entry of bucket) {
    if (entry.key === key) {
      entry.value = value;
      return;
    }
  }
  bucket.push({ key, value });
  size++;
}`,
    java: `public void insert(String key, String value) {
    int index = Math.abs(key.hashCode()) % capacity;
    LinkedList<Entry> bucket = table[index];
    for (Entry entry : bucket) {
        if (entry.key.equals(key)) {
            entry.value = value;
            return;
        }
    }
    bucket.add(new Entry(key, value));
    size++;
}`,
    cpp: `void insert(const string& key, const string& value) {
    int index = hash(key) % capacity;
    auto& bucket = table[index];
    for (auto& entry : bucket) {
        if (entry.key == key) {
            entry.value = value;
            return;
        }
    }
    bucket.emplace_back(key, value);
    size++;
}`,
  },
  search: {
    python: `def search(table, key):
    index = hash_func(key) % capacity
    bucket = table[index]
    for entry in bucket:
        if entry.key == key:
            return entry.value
    return None`,
    javascript: `function search(table, key) {
  const index = hash(key) % capacity;
  const bucket = table[index];
  for (const entry of bucket) {
    if (entry.key === key) {
      return entry.value;
    }
  }
  return null;
}`,
    typescript: `function search(key: string): string | null {
  const index = hash(key) % capacity;
  const bucket = table[index];
  for (const entry of bucket) {
    if (entry.key === key) {
      return entry.value;
    }
  }
  return null;
}`,
    java: `public String search(String key) {
    int index = Math.abs(key.hashCode()) % capacity;
    LinkedList<Entry> bucket = table[index];
    for (Entry entry : bucket) {
        if (entry.key.equals(key)) {
            return entry.value;
        }
    }
    return null;
}`,
    cpp: `string* search(const string& key) {
    int index = hash(key) % capacity;
    for (auto& entry : table[index]) {
        if (entry.key == key) {
            return &entry.value;
        }
    }
    return nullptr;
}`,
  },
  update: {
    python: `def update(table, key, new_value):
    index = hash_func(key) % capacity
    for entry in table[index]:
        if entry.key == key:
            entry.value = new_value
            return True
    return False`,
    javascript: `function update(table, key, newValue) {
  const index = hash(key) % capacity;
  for (const entry of table[index]) {
    if (entry.key === key) {
      entry.value = newValue;
      return true;
    }
  }
  return false;
}`,
    typescript: `function update(key: string, newValue: string): boolean {
  const index = hash(key) % capacity;
  for (const entry of table[index]) {
    if (entry.key === key) {
      entry.value = newValue;
      return true;
    }
  }
  return false;
}`,
    java: `public boolean update(String key, String newValue) {
    int index = Math.abs(key.hashCode()) % capacity;
    for (Entry entry : table[index]) {
        if (entry.key.equals(key)) {
            entry.value = newValue;
            return true;
        }
    }
    return false;
}`,
    cpp: `bool update(const string& key, const string& newValue) {
    int index = hash(key) % capacity;
    for (auto& entry : table[index]) {
        if (entry.key == key) {
            entry.value = newValue;
            return true;
        }
    }
    return false;
}`,
  },
  delete: {
    python: `def delete(table, key):
    index = hash_func(key) % capacity
    bucket = table[index]
    for i, entry in enumerate(bucket):
        if entry.key == key:
            del bucket[i]
            size -= 1
            return True
    return False`,
    javascript: `function deleteKey(table, key) {
  const index = hash(key) % capacity;
  const bucket = table[index];
  const idx = bucket.findIndex(e => e.key === key);
  if (idx !== -1) {
    bucket.splice(idx, 1);
    size--;
    return true;
  }
  return false;
}`,
    typescript: `function deleteKey(key: string): boolean {
  const index = hash(key) % capacity;
  const bucket = table[index];
  const idx = bucket.findIndex(e => e.key === key);
  if (idx !== -1) {
    bucket.splice(idx, 1);
    size--;
    return true;
  }
  return false;
}`,
    java: `public boolean delete(String key) {
    int index = Math.abs(key.hashCode()) % capacity;
    Iterator<Entry> it = table[index].iterator();
    while (it.hasNext()) {
        if (it.next().key.equals(key)) {
            it.remove();
            size--;
            return true;
        }
    }
    return false;
}`,
    cpp: `bool erase(const string& key) {
    int index = hash(key) % capacity;
    auto& bucket = table[index];
    for (auto it = bucket.begin(); it != bucket.end(); ++it) {
        if (it->key == key) {
            bucket.erase(it);
            size--;
            return true;
        }
    }
    return false;
}`,
  },
  contains: {
    python: `def contains(table, key):
    index = hash_func(key) % capacity
    return any(e.key == key for e in table[index])`,
    javascript: `function contains(table, key) {
  const index = hash(key) % capacity;
  return table[index].some(e => e.key === key);
}`,
    typescript: `function contains(key: string): boolean {
  const index = hash(key) % capacity;
  return table[index].some(e => e.key === key);
}`,
    java: `public boolean contains(String key) {
    int index = Math.abs(key.hashCode()) % capacity;
    for (Entry e : table[index]) {
        if (e.key.equals(key)) return true;
    }
    return false;
}`,
    cpp: `bool contains(const string& key) {
    int index = hash(key) % capacity;
    for (const auto& e : table[index]) {
        if (e.key == key) return true;
    }
    return false;
}`,
  },
  size: {
    python: `def get_size():
    load_factor = size / capacity
    return size`,
    javascript: `function getSize() {
  const loadFactor = size / capacity;
  return size;
}`,
    typescript: `function getSize(): number {
  const loadFactor = size / capacity;
  return size;
}`,
    java: `public int size() {
    double loadFactor = (double) size / capacity;
    return size;
}`,
    cpp: `int getSize() const {
    double loadFactor = double(size) / capacity;
    return size;
}`,
  },
  clear: {
    python: `def clear(table):
    for bucket in table:
        bucket.clear()
    size = 0`,
    javascript: `function clear(table) {
  for (const bucket of table) {
    bucket.length = 0;
  }
  size = 0;
}`,
    typescript: `function clear(): void {
  for (const bucket of table) {
    bucket.length = 0;
  }
  size = 0;
}`,
    java: `public void clear() {
    for (LinkedList<Entry> bucket : table) {
        bucket.clear();
    }
    size = 0;
}`,
    cpp: `void clear() {
    for (auto& bucket : table) {
        bucket.clear();
    }
    size = 0;
}`,
  },
};

// Open Addressing (Linear / Quadratic Probing) Snippets
const OPEN_ADDRESSING_SNIPPETS: Record<HashTableOperationType, SnippetDictionary> = {
  insert: {
    python: `def insert(slots, key, value):
    h = hash_func(key) % capacity
    first_deleted = -1
    for i in range(capacity):
        idx = (h + probe_offset(i)) % capacity
        if slots[idx].status == "empty":
            target = first_deleted if first_deleted != -1 else idx
            slots[target] = Slot("occupied", key, value)
            size += 1
            return
        if slots[idx].status == "deleted" and first_deleted == -1:
            first_deleted = idx
        elif slots[idx].status == "occupied" and slots[idx].key == key:
            slots[idx].value = value
            return
    raise OverflowError("Table is full")`,
    javascript: `function insert(slots, key, value) {
  const h = hash(key) % capacity;
  let firstDeleted = -1;
  for (let i = 0; i < capacity; i++) {
    const idx = (h + probeOffset(i)) % capacity;
    if (slots[idx].status === "empty") {
      const target = firstDeleted !== -1 ? firstDeleted : idx;
      slots[target] = { status: "occupied", key, value };
      size++;
      return;
    }
    if (slots[idx].status === "deleted" && firstDeleted === -1) {
      firstDeleted = idx;
    } else if (slots[idx].status === "occupied" && slots[idx].key === key) {
      slots[idx].value = value;
      return;
    }
  }
  throw new Error("Table is full");
}`,
    typescript: `function insert(key: string, value: string): void {
  const h = hash(key) % capacity;
  let firstDeleted = -1;
  for (let i = 0; i < capacity; i++) {
    const idx = (h + probeOffset(i)) % capacity;
    if (slots[idx].status === "empty") {
      const target = firstDeleted !== -1 ? firstDeleted : idx;
      slots[target] = { status: "occupied", key, value };
      size++;
      return;
    }
    if (slots[idx].status === "deleted" && firstDeleted === -1) {
      firstDeleted = idx;
    } else if (slots[idx].status === "occupied" && slots[idx].key === key) {
      slots[idx].value = value;
      return;
    }
  }
  throw new Error("Table is full");
}`,
    java: `public void insert(String key, String value) {
    int h = Math.abs(key.hashCode()) % capacity;
    int firstDeleted = -1;
    for (int i = 0; i < capacity; i++) {
        int idx = (h + probeOffset(i)) % capacity;
        if (slots[idx].status == Status.EMPTY) {
            int target = firstDeleted != -1 ? firstDeleted : idx;
            slots[target] = new Slot(Status.OCCUPIED, key, value);
            size++;
            return;
        }
        if (slots[idx].status == Status.DELETED && firstDeleted == -1) {
            firstDeleted = idx;
        } else if (slots[idx].status == Status.OCCUPIED && slots[idx].key.equals(key)) {
            slots[idx].value = value;
            return;
        }
    }
    throw new IllegalStateException("Table is full");
}`,
    cpp: `void insert(const string& key, const string& value) {
    int h = hash(key) % capacity;
    int firstDeleted = -1;
    for (int i = 0; i < capacity; i++) {
        int idx = (h + probeOffset(i)) % capacity;
        if (slots[idx].status == Status::EMPTY) {
            int target = firstDeleted != -1 ? firstDeleted : idx;
            slots[target] = Slot(Status::OCCUPIED, key, value);
            size++;
            return;
        }
        if (slots[idx].status == Status::DELETED && firstDeleted == -1) {
            firstDeleted = idx;
        } else if (slots[idx].status == Status::OCCUPIED && slots[idx].key == key) {
            slots[idx].value = value;
            return;
        }
    }
    throw runtime_error("Table is full");
}`,
  },
  search: {
    python: `def search(slots, key):
    h = hash_func(key) % capacity
    for i in range(capacity):
        idx = (h + probe_offset(i)) % capacity
        if slots[idx].status == "empty":
            return None  # Key not found
        if slots[idx].status == "occupied" and slots[idx].key == key:
            return slots[idx].value
    return None`,
    javascript: `function search(slots, key) {
  const h = hash(key) % capacity;
  for (let i = 0; i < capacity; i++) {
    const idx = (h + probeOffset(i)) % capacity;
    if (slots[idx].status === "empty") {
      return null; // Empty slot stops search
    }
    if (slots[idx].status === "occupied" && slots[idx].key === key) {
      return slots[idx].value;
    }
  }
  return null;
}`,
    typescript: `function search(key: string): string | null {
  const h = hash(key) % capacity;
  for (let i = 0; i < capacity; i++) {
    const idx = (h + probeOffset(i)) % capacity;
    if (slots[idx].status === "empty") {
      return null;
    }
    if (slots[idx].status === "occupied" && slots[idx].key === key) {
      return slots[idx].value;
    }
  }
  return null;
}`,
    java: `public String search(String key) {
    int h = Math.abs(key.hashCode()) % capacity;
    for (int i = 0; i < capacity; i++) {
        int idx = (h + probeOffset(i)) % capacity;
        if (slots[idx].status == Status.EMPTY) return null;
        if (slots[idx].status == Status.OCCUPIED && slots[idx].key.equals(key)) {
            return slots[idx].value;
        }
    }
    return null;
}`,
    cpp: `string* search(const string& key) {
    int h = hash(key) % capacity;
    for (int i = 0; i < capacity; i++) {
        int idx = (h + probeOffset(i)) % capacity;
        if (slots[idx].status == Status::EMPTY) return nullptr;
        if (slots[idx].status == Status::OCCUPIED && slots[idx].key == key) {
            return &slots[idx].value;
        }
    }
    return nullptr;
}`,
  },
  update: {
    python: `def update(slots, key, new_value):
    h = hash_func(key) % capacity
    for i in range(capacity):
        idx = (h + probe_offset(i)) % capacity
        if slots[idx].status == "empty":
            return False
        if slots[idx].status == "occupied" and slots[idx].key == key:
            slots[idx].value = new_value
            return True
    return False`,
    javascript: `function update(slots, key, newValue) {
  const h = hash(key) % capacity;
  for (let i = 0; i < capacity; i++) {
    const idx = (h + probeOffset(i)) % capacity;
    if (slots[idx].status === "empty") return false;
    if (slots[idx].status === "occupied" && slots[idx].key === key) {
      slots[idx].value = newValue;
      return true;
    }
  }
  return false;
}`,
    typescript: `function update(key: string, newValue: string): boolean {
  const h = hash(key) % capacity;
  for (let i = 0; i < capacity; i++) {
    const idx = (h + probeOffset(i)) % capacity;
    if (slots[idx].status === "empty") return false;
    if (slots[idx].status === "occupied" && slots[idx].key === key) {
      slots[idx].value = newValue;
      return true;
    }
  }
  return false;
}`,
    java: `public boolean update(String key, String newValue) {
    int h = Math.abs(key.hashCode()) % capacity;
    for (int i = 0; i < capacity; i++) {
        int idx = (h + probeOffset(i)) % capacity;
        if (slots[idx].status == Status.EMPTY) return false;
        if (slots[idx].status == Status.OCCUPIED && slots[idx].key.equals(key)) {
            slots[idx].value = newValue;
            return true;
        }
    }
    return false;
}`,
    cpp: `bool update(const string& key, const string& newValue) {
    int h = hash(key) % capacity;
    for (int i = 0; i < capacity; i++) {
        int idx = (h + probeOffset(i)) % capacity;
        if (slots[idx].status == Status::EMPTY) return false;
        if (slots[idx].status == Status::OCCUPIED && slots[idx].key == key) {
            slots[idx].value = newValue;
            return true;
        }
    }
    return false;
}`,
  },
  delete: {
    python: `def delete(slots, key):
    h = hash_func(key) % capacity
    for i in range(capacity):
        idx = (h + probe_offset(i)) % capacity
        if slots[idx].status == "empty":
            return False
        if slots[idx].status == "occupied" and slots[idx].key == key:
            slots[idx].status = "deleted"  # Tombstone
            slots[idx].entry = None
            size -= 1
            return True
    return False`,
    javascript: `function deleteKey(slots, key) {
  const h = hash(key) % capacity;
  for (let i = 0; i < capacity; i++) {
    const idx = (h + probeOffset(i)) % capacity;
    if (slots[idx].status === "empty") return false;
    if (slots[idx].status === "occupied" && slots[idx].key === key) {
      slots[idx].status = "deleted"; // Tombstone
      slots[idx].entry = null;
      size--;
      return true;
    }
  }
  return false;
}`,
    typescript: `function deleteKey(key: string): boolean {
  const h = hash(key) % capacity;
  for (let i = 0; i < capacity; i++) {
    const idx = (h + probeOffset(i)) % capacity;
    if (slots[idx].status === "empty") return false;
    if (slots[idx].status === "occupied" && slots[idx].key === key) {
      slots[idx].status = "deleted"; // Tombstone
      slots[idx].entry = null;
      size--;
      return true;
    }
  }
  return false;
}`,
    java: `public boolean delete(String key) {
    int h = Math.abs(key.hashCode()) % capacity;
    for (int i = 0; i < capacity; i++) {
        int idx = (h + probeOffset(i)) % capacity;
        if (slots[idx].status == Status.EMPTY) return false;
        if (slots[idx].status == Status.OCCUPIED && slots[idx].key.equals(key)) {
            slots[idx].status = Status.DELETED; // Tombstone
            slots[idx].entry = null;
            size--;
            return true;
        }
    }
    return false;
}`,
    cpp: `bool erase(const string& key) {
    int h = hash(key) % capacity;
    for (int i = 0; i < capacity; i++) {
        int idx = (h + probeOffset(i)) % capacity;
        if (slots[idx].status == Status::EMPTY) return false;
        if (slots[idx].status == Status::OCCUPIED && slots[idx].key == key) {
            slots[idx].status = Status::DELETED; // Tombstone
            slots[idx].entry = nullptr;
            size--;
            return true;
        }
    }
    return false;
}`,
  },
  contains: {
    python: `def contains(slots, key):
    return search(slots, key) is not None`,
    javascript: `function contains(slots, key) {
  return search(slots, key) !== null;
}`,
    typescript: `function contains(key: string): boolean {
  return search(key) !== null;
}`,
    java: `public boolean contains(String key) {
    return search(key) != null;
}`,
    cpp: `bool contains(const string& key) {
    return search(key) != nullptr;
}`,
  },
  size: {
    python: `def get_size():
    load_factor = size / capacity
    return size`,
    javascript: `function getSize() {
  const loadFactor = size / capacity;
  return size;
}`,
    typescript: `function getSize(): number {
  const loadFactor = size / capacity;
  return size;
}`,
    java: `public int size() {
    double loadFactor = (double) size / capacity;
    return size;
}`,
    cpp: `int getSize() const {
    double loadFactor = double(size) / capacity;
    return size;
}`,
  },
  clear: {
    python: `def clear(slots):
    for slot in slots:
        slot.status = "empty"
        slot.entry = None
    size = 0`,
    javascript: `function clear(slots) {
  for (const slot of slots) {
    slot.status = "empty";
    slot.entry = null;
  }
  size = 0;
}`,
    typescript: `function clear(): void {
  for (const slot of slots) {
    slot.status = "empty";
    slot.entry = null;
  }
  size = 0;
}`,
    java: `public void clear() {
    for (Slot slot : slots) {
        slot.status = Status.EMPTY;
        slot.entry = null;
    }
    size = 0;
}`,
    cpp: `void clear() {
    for (auto& slot : slots) {
        slot.status = Status::EMPTY;
        slot.entry = nullptr;
    }
    size = 0;
}`,
  },
};

/**
 * Retrieves structured source code snippets for a given operation and strategy across all 5 languages.
 */
export function getHashTableSourceCodes(
  operation: HashTableOperationType,
  strategy: CollisionStrategy = "chaining"
): Record<SupportedLanguage, SourceCode> {
  const dictionary = strategy === "chaining"
    ? CHAINING_SNIPPETS[operation]
    : OPEN_ADDRESSING_SNIPPETS[operation];

  return {
    python: parseSourceCode(dictionary.python, "python"),
    javascript: parseSourceCode(dictionary.javascript, "javascript"),
    typescript: parseSourceCode(dictionary.typescript, "typescript"),
    java: parseSourceCode(dictionary.java, "java"),
    cpp: parseSourceCode(dictionary.cpp, "cpp"),
  };
}
