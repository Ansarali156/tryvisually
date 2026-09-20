import { describe, it, expect, beforeEach } from "vitest";
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LinkedListVisualizerShell } from "../linked-list-visualizer-shell";
import { resetNodeIdCounter } from "@/core/linked-list/validation";

describe("LinkedListVisualizerShell Component", () => {
  beforeEach(() => {
    resetNodeIdCounter(1);
  });

  it("renders linked list visualizer workspace with initial nodes, pointers, timeline, code and variables", () => {
    render(<LinkedListVisualizerShell initialValues={[10, 20, 30]} />);

    // 1. Header and title
    expect(screen.getByText("Linked List Visualizer")).toBeDefined();
    expect(
      screen.getByText("Step through dynamic pointer manipulations across Singly, Doubly, and Circular lists.")
    ).toBeDefined();

    // 2. Initial node elements rendered
    expect(screen.getByText("10")).toBeDefined();
    expect(screen.getByText("20")).toBeDefined();
    expect(screen.getByText("30")).toBeDefined();

    // 3. Node pointers and null terminator
    expect(screen.getByText("HEAD")).toBeDefined();
    expect(screen.getByText("TAIL")).toBeDefined();
    expect(screen.getByText("NULL")).toBeDefined();

    // 4. Timeline controls
    expect(screen.getByRole("button", { name: /play/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /next/i })).toBeDefined();

    // 5. Panels
    expect(screen.getByText("Synchronized Implementation")).toBeDefined();
    expect(screen.getByText("Runtime Variables")).toBeDefined();
    expect(screen.getByText("Step Explanation")).toBeDefined();
  });

  it("switches variant to Doubly and Circular linked lists", () => {
    render(<LinkedListVisualizerShell initialValues={[10, 20, 30]} />);

    // Click "Doubly Linked" variant tab
    const doublyBtn = screen.getByRole("button", { name: /doubly linked/i });
    fireEvent.click(doublyBtn);

    expect(screen.getByText(/Doubly Variant Characteristics/i)).toBeDefined();

    // Click "Circular Linked" variant tab
    const circularBtn = screen.getByRole("button", { name: /circular linked/i });
    fireEvent.click(circularBtn);

    expect(screen.getByText(/Circular Variant Characteristics/i)).toBeDefined();
    // Circular loopback indicator should be visible
    expect(screen.getByText(/TAIL.next → HEAD/i)).toBeDefined();
  });

  it("switches operation to Search and updates parameter input and complexity", () => {
    render(<LinkedListVisualizerShell initialValues={[10, 20, 30]} />);

    // Click "Search" operation button
    const searchOpBtn = screen.getByRole("button", { name: "Search" });
    fireEvent.click(searchOpBtn);

    // Search Target input should appear
    expect(screen.getByText("Search Target:")).toBeDefined();
    expect(screen.getByText(/Search Complexity/i)).toBeDefined();
  });

  it("advances execution step when Next button is clicked", () => {
    render(<LinkedListVisualizerShell initialValues={[10, 20]} />);

    expect(screen.getByText(/Step 1 of/i)).toBeDefined();

    const nextBtn = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Step 2 of/i)).toBeDefined();
  });

  it("allows entering a valid custom linked list and re-renders elements", () => {
    render(<LinkedListVisualizerShell initialValues={[1, 2, 3]} />);

    const input = screen.getByPlaceholderText(/Custom list/i);
    fireEvent.change(input, { target: { value: "50, 60, 70" } });

    const loadBtn = screen.getByRole("button", { name: /load list/i });
    fireEvent.click(loadBtn);

    expect(screen.getByText("50")).toBeDefined();
    expect(screen.getByText("60")).toBeDefined();
    expect(screen.getByText("70")).toBeDefined();
  });

  it("displays a clear error when invalid custom list is submitted", () => {
    render(<LinkedListVisualizerShell initialValues={[1, 2, 3]} />);

    const input = screen.getByPlaceholderText(/Custom list/i);
    fireEvent.change(input, { target: { value: "10, abc, 30" } });

    const loadBtn = screen.getByRole("button", { name: /load list/i });
    fireEvent.click(loadBtn);

    expect(screen.getByText(/Invalid value "abc"/i)).toBeDefined();
  });
});
