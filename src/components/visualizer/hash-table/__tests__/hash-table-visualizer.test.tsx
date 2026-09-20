import { describe, it, expect } from "vitest";
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HashTableVisualizerShell } from "../hash-table-visualizer-shell";

describe("HashTableVisualizerShell Component", () => {
  it("renders hash table visualizer workspace with initial elements, timeline, code, and panels", () => {
    render(<HashTableVisualizerShell />);

    // Header and title
    expect(screen.getByText("Hash Table Visualizer")).toBeDefined();
    expect(
      screen.getByText(
        "Observe key hashing, bucket indexing, collisions, and open-addressing tombstones."
      )
    ).toBeDefined();

    // Default chained entries rendered
    expect(screen.getByText(/Carol:/i)).toBeDefined();
    expect(screen.getByText(/Dave:/i)).toBeDefined();
    expect(screen.getByText(/Alice:/i)).toBeDefined();

    // Strategy buttons
    expect(screen.getByRole("button", { name: "Separate Chaining" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Linear Probing" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Quadratic Probing" })).toBeDefined();

    // Timeline controls
    expect(screen.getByRole("button", { name: /play/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /next/i })).toBeDefined();

    // Panels
    expect(screen.getByText("Synchronized Implementation")).toBeDefined();
    expect(screen.getByText("Runtime Variables")).toBeDefined();
    expect(screen.getByText("Step Explanation")).toBeDefined();
  });

  it("switches strategy to Linear Probing and displays slot track with status pills", () => {
    render(<HashTableVisualizerShell />);

    const linearBtn = screen.getByRole("button", { name: "Linear Probing" });
    fireEvent.click(linearBtn);

    // Should now render open addressing slot badges
    expect(screen.getAllByText("OCCUPIED").length).toBeGreaterThan(0);
    expect(screen.getAllByText("EMPTY").length).toBeGreaterThan(0);
  });

  it("switches operation to Search and updates complexity card", () => {
    render(<HashTableVisualizerShell />);

    const searchBtn = screen.getByRole("button", { name: "Search" });
    fireEvent.click(searchBtn);

    expect(screen.getByText("Search (key)")).toBeDefined();
  });

  it("advances execution step when Next button is clicked", () => {
    render(<HashTableVisualizerShell />);

    expect(screen.getByText(/Step 1 of/i)).toBeDefined();

    const nextBtn = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Step 2 of/i)).toBeDefined();
  });

  it("displays validation error when invalid key is submitted", () => {
    render(<HashTableVisualizerShell />);

    const keyInput = screen.getByLabelText(/Key:/i);
    fireEvent.change(keyInput, { target: { value: "   " } });

    const submitBtn = screen.getByRole("button", { name: /Execute insert/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Key cannot be empty or only spaces/i)).toBeDefined();
  });
});
