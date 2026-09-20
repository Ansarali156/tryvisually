/**
 * Disjoint Set Union (DSU) / Union-Find Data Structure
 *
 * Implements union-by-rank and path compression.
 * Used by Kruskal's algorithm for Minimum Spanning Tree and cycle detection.
 */

export class UnionFind {
  private parent: Map<string, string>;
  private rank: Map<string, number>;

  constructor(elements: readonly string[]) {
    this.parent = new Map();
    this.rank = new Map();
    for (const el of elements) {
      this.parent.set(el, el);
      this.rank.set(el, 0);
    }
  }

  /**
   * Finds the representative root of element `x` with path compression.
   */
  find(x: string): string {
    const p = this.parent.get(x);
    if (!p) {
      this.parent.set(x, x);
      this.rank.set(x, 0);
      return x;
    }
    if (p !== x) {
      const root = this.find(p);
      this.parent.set(x, root);
      return root;
    }
    return x;
  }

  /**
   * Unites the sets containing `x` and `y`.
   * Returns true if united (different sets), false if already in same set (cycle).
   */
  union(x: string, y: string): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) {
      return false; // Cycle detected
    }

    const rankX = this.rank.get(rootX) ?? 0;
    const rankY = this.rank.get(rootY) ?? 0;

    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }

    return true;
  }

  /**
   * Returns an immutable snapshot map of elements to their canonical representative roots.
   */
  getSnapshot(): Record<string, string> {
    const snapshot: Record<string, string> = {};
    for (const [key] of this.parent.entries()) {
      snapshot[key] = this.find(key);
    }
    return snapshot;
  }
}
