import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  TreeVisualizerShell,
  BinaryTreeVisualizerShell,
  BstVisualizerShell,
} from "../tree-visualizer-shell";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("Tree Visualizer Components", () => {
  it("should render BST Visualizer Shell with operations", () => {
    render(<BstVisualizerShell />);

    // Check Header
    expect(screen.getByText("Binary Search Tree")).toBeInTheDocument();

    // Check Operations
    expect(screen.getByRole("button", { name: "Insert" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Traverse" })).toBeInTheDocument();
  });

  it("should render General Binary Tree Visualizer Shell", () => {
    render(<BinaryTreeVisualizerShell />);

    expect(screen.getByText("Binary Tree Visualizer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Insert" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
  });

  it("should switch mode when mode toggle is clicked", () => {
    render(<TreeVisualizerShell initialMode="bst" />);

    const binaryTreeBtn = screen.getByRole("button", { name: "General Binary Tree" });
    fireEvent.click(binaryTreeBtn);

    expect(screen.getByRole("button", { name: "Insert" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
  });
});
