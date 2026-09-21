import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  HeapVisualizerShell,
  MinHeapVisualizerShell,
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
    expect(screen.getByText("Binary Heap Visualizer")).toBeInTheDocument();

    // Check Operations
    expect(screen.getByRole("button", { name: "Insert" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Extract-Min" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Peek Root" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Build Heap" })).toBeInTheDocument();
  });

  it("should switch between Min Heap and Max Heap modes", () => {
    render(<HeapVisualizerShell initialHeapType="min" />);

    const maxHeapBtn = screen.getByRole("button", { name: "Max-Heap" });
    fireEvent.click(maxHeapBtn);

    expect(screen.getByRole("button", { name: "Extract-Max" })).toBeInTheDocument();
  });

  it("should render Priority Queue Visualizer Shell with operations", () => {
    render(<PriorityQueueVisualizerShell />);

    expect(screen.getByText("Priority Queue Visualizer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enqueue" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dequeue" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Peek" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset Sample" })).toBeInTheDocument();
  });
});
