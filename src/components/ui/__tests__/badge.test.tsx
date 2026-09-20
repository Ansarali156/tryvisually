import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "../badge";

describe("Badge Component", () => {
  it("renders text content correctly", () => {
    render(<Badge>Beginner</Badge>);
    expect(screen.getByText("Beginner")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    const { container } = render(<Badge variant="success">Passed</Badge>);
    expect(container.firstChild).toHaveClass("text-emerald-700");
  });
});
