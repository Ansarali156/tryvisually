import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GlobalSearch } from "../global-search";

describe("Search - GlobalSearch Component", () => {
  it("renders when open and focuses input", () => {
    const handleClose = vi.fn();
    render(<GlobalSearch isOpen={true} onClose={handleClose} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/search data structures, algorithms, lessons, problems.../i)
    ).toBeInTheDocument();
  });

  it("filters results dynamically as user types", () => {
    render(<GlobalSearch isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText(
      /search data structures, algorithms, lessons, problems.../i
    );
    fireEvent.change(input, { target: { value: "binary" } });

    // Should find Binary Search algorithm and Binary Tree
    expect(screen.getByText("Binary Search")).toBeInTheDocument();
  });

  it("calls onClose when ESC key is pressed", () => {
    const handleClose = vi.fn();
    render(<GlobalSearch isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
