import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ExecutionEngineDemo } from "../execution-engine-demo";

describe("Visualizer - ExecutionEngineDemo Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders runtime status, stable element tokens, active variables, and controls", () => {
    render(<ExecutionEngineDemo />);

    expect(
      screen.getByText("Core Execution Engine Runtime")
    ).toBeInTheDocument();
    expect(screen.getByText(/status: idle/i)).toBeInTheDocument();
    expect(screen.getByText("Step 1 / 4")).toBeInTheDocument();

    // Check stable IDs
    expect(screen.getByText("elem-0")).toBeInTheDocument();
    expect(screen.getByText("elem-1")).toBeInTheDocument();

    // Check active variables
    expect(screen.getByText("Active Variables")).toBeInTheDocument();
    expect(screen.getByText("accumulator")).toBeInTheDocument();

    // Check buttons
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("interacts with Next and advances step index", () => {
    render(<ExecutionEngineDemo />);

    const nextBtn = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText("Step 2 / 4")).toBeInTheDocument();
    expect(screen.getByText("update")).toBeInTheDocument();
  });
});
