import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs";

describe("Tabs Component", () => {
  it("renders tabs and switches active panel on click", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">First</TabsTrigger>
          <TabsTrigger value="tab2">Second</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">First Content Panel</TabsContent>
        <TabsContent value="tab2">Second Content Panel</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("First Content Panel")).toBeInTheDocument();
    expect(screen.queryByText("Second Content Panel")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /second/i }));

    expect(screen.queryByText("First Content Panel")).not.toBeInTheDocument();
    expect(screen.getByText("Second Content Panel")).toBeInTheDocument();
  });
});
