import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Layers,
  Network,
  GitCommit,
  FolderTree,
  Binary,
  Hash,
  Search as SearchIcon,
} from "lucide-react";

export interface TopicItem {
  id: string;
  name: string;
  category: string;
  icon?: React.ElementType;
}

const DEFAULT_TOPICS: TopicItem[] = [
  { id: "arrays", name: "Array Operations", category: "Data Structures", icon: Layers },
  { id: "linked-lists", name: "Linked List", category: "Data Structures", icon: GitCommit },
  { id: "stack", name: "Stack", category: "Data Structures", icon: Layers },
  { id: "queue", name: "Queue", category: "Data Structures", icon: Layers },
  { id: "binary-tree", name: "Binary Tree", category: "Data Structures", icon: FolderTree },
  { id: "binary-search-tree", name: "Binary Search Tree", category: "Data Structures", icon: FolderTree },
  { id: "graph", name: "Graph (BFS/DFS)", category: "Data Structures", icon: Network },
  { id: "hash-table", name: "Hash Table", category: "Data Structures", icon: Hash },
  { id: "binary-search", name: "Binary Search", category: "Algorithms", icon: Binary },
  { id: "bubble-sort", name: "Bubble Sort", category: "Algorithms", icon: Layers },
  { id: "merge-sort", name: "Merge Sort", category: "Algorithms", icon: Layers },
  { id: "quick-sort", name: "Quick Sort", category: "Algorithms", icon: Layers },
];

export interface TopicsSidebarProps {
  selectedTopicId?: string;
  onSelectTopic?: (topicId: string) => void;
  className?: string;
}

export function TopicsSidebar({
  selectedTopicId = "binary-search",
  onSelectTopic,
  className,
}: TopicsSidebarProps) {
  const [filter, setFilter] = React.useState("");

  const filteredTopics = DEFAULT_TOPICS.filter((t) =>
    t.name.toLowerCase().includes(filter.toLowerCase())
  );

  const categories = Array.from(new Set(filteredTopics.map((t) => t.category)));

  return (
    <aside
      className={cn(
        "flex flex-col h-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-surface-900",
        className
      )}
    >
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-surface-50 dark:bg-surface-950">
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Topics Catalog
        </h4>
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter topics..."
            className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-surface-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {categories.map((cat) => (
          <div key={cat} className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
              {cat}
            </span>
            <div className="space-y-0.5">
              {filteredTopics
                .filter((t) => t.category === cat)
                .map((topic) => {
                  const Icon = topic.icon || Layers;
                  const isSelected = selectedTopicId === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => onSelectTopic?.(topic.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors",
                        isSelected
                          ? "bg-brand-600 text-white shadow-xs"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-surface-800"
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-white" : "text-slate-500 dark:text-slate-400")} />
                      <span className="truncate">{topic.name}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
