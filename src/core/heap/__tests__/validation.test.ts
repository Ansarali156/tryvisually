import { describe, it, expect } from "vitest";
import {
  validateHeapValue,
  validatePriority,
  validateTaskName,
  getParentIndex,
  getLeftChildIndex,
  getRightChildIndex,
  generateHeapElementId,
  generatePQElementId,
  createEmptyHeapState,
  createSampleHeapState,
  createSamplePriorityQueueState,
  isValidHeap,
  isValidPriorityQueue,
  calculateHeapHeight,
  getHeapStatistics,
  getPriorityQueueStatistics,
} from "../validation";

describe("Heap & Priority Queue Validation & Helpers", () => {
  it("should validate heap values correctly", () => {
    expect(validateHeapValue(42).isValid).toBe(true);
    expect(validateHeapValue("42").isValid).toBe(true);
    expect(validateHeapValue("").isValid).toBe(false);
    expect(validateHeapValue(null).isValid).toBe(false);
    expect(validateHeapValue("abc").isValid).toBe(false);
    expect(validateHeapValue(3.14).isValid).toBe(false);
    expect(validateHeapValue(10000).isValid).toBe(false);
  });

  it("should validate priority and task name correctly", () => {
    expect(validatePriority(1).isValid).toBe(true);
    expect(validatePriority(999).isValid).toBe(true);
    expect(validatePriority(0).isValid).toBe(false);
    expect(validatePriority(1000).isValid).toBe(false);

    expect(validateTaskName("Fix Bug").isValid).toBe(true);
    expect(validateTaskName("").isValid).toBe(false);
    expect(validateTaskName("A".repeat(41)).isValid).toBe(false);
  });

  it("should correctly compute binary tree heap indexes", () => {
    expect(getParentIndex(1)).toBe(0);
    expect(getParentIndex(2)).toBe(0);
    expect(getParentIndex(3)).toBe(1);
    expect(getParentIndex(4)).toBe(1);
    expect(getParentIndex(5)).toBe(2);
    expect(getParentIndex(6)).toBe(2);

    expect(getLeftChildIndex(0)).toBe(1);
    expect(getRightChildIndex(0)).toBe(2);
    expect(getLeftChildIndex(1)).toBe(3);
    expect(getRightChildIndex(1)).toBe(4);
  });

  it("should generate deterministic IDs", () => {
    expect(generateHeapElementId(10)).toContain("heap-node-10");
    expect(generatePQElementId("Task", 1)).toContain("pq-task-1");
  });

  it("should create valid empty and sample heap states", () => {
    const emptyMin = createEmptyHeapState("min");
    expect(emptyMin.items.length).toBe(0);
    expect(isValidHeap(emptyMin)).toBe(true);
    expect(calculateHeapHeight(emptyMin)).toBe(-1);

    const sampleMin = createSampleHeapState("min");
    expect(sampleMin.items.length).toBe(7);
    expect(isValidHeap(sampleMin)).toBe(true);
    expect(calculateHeapHeight(sampleMin)).toBe(2);

    const sampleMax = createSampleHeapState("max");
    expect(sampleMax.items.length).toBe(7);
    expect(isValidHeap(sampleMax)).toBe(true);

    const stats = getHeapStatistics(sampleMin);
    expect(stats.size).toBe(7);
    expect(stats.height).toBe(2);
    expect(stats.min).toBe(10);
    expect(stats.isComplete).toBe(true);
  });

  it("should create and validate Priority Queue states", () => {
    const samplePQ = createSamplePriorityQueueState("min");
    expect(samplePQ.items.length).toBe(5);
    expect(isValidPriorityQueue(samplePQ)).toBe(true);

    const stats = getPriorityQueueStatistics(samplePQ);
    expect(stats.size).toBe(5);
    expect(stats.highestPriorityTask).toBeDefined();
  });
});
