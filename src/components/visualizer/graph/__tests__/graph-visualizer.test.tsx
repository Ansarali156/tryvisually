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
  it("renders graph visualizer shell with NO SIDEBAR, header, educational intro, and metric badges", () => {
    const { container } = render(<GraphVisualizerShell />);

    // 1. Confirm strict NO SIDEBAR invariant
    expect(container.querySelector("aside")).toBeNull();
    expect(container.querySelector("[data-testid='sidebar']")).toBeNull();

    // 2. Educational Introduction
    expect(screen.getByText("Graph Visualizer")).toBeInTheDocument();
    expect(
      screen.getByText(/A graph consists of/i)
    ).toBeInTheDocument();

    // 3. Compact Graph Type & Edge Type toggles
    expect(screen.getByRole("button", { name: /^Undirected$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Directed$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Unweighted$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Weighted$/i })).toBeInTheDocument();

    // 4. Initial acceptance graph elements (A, B, C, D)
    expect(screen.getByRole("button", { name: "Vertex A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vertex B" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vertex C" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vertex D" })).toBeInTheDocument();

    // 5. Initial weights for acceptance graph: 5, 2, 3, 4
    expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("4").length).toBeGreaterThanOrEqual(1);
  });

  it("switches representation between Visualization, Adjacency List, and Adjacency Matrix", () => {
    render(<GraphVisualizerShell />);

    // Switch to Adjacency List
    const adjListBtn = screen.getByRole("button", { name: /Adjacency List/i });
    fireEvent.click(adjListBtn);

    expect(
      screen.getByText("Derived Adjacency List Representation")
    ).toBeInTheDocument();

    // Switch to Adjacency Matrix
    const adjMatrixBtn = screen.getByRole("button", { name: /Adjacency Matrix/i });
    fireEvent.click(adjMatrixBtn);

    expect(
      screen.getByText("Derived Adjacency Matrix Representation")
    ).toBeInTheDocument();

    // Switch back to Visualization
    const vizBtn = screen.getByRole("button", { name: /Visualization/i });
    fireEvent.click(vizBtn);

    expect(screen.getByRole("button", { name: "Vertex A" })).toBeInTheDocument();
  });

  it("selects a vertex and displays degree in inspection card", () => {
    render(<GraphVisualizerShell />);

    const vertexA = screen.getByRole("button", { name: "Vertex A" });
    fireEvent.click(vertexA);

    expect(screen.getByText("Vertex A")).toBeInTheDocument();
    expect(screen.getAllByText(/Degree:/i).length).toBeGreaterThanOrEqual(1);
  });

  it("switches graph type to Directed and updates representation", () => {
    render(<GraphVisualizerShell />);

    const directedBtn = screen.getByRole("button", { name: /^Directed$/i });
    fireEvent.click(directedBtn);

    // Should now indicate Directed in badge
    const directedBadges = screen.getAllByText("Directed");
    expect(directedBadges.length).toBeGreaterThan(0);
  });

  it("adds a new vertex using Add Vertex operation", () => {
    render(<GraphVisualizerShell />);

    const addBtns = screen.getAllByRole("button", { name: /Add Vertex/i });
    // First button is the tab, second is the form submit button
    const submitBtn = addBtns[addBtns.length - 1];
    fireEvent.click(submitBtn);

    // Step through execution trace
    const nextBtn = screen.getByLabelText(/next step/i);
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);

    // Vertex E should now be on the canvas
    expect(screen.getByRole("button", { name: "Vertex E" })).toBeInTheDocument();
  });

  it("displays a clear error when attempting to add duplicate vertex", () => {
    render(<GraphVisualizerShell />);

    // Change input to A (which already exists)
    const input = screen.getByPlaceholderText("e.g. A");
    fireEvent.change(input, { target: { value: "A" } });

    const addBtns = screen.getAllByRole("button", { name: /Add Vertex/i });
    const submitBtn = addBtns[addBtns.length - 1];
    fireEvent.click(submitBtn);

    // Clear error message displayed
    expect(screen.getByText(/Vertex "A" already exists/i)).toBeInTheDocument();
  });

  it("advances execution trace using timeline playback controls", () => {
    render(<GraphVisualizerShell />);

    const nextBtn = screen.getByLabelText(/next step/i);
    expect(nextBtn).toBeInTheDocument();

    fireEvent.click(nextBtn);
    expect(screen.getByText(/Step 2\//i)).toBeInTheDocument();

    const prevBtn = screen.getByLabelText(/previous step/i);
    fireEvent.click(prevBtn);
    expect(screen.getByText(/Step 1\//i)).toBeInTheDocument();
  });
});
