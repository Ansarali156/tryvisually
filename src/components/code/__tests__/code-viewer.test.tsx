import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CodeViewer } from "../code-viewer";
import { parseSourceCode } from "@/core/synchronization/utils/source-code";

describe("CodeViewer Component", () => {
  const sampleCode = parseSourceCode(
    "def binary_search(arr, target):\n    low = 0\n    return -1",
    "python"
  );

  it("renders source code lines with line numbers", () => {
    render(<CodeViewer sourceCode={sampleCode} activeLines={[2]} />);

    expect(screen.getByText("def binary_search(arr, target):")).toBeInTheDocument();
    expect(screen.getByText("low = 0")).toBeInTheDocument();
    expect(screen.getByText("return -1")).toBeInTheDocument();
  });

  it("highlights active code line with accessible attributes", () => {
    const { container } = render(
      <CodeViewer sourceCode={sampleCode} activeLines={[2]} primaryLine={2} />
    );

    const activeLineElem = container.querySelector('[data-line-number="2"]');
    expect(activeLineElem).toHaveAttribute("aria-current", "true");

    const inactiveLineElem = container.querySelector('[data-line-number="1"]');
    expect(inactiveLineElem).not.toHaveAttribute("aria-current");
  });

  it("allows switching languages via buttons", () => {
    const onLanguageChange = vi.fn();
    render(
      <CodeViewer
        sourceCode={sampleCode}
        language="python"
        onLanguageChange={onLanguageChange}
        availableLanguages={["python", "typescript"]}
      />
    );

    const tsButton = screen.getByLabelText("Switch to typescript");
    fireEvent.click(tsButton);
    expect(onLanguageChange).toHaveBeenCalledWith("typescript");
  });
});
