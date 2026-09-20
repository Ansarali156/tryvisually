import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Sidebar } from "../sidebar";

describe("Layout - Sidebar Component", () => {
  it("renders Learning Index and categorized sections", () => {
    render(<Sidebar />);

    expect(screen.getByText("Learning Index")).toBeInTheDocument();
    expect(screen.getByText("LEARN")).toBeInTheDocument();
    expect(screen.getByText("ALGORITHMS")).toBeInTheDocument();
    expect(screen.getByText("ADVANCED")).toBeInTheDocument();
    expect(screen.getByText("Arrays")).toBeInTheDocument();
    expect(screen.getByText("Binary Search")).toBeInTheDocument();
  });

  it("calls onToggleCollapse when collapse button is clicked", () => {
    const handleToggle = vi.fn();
    render(<Sidebar isCollapsed={false} onToggleCollapse={handleToggle} />);

    const collapseBtn = screen.getByRole("button", {
      name: /collapse sidebar/i,
    });
    fireEvent.click(collapseBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("toggles sub-group expansion when category header is clicked", () => {
    render(<Sidebar />);

    // Click on "Searching" group header to collapse/expand
    const searchingBtn = screen.getByRole("button", { name: /searching/i });
    expect(screen.getByText("Linear Search")).toBeInTheDocument();

    fireEvent.click(searchingBtn);
    expect(screen.queryByText("Linear Search")).not.toBeInTheDocument();

    fireEvent.click(searchingBtn);
    expect(screen.getByText("Linear Search")).toBeInTheDocument();
  });
});
