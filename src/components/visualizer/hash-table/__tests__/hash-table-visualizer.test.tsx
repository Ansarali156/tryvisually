import { describe, it, expect } from "vitest";
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HashTableVisualizerShell } from "../hash-table-visualizer-shell";

describe("HashTableVisualizerShell Component", () => {
  it("renders hash table visualizer workspace with initial elements, timeline, code, and panels", () => {
    render(<HashTableVisualizerShell />);

    // Header and title
    expect(screen.getByText("Hash Table Visualizer")).toBeInTheDocument();

    // Default chained entries rendered
    expect(screen.getByText(/Carol:/i)).toBeInTheDocument();
    expect(screen.getByText(/Dave:/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice:/i)).toBeInTheDocument();

    // Strategy buttons
    expect(screen.getByRole("button", { name: "Separate Chaining" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Linear Probing" })).toBeInTheDocument();

    // Timeline controls
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/step forward/i)).toBeInTheDocument();

    // Operations dock
    expect(screen.getByRole("button", { name: "Insert" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("switches strategy to Linear Probing and displays slot track with status pills", () => {
    render(<HashTableVisualizerShell />);

    const linearBtn = screen.getByRole("button", { name: "Linear Probing" });
    fireEvent.click(linearBtn);

    // Should now render open addressing slot badges
    expect(screen.getAllByText("OCCUPIED").length).toBeGreaterThan(0);
    expect(screen.getAllByText("EMPTY").length).toBeGreaterThan(0);
  });

  it("switches operation to Search and displays search popover", () => {
    render(<HashTableVisualizerShell />);

    const searchBtn = screen.getByRole("button", { name: "Search" });
    fireEvent.click(searchBtn);

    expect(screen.getByPlaceholderText(/e\.g\. alice/i)).toBeInTheDocument();
  });

  it("advances execution step when Step forward button is clicked", () => {
    render(<HashTableVisualizerShell />);

    expect(screen.getByLabelText("Timeline scrubber")).toHaveValue("0");

    const nextBtn = screen.getByLabelText(/step forward/i);
    fireEvent.click(nextBtn);

    expect(screen.getByLabelText("Timeline scrubber")).toHaveValue("1");
  });
});
