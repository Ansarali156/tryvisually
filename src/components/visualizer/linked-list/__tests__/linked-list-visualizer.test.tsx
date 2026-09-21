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
    expect(screen.getByText("Linked List Visualizer")).toBeInTheDocument();

    // 2. Initial node elements rendered
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();

    // 3. Node pointers
    expect(screen.getByText("HEAD")).toBeInTheDocument();
    expect(screen.getByText("TAIL")).toBeInTheDocument();

    // 4. Timeline controls
    expect(screen.getByRole("button", { name: /^play execution$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/step forward/i)).toBeInTheDocument();

    // 5. Operations dock
    expect(screen.getByRole("button", { name: "Insert" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("switches variant to Doubly and Circular linked lists", () => {
    render(<LinkedListVisualizerShell initialValues={[10, 20, 30]} />);

    // Click "Doubly Linked List" variant tab
    const doublyBtn = screen.getByRole("button", { name: "Doubly Linked List" });
    fireEvent.click(doublyBtn);
    expect(doublyBtn).toBeInTheDocument();

    // Click "Circular Linked List" variant tab
    const circularBtn = screen.getByRole("button", { name: "Circular Linked List" });
    fireEvent.click(circularBtn);
    expect(circularBtn).toBeInTheDocument();
  });

  it("switches operation to Search and updates parameter input", () => {
    render(<LinkedListVisualizerShell initialValues={[10, 20, 30]} />);

    // Click "Search" operation button
    const searchOpBtn = screen.getByRole("button", { name: "Search" });
    fireEvent.click(searchOpBtn);

    // Search Target input should appear
    expect(screen.getByPlaceholderText(/e\.g\. 20/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go/i })).toBeInTheDocument();
  });

  it("advances execution step when Step forward button is clicked", () => {
    render(<LinkedListVisualizerShell initialValues={[10, 20]} />);

    expect(screen.getByLabelText("Timeline scrubber")).toHaveValue("0");

    const nextBtn = screen.getByLabelText(/step forward/i);
    fireEvent.click(nextBtn);

    expect(screen.getByLabelText("Timeline scrubber")).toHaveValue("1");
  });

  it("allows entering a valid custom linked list and re-renders elements", () => {
    render(<LinkedListVisualizerShell initialValues={[1, 2, 3]} />);

    const setListBtn = screen.getByRole("button", { name: "Create" });
    fireEvent.click(setListBtn);

    const input = screen.getByPlaceholderText(/e\.g\. 10, 20, 30, 40/i);
    fireEvent.change(input, { target: { value: "50, 60, 70" } });

    const goBtn = screen.getByRole("button", { name: /go/i });
    fireEvent.click(goBtn);

    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("70")).toBeInTheDocument();
  });
});
