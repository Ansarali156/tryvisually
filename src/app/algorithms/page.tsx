"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { AlgorithmCard } from "@/components/ui/cards";
import { ALGORITHMS_CATALOG } from "@/config/dsa";
import { Search } from "lucide-react";

export default function AlgorithmsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState<boolean>(false);

  const categories = [
    "All",
    "Searching",
    "Sorting",
    "Graphs",
    "Recursion",
    "Dynamic Programming",
    "Greedy",
    "Backtracking",
  ];

  const filteredAlgorithms = React.useMemo(() => {
    return ALGORITHMS_CATALOG.filter((algo) => {
      const matchesCat =
        selectedCategory === "All" || algo.category === selectedCategory;
      const matchesSearch =
        algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <AppShell>
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Collapsible Learning Sidebar */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <Breadcrumb items={[{ label: "Algorithms" }]} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Algorithms Catalog
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Explore searching, sorting, graph traversal, and dynamic programming with step-by-step traces.
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-brand-600 text-white shadow-2xs"
                    : "bg-surface-100 text-slate-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input Filter */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search algorithms by name or technique..."
              className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAlgorithms.map((algo) => (
              <div key={algo.id} id={algo.slug}>
                <AlgorithmCard algorithm={algo} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
