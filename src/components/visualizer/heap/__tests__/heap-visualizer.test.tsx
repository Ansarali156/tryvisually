import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  HeapVisualizerShell,
  MinHeapVisualizerShell,
  MaxHeapVisualizerShell,
} from "../heap-visualizer-shell";
import { PriorityQueueVisualizerShell } from "../priority-queue-visualizer-shell";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("Heap & Priority Queue Visualizer Components", () => {
  it("should render Min Heap Visualizer Shell with operations and metrics", () => {
    render(<MinHeapVisualizerShell />);

    // Check Header & Badges
    expect(screen.getByText(/Binary Heap Visualizer/i)).toBeInTheDocument();
    expect(screen.getByText(/Complete Tree/i)).toBeInTheDocument();

    // Check Operations
    expect(screen.getByRole("button", { name: /Extract Root/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Peek Root/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Heapify/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Build Heap/i })).toBeInTheDocument();

    // Check Synchronized Array View
    expect(screen.getByText(/Synchronized Array Representation/i)).toBeInTheDocument();

    // Check Complexity Card
    expect(screen.getByText(/Time & Space Complexity/i)).toBeInTheDocument();
  });

  it("should switch between Min Heap and Max Heap modes", () => {
    render(<HeapVisualizerShell initialHeapType="min" />);

    const maxHeapBtn = screen.getByRole("button", { name: "Max Heap" });
    fireEvent.click(maxHeapBtn);

    expect(screen.getAllByText(/MAX HEAP/i).length).toBeGreaterThan(0);
  });

  it("should render Priority Queue Visualizer Shell with operations", () => {
    render(<PriorityQueueVisualizerShell />);

    expect(screen.getByText(/Priority Queue Visualizer/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enqueue Task/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Dequeue Highest Priority/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Peek Top/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Check Size/i })).toBeInTheDocument();
  });
});
