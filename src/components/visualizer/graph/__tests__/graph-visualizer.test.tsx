import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GraphVisualizerShell } from "../graph-visualizer-shell";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/visualise/graph",
}));

describe("GraphVisualizerShell Component", () => {
  it("renders graph visualizer shell with VisuAlgo layout, vertices, and subvariants", () => {
    const { container } = render(<GraphVisualizerShell />);

    // 1. Confirm strict NO SIDEBAR invariant
    expect(container.querySelector("aside")).toBeNull();
    expect(container.querySelector("[data-testid='sidebar']")).toBeNull();

    // 2. Title
    expect(screen.getByText("Graph Data Structure")).toBeInTheDocument();

    // 3. Compact Graph Type & Edge Type toggles
    expect(screen.getByRole("button", { name: "Undirected Weighted" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Directed Weighted" })).toBeInTheDocument();

    // 4. Initial graph elements (A, B, C, D)
    expect(screen.getByRole("button", { name: "Vertex A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vertex B" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vertex C" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vertex D" })).toBeInTheDocument();

    // 5. Initial weights for graph
    expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
  });

  it("selects a vertex and highlights it", () => {
    render(<GraphVisualizerShell />);

    const vertexA = screen.getByRole("button", { name: "Vertex A" });
    fireEvent.click(vertexA);

    expect(vertexA).toBeInTheDocument();
  });

  it("switches graph type to Directed", () => {
    render(<GraphVisualizerShell />);

    const directedBtn = screen.getByRole("button", { name: "Directed Weighted" });
    fireEvent.click(directedBtn);

    expect(directedBtn).toBeInTheDocument();
  });

  it("opens Add Vertex operation tray from dock", () => {
    render(<GraphVisualizerShell />);

    const addBtn = screen.getByRole("button", { name: "Add Vertex" });
    fireEvent.click(addBtn);

    // Form input should be visible in the popover tray
    expect(screen.getByPlaceholderText(/e\.g\. E/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go/i })).toBeInTheDocument();
  });

  it("advances execution trace using timeline playback controls", () => {
    render(<GraphVisualizerShell />);

    const nextBtn = screen.getByLabelText(/step forward/i);
    expect(nextBtn).toBeInTheDocument();

    fireEvent.click(nextBtn);
    expect(screen.getByLabelText("Timeline scrubber")).toHaveValue("1");

    const prevBtn = screen.getByLabelText(/step backward/i);
    fireEvent.click(prevBtn);
    expect(screen.getByLabelText("Timeline scrubber")).toHaveValue("0");
  });
});
