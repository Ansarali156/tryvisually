/**
 * Visualization State Engine Types
 *
 * Architecture:
 * ALGORITHM -> EXECUTION TRACE -> EXECUTION ENGINE -> VISUALIZATION STATE ENGINE -> VISUALIZER -> ANIMATION / UI
 *
 * The Visualization State Engine converts raw algorithm execution state snapshots (TState)
 * and execution steps into a unified, renderer-independent visual representation.
 * It produces purely semantic data (elements, connections, highlights, annotations)
 * without coupling to DOM, SVG, Canvas, or WebGL.
 */

export type VisualizationElementType =
  | "node"      // Graph / Tree / Linked List node
  | "item"      // Array element or collection item
  | "cell"      // Grid / Matrix / Dynamic Programming table cell
  | "bar"       // Bar chart element for sorting
  | "frame"     // Call stack activation frame (recursion)
  | "bucket"    // Hash table bucket or bin
  | "edge"      // Explicit edge element (when rendered as element)
  | "custom";   // Domain-specific element

export interface ElementPosition {
  readonly x: number;
  readonly y: number;
}

export interface ElementDimensions {
  readonly width?: number;
  readonly height?: number;
}

export interface VisualizationElement<TValue = unknown> {
  /** Stable string identifier (e.g. "node-17", "item-001") - never volatile index */
  readonly id: string;

  /** Semantic visual role */
  readonly type: VisualizationElementType;

  /** Underlying raw data value */
  readonly value?: TValue;

  /** Visible display label (defaults to String(value) if omitted) */
  readonly label?: string;

  /** Semantic spatial coordinate */
  readonly position?: ElementPosition;

  /** Optional bounding box dimensions */
  readonly dimensions?: ElementDimensions;

  /** Optional semantic state token (e.g. "active", "pivot", "root", "leaf") */
  readonly state?: string;

  /** Extensible key-value metadata for renderer-specific hints */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export type VisualizationConnectionType =
  | "pointer"   // Pointer reference (e.g., head, tail, left, right)
  | "edge"      // Graph edge
  | "parent"    // Tree upward link
  | "child"     // Tree downward link
  | "next"      // Singly-linked list forward pointer
  | "previous"  // Doubly-linked list backward pointer
  | "custom";

export interface VisualizationConnection {
  /** Unique connection identifier */
  readonly id: string;

  /** Source element ID */
  readonly sourceId: string;

  /** Target element ID */
  readonly targetId: string;

  /** Relational role */
  readonly type: VisualizationConnectionType;

  /** Whether the connection has a directed arrow */
  readonly directed?: boolean;

  /** Numeric or textual weight (e.g. Dijkstra edge weight) */
  readonly weight?: number | string;

  /** Optional text label for the connection */
  readonly label?: string;

  /** Whether this connection is actively traversed or highlighted */
  readonly highlighted?: boolean;

  /** Extensible key-value metadata */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export type HighlightType =
  | "current"   // Currently executed element (highest priority)
  | "found"     // Search target / goal element found
  | "selected"  // User or algorithm selected item
  | "active"    // Active in current window / frame
  | "compare"   // Elements being actively compared
  | "swapped"   // Elements swapped or exchanged
  | "inserted"  // Newly added element
  | "deleted"   // Marked for deletion or removed
  | "path"      // Part of the active traversal or shortest path
  | "visited"   // Already processed / explored element
  | "warning"   // Warning or pivot/boundary indication
  | "custom";   // Specialized highlight

export interface VisualizationHighlight {
  /** Stable ID of the targeted element */
  readonly elementId: string;

  /** Semantic highlight category */
  readonly type: HighlightType;

  /** Optional custom priority override (higher numbers take precedence) */
  readonly priority?: number;

  /** Optional tag or badge displayed with the highlight */
  readonly label?: string;

  /** Extensible metadata */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export type AnnotationType = "label" | "pointer" | "callout" | "marker";

export interface VisualizationAnnotation {
  /** Unique annotation ID */
  readonly id: string;

  /** Explanatory message or educational text */
  readonly text: string;

  /** Target element ID if anchored to an element */
  readonly targetId?: string;

  /** Semantic position if anchored to coordinate space */
  readonly position?: ElementPosition;

  /** Presentation role */
  readonly type?: AnnotationType;

  /** Extensible metadata */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface VisualizationState<TSourceState = unknown> {
  /** The raw, immutable underlying execution state snapshot */
  readonly sourceState: Readonly<TSourceState>;

  /** All visual elements present in the visualization */
  readonly elements: readonly VisualizationElement[];

  /** All relational connections between elements */
  readonly connections: readonly VisualizationConnection[];

  /** Active highlights applied to elements or connections */
  readonly highlights: readonly VisualizationHighlight[];

  /** Educational annotations, callouts, or pointers */
  readonly annotations: readonly VisualizationAnnotation[];

  /** Extensible metadata */
  readonly metadata?: Readonly<Record<string, unknown>>;
}
