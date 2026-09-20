/**
 * Multi-Language Educational Source Code Snippets for Graph Operations
 */

import type { SourceCode, SupportedLanguage } from "@/core/synchronization/types";
import { parseSourceCode } from "@/core/synchronization/utils/source-code";
import type { GraphOperationType } from "./types";

const ADD_VERTEX_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def add_vertex(graph, label):
    if label in graph:
        raise ValueError(f"Vertex {label} already exists")
    graph[label] = [] # Initialize adjacency entry
    return graph`,
  typescript: `function addVertex(graph: Map<string, string[]>, label: string): void {
  if (graph.has(label)) {
    throw new Error(\`Vertex \${label} already exists\`);
  }
  graph.set(label, []); // Initialize neighbor array
}`,
  javascript: `function addVertex(graph, label) {
  if (graph.has(label)) {
    throw new Error(\`Vertex \${label} already exists\`);
  }
  graph.set(label, []); // Initialize neighbor array
}`,
  java: `public void addVertex(Map<String, List<String>> graph, String label) {
    if (graph.containsKey(label)) {
        throw new IllegalArgumentException("Vertex already exists");
    }
    graph.put(label, new ArrayList<>());
}`,
  cpp: `void addVertex(unordered_map<string, vector<string>>& graph, const string& label) {
    if (graph.find(label) != graph.end()) {
        throw invalid_argument("Vertex already exists");
    }
    graph[label] = {};
}`,
};

const ADD_EDGE_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def add_edge(graph, u, v, weight=None, directed=False):
    if u not in graph or v not in graph:
        raise KeyError("Vertices must exist in graph")
    edge = (v, weight) if weight is not None else v
    graph[u].append(edge)
    if not directed and u != v:
        rev_edge = (u, weight) if weight is not None else u
        graph[v].append(rev_edge)`,
  typescript: `function addEdge(
  graph: Map<string, Array<{ target: string; weight?: number }>>,
  u: string,
  v: string,
  weight?: number,
  directed: boolean = false
): void {
  graph.get(u)?.push({ target: v, weight });
  if (!directed && u !== v) {
    graph.get(v)?.push({ target: u, weight });
  }
}`,
  javascript: `function addEdge(graph, u, v, weight, directed = false) {
  graph.get(u).push({ target: v, weight });
  if (!directed && u !== v) {
    graph.get(v).push({ target: u, weight });
  }
}`,
  java: `public void addEdge(Map<String, List<Edge>> graph, String u, String v, Integer weight, boolean directed) {
    graph.get(u).add(new Edge(v, weight));
    if (!directed && !u.equals(v)) {
        graph.get(v).add(new Edge(u, weight));
    }
}`,
  cpp: `void addEdge(unordered_map<string, vector<pair<string, int>>>& graph,
             const string& u, const string& v, int weight = 1, bool directed = false) {
    graph[u].push_back({v, weight});
    if (!directed && u != v) {
        graph[v].push_back({u, weight});
    }
}`,
};

const DELETE_VERTEX_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def delete_vertex(graph, label):
    if label not in graph:
        return
    # Remove all incident edges targeting label
    for node in graph:
        graph[node] = [e for e in graph[node] if (e[0] if isinstance(e, tuple) else e) != label]
    del graph[label] # Delete vertex entry`,
  typescript: `function deleteVertex(graph: Map<string, string[]>, label: string): void {
  graph.delete(label);
  for (const [node, neighbors] of graph.entries()) {
    graph.set(node, neighbors.filter(v => v !== label));
  }
}`,
  javascript: `function deleteVertex(graph, label) {
  graph.delete(label);
  for (const [node, neighbors] of graph.entries()) {
    graph.set(node, neighbors.filter(v => v !== label));
  }
}`,
  java: `public void deleteVertex(Map<String, List<String>> graph, String label) {
    graph.remove(label);
    for (List<String> neighbors : graph.values()) {
        neighbors.removeIf(v -> v.equals(label));
    }
}`,
  cpp: `void deleteVertex(unordered_map<string, vector<string>>& graph, const string& label) {
    graph.erase(label);
    for (auto& [node, neighbors] : graph) {
        neighbors.erase(remove(neighbors.begin(), neighbors.end(), label), neighbors.end());
    }
}`,
};

const DELETE_EDGE_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def delete_edge(graph, u, v, directed=False):
    if u in graph:
        graph[u] = [e for e in graph[u] if (e[0] if isinstance(e, tuple) else e) != v]
    if not directed and v in graph:
        graph[v] = [e for e in graph[v] if (e[0] if isinstance(e, tuple) else e) != u]`,
  typescript: `function deleteEdge(graph: Map<string, string[]>, u: string, v: string, directed: boolean): void {
  const uEdges = graph.get(u) || [];
  graph.set(u, uEdges.filter(target => target !== v));
  if (!directed) {
    const vEdges = graph.get(v) || [];
    graph.set(v, vEdges.filter(target => target !== u));
  }
}`,
  javascript: `function deleteEdge(graph, u, v, directed) {
  graph.set(u, (graph.get(u) || []).filter(target => target !== v));
  if (!directed) {
    graph.set(v, (graph.get(v) || []).filter(target => target !== u));
  }
}`,
  java: `public void deleteEdge(Map<String, List<String>> graph, String u, String v, boolean directed) {
    if (graph.containsKey(u)) graph.get(u).remove(v);
    if (!directed && graph.containsKey(v)) graph.get(v).remove(u);
}`,
  cpp: `void deleteEdge(unordered_map<string, vector<string>>& graph, const string& u, const string& v, bool directed) {
    if (graph.count(u)) {
        auto& list = graph[u];
        list.erase(remove(list.begin(), list.end(), v), list.end());
    }
    if (!directed && graph.count(v)) {
        auto& list = graph[v];
        list.erase(remove(list.begin(), list.end(), u), list.end());
    }
}`,
};

const DEFAULT_GRAPH_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `# Graph Representation (Adjacency List & Matrix)
# Space: O(V + E) for List, O(V^2) for Matrix
adj_list = { "A": ["B", "C"], "B": ["D"] }
adj_matrix = [[0, 1, 1], [0, 0, 1], [0, 0, 0]]`,
  typescript: `// Graph Representation (Adjacency List & Matrix)
// Space: O(V + E) for List, O(V^2) for Matrix
const adjList = new Map<string, string[]>();
const adjMatrix: number[][] = [];`,
  javascript: `// Graph Representation (Adjacency List & Matrix)
const adjList = new Map();
const adjMatrix = [];`,
  java: `// Graph Representation (Adjacency List & Matrix)
Map<String, List<String>> adjList = new HashMap<>();
int[][] adjMatrix = new int[V][V];`,
  cpp: `// Graph Representation (Adjacency List & Matrix)
unordered_map<string, vector<string>> adjList;
vector<vector<int>> adjMatrix(V, vector<int>(V, 0));`,
};

export function getGraphSourceCodes(
  operation: GraphOperationType | "adjacency-list" | "adjacency-matrix" | "degree"
): Record<SupportedLanguage, SourceCode> {
  let dictionary: Record<SupportedLanguage, string>;

  switch (operation) {
    case "add-node":
      dictionary = ADD_VERTEX_SNIPPETS;
      break;
    case "add-edge":
      dictionary = ADD_EDGE_SNIPPETS;
      break;
    case "delete-node":
      dictionary = DELETE_VERTEX_SNIPPETS;
      break;
    case "delete-edge":
      dictionary = DELETE_EDGE_SNIPPETS;
      break;
    default:
      dictionary = DEFAULT_GRAPH_SNIPPETS;
      break;
  }

  return {
    python: parseSourceCode(dictionary.python, "python"),
    javascript: parseSourceCode(dictionary.javascript, "javascript"),
    typescript: parseSourceCode(dictionary.typescript, "typescript"),
    java: parseSourceCode(dictionary.java, "java"),
    cpp: parseSourceCode(dictionary.cpp, "cpp"),
  };
}
