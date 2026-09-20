import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Header } from "../header";

describe("Layout - Header Component (TRY VISUALLY)", () => {
  it("renders TRY VISUALLY brand and primary navigation with collapse/expand toggle", () => {
    render(<Header />);

    expect(screen.getByText(/TRY/i)).toBeInTheDocument();
    expect(screen.getByText(/VISUALLY/i)).toBeInTheDocument();

    // By default, full navigation is shown uncompressed across all features
    expect(screen.getByText("Visualise & Learn")).toBeInTheDocument();
    expect(screen.getByText("Trace Written Code")).toBeInTheDocument();
    expect(screen.getByText("Learn DSA Theory")).toBeInTheDocument();

    // Clicking collapse trigger hides the full navigation into the compact active pill
    const collapseBtn = screen.getByTitle(/hide navigation options/i);
    fireEvent.click(collapseBtn);
    expect(screen.queryByText("Trace Written Code")).not.toBeInTheDocument();

    // Clicking expand trigger reveals all 3 options again
    const expandBtn = screen.getByTitle(/show all navigation options/i);
    fireEvent.click(expandBtn);
    expect(screen.getByText("Trace Written Code")).toBeInTheDocument();
  });

  it("toggles dark theme when theme button is clicked", () => {
    render(<Header />);

    const themeBtn = screen.getByLabelText(/toggle theme/i);
    expect(themeBtn).toBeInTheDocument();
    fireEvent.click(themeBtn);
    // documentElement class should toggle
  });

  it("opens global search modal when Ctrl+K shortcut is triggered", () => {
    render(<Header />);

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });

    expect(
      screen.getByPlaceholderText(/search data structures, algorithms, lessons, problems.../i)
    ).toBeInTheDocument();
  });
});
