import { describe, it, expect } from "vitest";
import {
  HIGHLIGHT_PRIORITIES,
  getHighlightPriority,
  resolveElementHighlight,
  resolveHighlightsByElement,
  operationToHighlightType,
  deriveStepHighlights,
} from "../utils/highlight-priority";
import type { VisualizationHighlight } from "../types";
import type { ExecutionStep } from "@/core/execution/types";

describe("Highlight Priority System", () => {
  it("should have correct hierarchical priority ordering", () => {
    expect(HIGHLIGHT_PRIORITIES.current).toBeGreaterThan(HIGHLIGHT_PRIORITIES.found);
    expect(HIGHLIGHT_PRIORITIES.found).toBeGreaterThan(HIGHLIGHT_PRIORITIES.selected);
    expect(HIGHLIGHT_PRIORITIES.selected).toBeGreaterThan(HIGHLIGHT_PRIORITIES.active);
    expect(HIGHLIGHT_PRIORITIES.active).toBeGreaterThan(HIGHLIGHT_PRIORITIES.compare);
    expect(HIGHLIGHT_PRIORITIES.compare).toBeGreaterThan(HIGHLIGHT_PRIORITIES.swapped);
    expect(HIGHLIGHT_PRIORITIES.swapped).toBeGreaterThan(HIGHLIGHT_PRIORITIES.inserted);
    expect(HIGHLIGHT_PRIORITIES.inserted).toBeGreaterThan(HIGHLIGHT_PRIORITIES.deleted);
    expect(HIGHLIGHT_PRIORITIES.deleted).toBeGreaterThan(HIGHLIGHT_PRIORITIES.path);
    expect(HIGHLIGHT_PRIORITIES.path).toBeGreaterThan(HIGHLIGHT_PRIORITIES.visited);
    expect(HIGHLIGHT_PRIORITIES.visited).toBeGreaterThan(HIGHLIGHT_PRIORITIES.warning);
    expect(HIGHLIGHT_PRIORITIES.warning).toBeGreaterThan(HIGHLIGHT_PRIORITIES.custom);
  });

  it("should return custom priority override when specified", () => {
    const defaultHl: VisualizationHighlight = { elementId: "node-1", type: "visited" };
    expect(getHighlightPriority(defaultHl)).toBe(20);

    const customHl: VisualizationHighlight = { elementId: "node-1", type: "visited", priority: 999 };
    expect(getHighlightPriority(customHl)).toBe(999);
  });

  it("should resolve single highlight correctly", () => {
    const hl: VisualizationHighlight = { elementId: "node-1", type: "compare" };
    expect(resolveElementHighlight([hl])).toEqual(hl);
  });

  it("should return null when resolving empty highlights", () => {
    expect(resolveElementHighlight([])).toBeNull();
  });

  it("should resolve conflict between visited and current in favor of current", () => {
    const visitedHl: VisualizationHighlight = { elementId: "node-1", type: "visited" };
    const currentHl: VisualizationHighlight = { elementId: "node-1", type: "current" };

    const resolved = resolveElementHighlight([visitedHl, currentHl]);
    expect(resolved).toEqual(currentHl);
  });

  it("should resolve conflict between compare and found in favor of found", () => {
    const compareHl: VisualizationHighlight = { elementId: "node-2", type: "compare" };
    const foundHl: VisualizationHighlight = { elementId: "node-2", type: "found" };

    const resolved = resolveElementHighlight([compareHl, foundHl]);
    expect(resolved).toEqual(foundHl);
  });

  it("should resolve multi-element highlights correctly", () => {
    const highlights: VisualizationHighlight[] = [
      { elementId: "elem-1", type: "visited" },
      { elementId: "elem-2", type: "visited" },
      { elementId: "elem-2", type: "compare" },
      { elementId: "elem-3", type: "current" },
    ];

    const resolvedMap = resolveHighlightsByElement(highlights);
    expect(resolvedMap.size).toBe(3);
    expect(resolvedMap.get("elem-1")?.type).toBe("visited");
    expect(resolvedMap.get("elem-2")?.type).toBe("compare"); // compare > visited
    expect(resolvedMap.get("elem-3")?.type).toBe("current");
  });

  it("should map execution operations to appropriate highlight types", () => {
    expect(operationToHighlightType("compare")).toBe("compare");
    expect(operationToHighlightType("swap")).toBe("swapped");
    expect(operationToHighlightType("insert")).toBe("inserted");
    expect(operationToHighlightType("push")).toBe("inserted");
    expect(operationToHighlightType("delete")).toBe("deleted");
    expect(operationToHighlightType("pop")).toBe("deleted");
    expect(operationToHighlightType("visit")).toBe("visited");
    expect(operationToHighlightType("found")).toBe("found");
    expect(operationToHighlightType("select")).toBe("selected");
    expect(operationToHighlightType("call")).toBe("active");
  });

  it("should derive step highlights from an ExecutionStep", () => {
    const step: ExecutionStep = {
      id: 0,
      operation: "swap",
      variables: {},
      state: {},
      highlightedElements: ["item-0", "item-1"],
      explanation: "Swap items 0 and 1",
    };

    const derived = deriveStepHighlights(step);
    expect(derived).toHaveLength(2);
    expect(derived[0]).toEqual({ elementId: "item-0", type: "swapped" });
    expect(derived[1]).toEqual({ elementId: "item-1", type: "swapped" });
  });
});
