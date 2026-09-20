import { describe, it, expect } from "vitest";
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { VisualizerPlaceholder } from "../visualizer-placeholder";
import { VisualizerNotFound } from "../visualizer-not-found";
import { getContentBySlug } from "@/config/content-registry";

describe("Visualizer Dynamic Routing Components", () => {
  it("renders accurate educational placeholder for Arrays without Binary Search fallback", () => {
    const arraysContent = getContentBySlug("arrays")!;
    expect(arraysContent).toBeDefined();

    render(<VisualizerPlaceholder content={arraysContent} />);

    expect(screen.getAllByText(/Arrays/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Coming Soon")).toBeDefined();
    expect(screen.getByText(arraysContent.description)).toBeDefined();
    expect(screen.queryByText(/function binarySearch/i)).toBeNull();
  });

  it("renders accurate educational placeholder for Stack without Binary Search fallback", () => {
    const stackContent = getContentBySlug("stack")!;
    expect(stackContent).toBeDefined();

    render(<VisualizerPlaceholder content={stackContent} />);

    expect(screen.getAllByText(/Stacks/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Linear container with push and pop/i)).toBeDefined();
    expect(screen.queryByText(/function binarySearch/i)).toBeNull();
  });

  it("renders accurate educational placeholder for BFS without Binary Search fallback", () => {
    const bfsContent = getContentBySlug("bfs")!;
    expect(bfsContent).toBeDefined();

    render(<VisualizerPlaceholder content={bfsContent} />);

    expect(screen.getAllByText(/Breadth-First Search/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/function binarySearch/i)).toBeNull();
  });

  it("renders 404 VisualizerNotFound for unknown slugs without falling back to Binary Search", () => {
    render(<VisualizerNotFound slug="quantum-sort" />);

    expect(screen.getByText("Visualizer Not Found")).toBeDefined();
    expect(screen.getByText(/quantum-sort/)).toBeDefined();
    expect(screen.queryByText(/function binarySearch/i)).toBeNull();
  });
});
