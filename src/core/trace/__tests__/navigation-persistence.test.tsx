import * as React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TraceSessionProvider, useTraceSession } from "../trace-session-context";

// Simulated Page Components
function MockTracePage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { code, setCode, language, setLanguage } = useTraceSession();
  return (
    <div data-testid="trace-page">
      <select
        data-testid="lang-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value as "python" | "cpp")}
      >
        <option value="python">Python</option>
        <option value="cpp">C++</option>
      </select>
      <textarea
        data-testid="code-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Type code here..."
      />
      <button data-testid="nav-visualise" onClick={() => onNavigate("/visualise")}>
        Go to Visualise
      </button>
      <button data-testid="nav-theory" onClick={() => onNavigate("/theory")}>
        Go to Theory
      </button>
    </div>
  );
}

function MockVisualisePage({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <div data-testid="visualise-page">
      <h1>Visualise Section</h1>
      <button data-testid="nav-trace" onClick={() => onNavigate("/trace")}>
        Back to Trace
      </button>
    </div>
  );
}

function MockTheoryPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <div data-testid="theory-page">
      <h1>Theory Section</h1>
      <button data-testid="nav-trace" onClick={() => onNavigate("/trace")}>
        Back to Trace
      </button>
    </div>
  );
}

// Simulated App with Root Level TraceSessionProvider (matching src/app/layout.tsx)
function MockApp() {
  const [currentRoute, setCurrentRoute] = React.useState<string>("/trace");

  return (
    <TraceSessionProvider>
      <nav>
        <button onClick={() => setCurrentRoute("/trace")}>Trace</button>
        <button onClick={() => setCurrentRoute("/visualise")}>Visualise</button>
        <button onClick={() => setCurrentRoute("/theory")}>Theory</button>
      </nav>
      <main>
        {currentRoute === "/trace" && <MockTracePage onNavigate={setCurrentRoute} />}
        {currentRoute === "/visualise" && <MockVisualisePage onNavigate={setCurrentRoute} />}
        {currentRoute === "/theory" && <MockTheoryPage onNavigate={setCurrentRoute} />}
      </main>
    </TraceSessionProvider>
  );
}

describe("Cross-Route Navigation State Persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("retains user written code when navigating Trace -> Visualise -> Theory -> Trace", () => {
    render(<MockApp />);

    // 1. Initially on /trace, editor is blank
    const editor = screen.getByTestId("code-editor") as HTMLTextAreaElement;
    expect(editor.value).toBe("");

    // 2. User writes Python code
    const userCode = `def solve():\n    return 42\nprint(solve())`;
    fireEvent.change(editor, { target: { value: userCode } });
    expect(editor.value).toBe(userCode);

    // 3. User navigates to /visualise (TracePage unmounts)
    fireEvent.click(screen.getByTestId("nav-visualise"));
    expect(screen.getByTestId("visualise-page")).toBeDefined();
    expect(screen.queryByTestId("code-editor")).toBeNull();

    // 4. User navigates to /theory
    fireEvent.click(screen.getByText("Theory"));
    expect(screen.getByTestId("theory-page")).toBeDefined();

    // 5. User returns to /trace (TracePage remounts)
    fireEvent.click(screen.getByTestId("nav-trace"));
    expect(screen.getByTestId("trace-page")).toBeDefined();

    // 6. User's written code is 100% preserved!
    const restoredEditor = screen.getByTestId("code-editor") as HTMLTextAreaElement;
    expect(restoredEditor.value).toBe(userCode);
  });

  it("persists language selection across page navigation", () => {
    render(<MockApp />);

    // Switch to C++
    const select = screen.getByTestId("lang-select") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "cpp" } });
    expect(select.value).toBe("cpp");

    const cppCode = `#include <iostream>\nint main() { return 0; }`;
    const editor = screen.getByTestId("code-editor") as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: cppCode } });

    // Navigate to Visualise and back
    fireEvent.click(screen.getByTestId("nav-visualise"));
    fireEvent.click(screen.getByTestId("nav-trace"));

    // Language and code are preserved
    const restoredSelect = screen.getByTestId("lang-select") as HTMLSelectElement;
    expect(restoredSelect.value).toBe("cpp");
    const restoredEditor = screen.getByTestId("code-editor") as HTMLTextAreaElement;
    expect(restoredEditor.value).toBe(cppCode);
  });
});
