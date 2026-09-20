export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
}

export interface SidebarSubItem {
  name: string;
  slug: string;
  href: string;
  status?: "available" | "coming-soon";
}

export interface SidebarGroup {
  title: string;
  items: SidebarSubItem[];
}

export interface SidebarSection {
  sectionTitle: string;
  groups: SidebarGroup[];
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Visualise & Learn", href: "/visualise" },
  { label: "Trace Written Code", href: "/trace" },
  { label: "Learn DSA Theory", href: "/theory" },
];

export const ACCOUNT_MENU_ITEMS = [
  { label: "Profile", href: "/account" },
  { label: "Progress", href: "/progress" },
  { label: "Bookmarks", href: "/account#bookmarks" },
  { label: "Settings", href: "/account#settings" },
];

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    sectionTitle: "LEARN",
    groups: [
      {
        title: "Data Structures",
        items: [
          { name: "Arrays", slug: "arrays", href: "/data-structures#arrays", status: "available" },
          { name: "Linked Lists", slug: "linked-lists", href: "/data-structures#linked-lists", status: "available" },
          { name: "Stack", slug: "stack", href: "/data-structures#stack", status: "available" },
          { name: "Queue", slug: "queue", href: "/data-structures#queue", status: "available" },
          { name: "Hash Table", slug: "hash-table", href: "/data-structures#hash-table", status: "available" },
          { name: "Trees", slug: "trees", href: "/data-structures#trees", status: "available" },
          { name: "Heap", slug: "heap", href: "/data-structures#heap", status: "available" },
          { name: "Graphs", slug: "graphs", href: "/data-structures#graphs", status: "available" },
          { name: "Trie", slug: "trie", href: "/data-structures#trie", status: "available" },
        ],
      },
    ],
  },
  {
    sectionTitle: "ALGORITHMS",
    groups: [
      {
        title: "Searching",
        items: [
          { name: "Linear Search", slug: "linear-search", href: "/algorithms#linear-search", status: "available" },
          { name: "Binary Search", slug: "binary-search", href: "/visualizer/binary-search", status: "available" },
        ],
      },
      {
        title: "Sorting",
        items: [
          { name: "Bubble Sort", slug: "bubble-sort", href: "/algorithms#bubble-sort", status: "available" },
          { name: "Selection Sort", slug: "selection-sort", href: "/algorithms#selection-sort", status: "available" },
          { name: "Insertion Sort", slug: "insertion-sort", href: "/algorithms#insertion-sort", status: "available" },
          { name: "Merge Sort", slug: "merge-sort", href: "/algorithms#merge-sort", status: "available" },
          { name: "Quick Sort", slug: "quick-sort", href: "/algorithms#quick-sort", status: "available" },
        ],
      },
      {
        title: "Graphs",
        items: [
          { name: "BFS (Breadth-First)", slug: "bfs", href: "/algorithms#bfs", status: "available" },
          { name: "DFS (Depth-First)", slug: "dfs", href: "/algorithms#dfs", status: "available" },
          { name: "Dijkstra's Algorithm", slug: "dijkstra", href: "/algorithms#dijkstra", status: "available" },
          { name: "Prim's Algorithm", slug: "prim", href: "/algorithms#prim", status: "coming-soon" },
          { name: "Kruskal's Algorithm", slug: "kruskal", href: "/algorithms#kruskal", status: "coming-soon" },
        ],
      },
    ],
  },
  {
    sectionTitle: "ADVANCED",
    groups: [
      {
        title: "Paradigms",
        items: [
          { name: "Recursion", slug: "recursion", href: "/algorithms#recursion", status: "available" },
          { name: "Dynamic Programming", slug: "dp", href: "/algorithms#dp", status: "available" },
          { name: "Greedy Algorithms", slug: "greedy", href: "/algorithms#greedy", status: "available" },
          { name: "Backtracking", slug: "backtracking", href: "/algorithms#backtracking", status: "coming-soon" },
        ],
      },
    ],
  },
];

export const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: [
      { label: "Learn", href: "/learn" },
      { label: "Visualizer", href: "/visualizer" },
      { label: "Practice", href: "/practice" },
      { label: "Problems", href: "/problems" },
    ],
  },
  {
    title: "DSA",
    links: [
      { label: "Data Structures", href: "/data-structures" },
      { label: "Algorithms", href: "/algorithms" },
      { label: "Complexity Guide", href: "/learn#complexity" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/learn" },
      { label: "Tutorials", href: "/learn" },
      { label: "FAQ", href: "/learn#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Progress", href: "/progress" },
      { label: "Bookmarks", href: "/account#bookmarks" },
      { label: "Settings", href: "/account#settings" },
    ],
  },
];
