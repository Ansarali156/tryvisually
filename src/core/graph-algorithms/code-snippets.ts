/**
 * Multi-language Code Snippets for Graph Algorithms
 *
 * Supports TypeScript, Python, Java, and C++.
 * Line numbers correspond to the active execution trace steps.
 */

export const GRAPH_ALGORITHM_SNIPPETS: Record<string, Record<string, string>> = {
  bfs: {
    typescript: `function bfs(graph, startId) {
  const visited = new Set();
  const queue = [startId];
  visited.add(startId);
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of graph[current]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}`,
    python: `def bfs(graph, start_id):
    visited = set([start_id])
    queue = deque([start_id])
    while queue:
        current = queue.popleft()
        for neighbor in graph[current]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
    java: `void bfs(Map<String, List<String>> graph, String start) {
    Set<String> visited = new HashSet<>();
    Queue<String> queue = new LinkedList<>();
    visited.add(start);
    queue.offer(start);
    while (!queue.isEmpty()) {
        String curr = queue.poll();
        for (String next : graph.get(curr)) {
            if (!visited.contains(next)) {
                visited.add(next);
                queue.offer(next);
            }
        }
    }
}`,
    cpp: `void bfs(const Graph& g, const string& start) {
    unordered_set<string> visited{start};
    queue<string> q;
    q.push(start);
    while (!q.empty()) {
        string u = q.front(); q.pop();
        for (const string& v : g.at(u)) {
            if (!visited.count(v)) {
                visited.insert(v);
                q.push(v);
            }
        }
    }
}`,
  },
  dfs: {
    typescript: `function dfs(graph, startId) {
  const visited = new Set();
  function traverse(current) {
    visited.add(current);
    for (const neighbor of graph[current]) {
      if (!visited.has(neighbor)) {
        traverse(neighbor);
      }
    }
  }
  traverse(startId);
}`,
    python: `def dfs(graph, start_id):
    visited = set()
    def traverse(current):
        visited.add(current)
        for neighbor in graph[current]:
            if neighbor not in visited:
                traverse(neighbor)
    traverse(start_id)`,
    java: `void dfs(Map<String, List<String>> graph, String start) {
    Set<String> visited = new HashSet<>();
    void traverse(String curr) {
        visited.add(curr);
        for (String next : graph.get(curr)) {
            if (!visited.contains(next)) traverse(next);
        }
    }
    traverse(start);
}`,
    cpp: `void dfs(const Graph& g, const string& start) {
    unordered_set<string> visited;
    auto traverse = [&](auto& self, const string& u) -> void {
        visited.insert(u);
        for (const string& v : g.at(u)) {
            if (!visited.count(v)) self(self, v);
        }
    };
    traverse(traverse, start);
}`,
  },
  dijkstra: {
    typescript: `function dijkstra(graph, startId) {
  const dist = { [startId]: 0 };
  const pq = new PriorityQueue();
  pq.enqueue(startId, 0);
  while (!pq.isEmpty()) {
    const { element: u, priority: d } = pq.dequeue()!;
    if (d > (dist[u] ?? Infinity)) continue;
    for (const { target: v, weight: w } of graph[u]) {
      if (dist[u] + w < (dist[v] ?? Infinity)) {
        dist[v] = dist[u] + w;
        pq.enqueue(v, dist[v]);
      }
    }
  }
}`,
    python: `def dijkstra(graph, start):
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))`,
    java: `void dijkstra(Graph g, String start) {
    Map<String, Integer> dist = new HashMap<>();
    PriorityQueue<Node> pq = new PriorityQueue<>(Comparator.comparingInt(n -> n.dist));
    dist.put(start, 0);
    pq.offer(new Node(start, 0));
    while (!pq.isEmpty()) {
        Node curr = pq.poll();
        if (curr.dist > dist.getOrDefault(curr.id, Integer.MAX_VALUE)) continue;
        for (Edge e : g.edgesFrom(curr.id)) {
            if (curr.dist + e.weight < dist.getOrDefault(e.to, Integer.MAX_VALUE)) {
                dist.put(e.to, curr.dist + e.weight);
                pq.offer(new Node(e.to, dist.get(e.to)));
            }
        }
    }
}`,
    cpp: `void dijkstra(const Graph& g, const string& start) {
    unordered_map<string, int> dist;
    priority_queue<pair<int, string>, vector<pair<int, string>>, greater<>> pq;
    dist[start] = 0;
    pq.push({0, start});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : g.at(u)) {
            if (!dist.count(v) || dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
}`,
  },
  "bellman-ford": {
    typescript: `function bellmanFord(vertices, edges, startId) {
  const dist = { [startId]: 0 };
  for (let i = 0; i < vertices.length - 1; i++) {
    for (const { u, v, w } of edges) {
      if (dist[u] !== undefined && dist[u] + w < (dist[v] ?? Infinity)) {
        dist[v] = dist[u] + w;
      }
    }
  }
  for (const { u, v, w } of edges) {
    if (dist[u] !== undefined && dist[u] + w < (dist[v] ?? Infinity)) {
      throw new Error("Negative cycle detected");
    }
  }
}`,
    python: `def bellman_ford(vertices, edges, start):
    dist = {v: float('inf') for v in vertices}
    dist[start] = 0
    for _ in range(len(vertices) - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            raise ValueError("Negative cycle detected")`,
    java: `void bellmanFord(List<String> V, List<Edge> E, String start) {
    Map<String, Integer> dist = new HashMap<>();
    dist.put(start, 0);
    for (int i = 0; i < V.size() - 1; i++) {
        for (Edge e : E) {
            if (dist.containsKey(e.u) && dist.get(e.u) + e.w < dist.getOrDefault(e.v, 1e9)) {
                dist.put(e.v, dist.get(e.u) + e.w);
            }
        }
    }
}`,
    cpp: `void bellmanFord(const vector<string>& V, const vector<Edge>& E, string start) {
    unordered_map<string, int> dist;
    dist[start] = 0;
    for (size_t i = 0; i < V.size() - 1; ++i) {
        for (const auto& e : E) {
            if (dist.count(e.u) && (!dist.count(e.v) || dist[e.u] + e.w < dist[e.v]))
                dist[e.v] = dist[e.u] + e.w;
        }
    }
}`,
  },
  prim: {
    typescript: `function prim(vertices, adj, startId) {
  const visited = new Set([startId]);
  const mstEdges = [];
  while (visited.size < vertices.length) {
    let minEdge = null;
    for (const u of visited) {
      for (const edge of adj[u]) {
        if (!visited.has(edge.v)) {
          if (!minEdge || edge.w < minEdge.w) minEdge = edge;
        }
      }
    }
    if (!minEdge) break;
    visited.add(minEdge.v);
    mstEdges.push(minEdge);
  }
  return mstEdges;
}`,
    python: `def prim(vertices, adj, start):
    visited = {start}
    mst_edges = []
    while len(visited) < len(vertices):
        min_edge = None
        for u in visited:
            for v, w in adj[u]:
                if v not in visited:
                    if not min_edge or w < min_edge[2]:
                        min_edge = (u, v, w)
        if not min_edge: break
        visited.add(min_edge[1])
        mst_edges.append(min_edge)
    return mst_edges`,
    java: `List<Edge> prim(List<String> V, Map<String, List<Edge>> adj, String start) {
    Set<String> visited = new HashSet<>();
    visited.add(start);
    List<Edge> mst = new ArrayList<>();
    while (visited.size() < V.size()) {
        Edge best = null;
        for (String u : visited) {
            for (Edge e : adj.get(u)) {
                if (!visited.contains(e.v) && (best == null || e.w < best.w)) best = e;
            }
        }
        if (best == null) break;
        visited.add(best.v);
        mst.add(best);
    }
    return mst;
}`,
    cpp: `vector<Edge> prim(const vector<string>& V, const Adj& adj, string start) {
    unordered_set<string> visited{start};
    vector<Edge> mst;
    while (visited.size() < V.size()) {
        optional<Edge> best;
        for (const auto& u : visited) {
            for (const auto& e : adj.at(u)) {
                if (!visited.count(e.v) && (!best || e.w < best->w)) best = e;
            }
        }
        if (!best) break;
        visited.insert(best->v);
        mst.push_back(*best);
    }
    return mst;
}`,
  },
  kruskal: {
    typescript: `function kruskal(vertices, edges) {
  const uf = new UnionFind(vertices);
  const sorted = [...edges].sort((a, b) => a.w - b.w);
  const mst = [];
  for (const edge of sorted) {
    if (uf.union(edge.u, edge.v)) {
      mst.push(edge);
      if (mst.length === vertices.length - 1) break;
    }
  }
  return mst;
}`,
    python: `def kruskal(vertices, edges):
    uf = UnionFind(vertices)
    edges.sort(key=lambda e: e.weight)
    mst = []
    for u, v, w in edges:
        if uf.union(u, v):
            mst.append((u, v, w))
            if len(mst) == len(vertices) - 1:
                break
    return mst`,
    java: `List<Edge> kruskal(List<String> V, List<Edge> edges) {
    UnionFind uf = new UnionFind(V);
    Collections.sort(edges, Comparator.comparingInt(e -> e.w));
    List<Edge> mst = new ArrayList<>();
    for (Edge e : edges) {
        if (uf.union(e.u, e.v)) {
            mst.add(e);
            if (mst.size() == V.size() - 1) break;
        }
    }
    return mst;
}`,
    cpp: `vector<Edge> kruskal(const vector<string>& V, vector<Edge> edges) {
    UnionFind uf(V);
    sort(edges.begin(), edges.end(), [](auto& a, auto& b) { return a.w < b.w; });
    vector<Edge> mst;
    for (const auto& e : edges) {
        if (uf.unite(e.u, e.v)) {
            mst.push_back(e);
            if (mst.size() == V.size() - 1) break;
        }
    }
    return mst;
}`,
  },
  "topological-sort": {
    typescript: `function topologicalSort(vertices, graph) {
  const inDegree = {};
  vertices.forEach(v => inDegree[v] = 0);
  for (const u of vertices) {
    for (const v of graph[u]) inDegree[v]++;
  }
  const queue = vertices.filter(v => inDegree[v] === 0);
  const order = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    order.push(u);
    for (const v of graph[u]) {
      inDegree[v]--;
      if (inDegree[v] === 0) queue.push(v);
    }
  }
  return order.length === vertices.length ? order : []; // Cycle check
}`,
    python: `def topological_sort(vertices, graph):
    in_degree = {v: 0 for v in vertices}
    for u in graph:
        for v in graph[u]:
            in_degree[v] += 1
    queue = deque([v for v in vertices if in_degree[v] == 0])
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)
    return order if len(order) == len(vertices) else []`,
    java: `List<String> topoSort(List<String> V, Map<String, List<String>> graph) {
    Map<String, Integer> inDegree = new HashMap<>();
    V.forEach(v -> inDegree.put(v, 0));
    graph.values().forEach(list -> list.forEach(v -> inDegree.merge(v, 1, Integer::sum)));
    Queue<String> q = new LinkedList<>();
    V.stream().filter(v -> inDegree.get(v) == 0).forEach(q::offer);
    List<String> order = new ArrayList<>();
    while (!q.isEmpty()) {
        String u = q.poll();
        order.add(u);
        for (String v : graph.getOrDefault(u, List.of())) {
            inDegree.put(v, inDegree.get(v) - 1);
            if (inDegree.get(v) == 0) q.offer(v);
        }
    }
    return order.size() == V.size() ? order : List.of();
}`,
    cpp: `vector<string> topoSort(const vector<string>& V, const Graph& g) {
    unordered_map<string, int> inDeg;
    for (const auto& v : V) inDeg[v] = 0;
    for (const auto& [u, neighbors] : g) {
        for (const auto& v : neighbors) inDeg[v]++;
    }
    queue<string> q;
    for (const auto& v : V) if (inDeg[v] == 0) q.push(v);
    vector<string> order;
    while (!q.empty()) {
        string u = q.front(); q.pop();
        order.push_back(u);
        for (const auto& v : g.at(u)) {
            if (--inDeg[v] == 0) q.push(v);
        }
    }
    return order.size() == V.size() ? order : vector<string>{};
}`,
  },
};
