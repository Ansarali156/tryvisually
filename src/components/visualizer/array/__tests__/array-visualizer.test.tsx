import { describe, it, expect, beforeEach } from "vitest";
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArrayVisualizerShell } from "../array-visualizer-shell";
import { resetElementIdCounter } from "@/core/array/validation";

describe("ArrayVisualizerShell Component", () => {
  beforeEach(() => {
    resetElementIdCounter(1);
  });

  it("renders array visualizer workspace with initial elements, timeline controls, code and variables", () => {
    render(<ArrayVisualizerShell initialValues={[10, 20, 30]} />);

    // 1. Header and title
    expect(screen.getByText("Array Visualizer")).toBeDefined();
    expect(screen.getByText("Explore how arrays store and manipulate elements.")).toBeDefined();

    // 2. Initial elements and indexes rendered
    expect(screen.getByText("10")).toBeDefined();
    expect(screen.getByText("20")).toBeDefined();
    expect(screen.getByText("30")).toBeDefined();

    // 3. Timeline controls
    expect(screen.getByRole("button", { name: /play/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /next/i })).toBeDefined();

    // 4. Panels
    expect(screen.getByText("Synchronized Implementation")).toBeDefined();
    expect(screen.getByText("Runtime Variables")).toBeDefined();
    expect(screen.getByText("Step Explanation")).toBeDefined();
  });

  it("switches operation and updates controls and complexity", () => {
    render(<ArrayVisualizerShell initialValues={[10, 20, 30]} />);

    // Click "Linear Search" operation button
    const searchOpBtn = screen.getByRole("button", { name: /linear search/i });
    fireEvent.click(searchOpBtn);

    // Target Value input should appear
    expect(screen.getByText("Target Value:")).toBeDefined();
    expect(screen.getByText(/Linear Search Complexity/i)).toBeDefined();
  });

  it("advances execution step when Next button is clicked", () => {
    render(<ArrayVisualizerShell initialValues={[20, 10]} />);

    expect(screen.getByText(/Step 1 of/i)).toBeDefined();

    const nextBtn = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Step 2 of/i)).toBeDefined();
  });

  it("allows entering a valid custom array and re-renders elements", () => {
    render(<ArrayVisualizerShell initialValues={[1, 2, 3]} />);

    const input = screen.getByPlaceholderText(/Custom array/i);
    fireEvent.change(input, { target: { value: "50, 60, 70" } });

    const loadBtn = screen.getByRole("button", { name: /load array/i });
    fireEvent.click(loadBtn);

    expect(screen.getByText("50")).toBeDefined();
    expect(screen.getByText("60")).toBeDefined();
    expect(screen.getByText("70")).toBeDefined();
  });

  it("displays a clear error when invalid custom array is submitted", () => {
    render(<ArrayVisualizerShell initialValues={[1, 2, 3]} />);

    const input = screen.getByPlaceholderText(/Custom array/i);
    fireEvent.change(input, { target: { value: "10, abc, 30" } });

    const loadBtn = screen.getByRole("button", { name: /load array/i });
    fireEvent.click(loadBtn);

    expect(screen.getByText(/Invalid value "abc"/i)).toBeDefined();
  });
});
