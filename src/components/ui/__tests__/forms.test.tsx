import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  Input,
  Select,
  SearchInput,
  Checkbox,
  Radio,
  Textarea,
} from "../forms";

describe("Component Library - Forms", () => {
  it("renders Input with label and handles text changes", () => {
    const handleChange = vi.fn();
    render(<Input label="Username" onChange={handleChange} />);
    const input = screen.getByLabelText(/username/i);
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "student1" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("renders Input error message when provided", () => {
    render(<Input label="Email" error="Invalid email address" />);
    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
  });

  it("renders SearchInput", () => {
    render(<SearchInput placeholder="Search items..." />);
    expect(screen.getByPlaceholderText(/search items.../i)).toBeInTheDocument();
  });

  it("renders Select dropdown with options", () => {
    render(
      <Select
        label="Algorithm"
        options={[
          { value: "binary", label: "Binary Search" },
          { value: "linear", label: "Linear Search" },
        ]}
      />
    );
    expect(screen.getByLabelText(/algorithm/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders Checkbox and handles toggle", () => {
    render(<Checkbox label="Enable step sounds" defaultChecked={false} />);
    const checkbox = screen.getByLabelText(/enable step sounds/i);
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("renders Radio button", () => {
    render(<Radio label="Option A" name="test-group" />);
    expect(screen.getByLabelText(/option a/i)).toBeInTheDocument();
  });

  it("renders Textarea with label", () => {
    render(<Textarea label="Custom Code" defaultValue="def test(): pass" />);
    expect(screen.getByLabelText(/custom code/i)).toBeInTheDocument();
  });
});
