/**
 * Hash Table Visualization Adapter
 *
 * Converts HashTableState snapshots into renderer-independent visual representation:
 * - Separate Chaining: Buckets with horizontal chained entries linked via directional arrows.
 * - Open Addressing: Horizontal slot track displaying slot index, status (EMPTY, OCCUPIED, DELETED), and entry.
 * - Dynamic annotations for target bucket, probe index, and matching entries.
 */

import { BaseVisualizationAdapter } from "@/core/visualization/adapters/base-adapter";
import type { ExecutionStep } from "@/core/execution/types";
import type {
  VisualizationElement,
  VisualizationConnection,
  VisualizationAnnotation,
} from "@/core/visualization/types";
import type { HashTableState } from "./types";

export class HashTableAdapter extends BaseVisualizationAdapter<HashTableState> {
  readonly name = "HashTableAdapter";

  buildElements(
    state: HashTableState,
    _step?: ExecutionStep<HashTableState> | null
  ): readonly VisualizationElement[] {
    const elements: VisualizationElement[] = [];

    // Separate Chaining Representation
    if (state.collisionStrategy === "chaining") {
      const buckets = state.buckets || [];

      for (let i = 0; i < state.capacity; i++) {
        const bucket = buckets[i] || { index: i, entries: [] };
        const bucketId = `bucket-${i}`;

        // 1. Bucket head element
        elements.push({
          id: bucketId,
          type: "bucket",
          label: `[${i}]`,
          position: { x: 0, y: i * 64 },
          metadata: {
            bucketIndex: i,
            entriesCount: bucket.entries.length,
            isCollision: bucket.entries.length > 1,
          },
        });

        // 2. Chained entries
        bucket.entries.forEach((entry, chainIdx) => {
          elements.push({
            id: entry.id,
            type: "item",
            label: `${entry.key}: ${entry.value}`,
            position: { x: 130 + chainIdx * 130, y: i * 64 },
            metadata: {
              key: entry.key,
              value: entry.value,
              hash: entry.hash,
              bucketIndex: i,
              chainIndex: chainIdx,
            },
          });
        });
      }

      return Object.freeze(elements);
    }

    // Open Addressing (Linear or Quadratic Probing)
    const slots = state.slots || [];

    for (let i = 0; i < state.capacity; i++) {
      const slot = slots[i] || { index: i, status: "empty", entry: null };
      const slotId = `slot-${i}`;

      let label = "EMPTY";
      if (slot.status === "occupied" && slot.entry) {
        label = `${slot.entry.key}: ${slot.entry.value}`;
      } else if (slot.status === "deleted") {
        label = "TOMBSTONE";
      }

      elements.push({
        id: slotId,
        type: "bucket",
        label,
        state: slot.status,
        position: { x: i * 115, y: 0 },
        metadata: {
          slotIndex: i,
          status: slot.status,
          entry: slot.entry,
          key: slot.entry?.key,
          value: slot.entry?.value,
        },
      });

      // Also register entry as an individual addressable element if occupied
      if (slot.status === "occupied" && slot.entry) {
        elements.push({
          id: slot.entry.id,
          type: "item",
          label: `${slot.entry.key}: ${slot.entry.value}`,
          position: { x: i * 115, y: 0 },
          metadata: {
            key: slot.entry.key,
            value: slot.entry.value,
            slotIndex: i,
          },
        });
      }
    }

    return Object.freeze(elements);
  }

  buildConnections(
    state: HashTableState,
    _step?: ExecutionStep<HashTableState> | null
  ): readonly VisualizationConnection[] {
    const connections: VisualizationConnection[] = [];

    if (state.collisionStrategy === "chaining") {
      const buckets = state.buckets || [];

      for (let i = 0; i < state.capacity; i++) {
        const bucket = buckets[i];
        if (!bucket || bucket.entries.length === 0) continue;

        // Bucket to first entry connection
        connections.push({
          id: `conn-bucket-${i}-to-${bucket.entries[0].id}`,
          sourceId: `bucket-${i}`,
          targetId: bucket.entries[0].id,
          type: "pointer",
          directed: true,
        });

        // Inter-entry chain connections
        for (let j = 0; j < bucket.entries.length - 1; j++) {
          const from = bucket.entries[j];
          const to = bucket.entries[j + 1];
          connections.push({
            id: `conn-${from.id}-to-${to.id}`,
            sourceId: from.id,
            targetId: to.id,
            type: "pointer",
            directed: true,
          });
        }
      }
    }

    return Object.freeze(connections);
  }

  buildCustomAnnotations(
    state: HashTableState,
    step?: ExecutionStep<HashTableState> | null
  ): readonly VisualizationAnnotation[] {
    const annotations: VisualizationAnnotation[] = [];

    if (!step) return annotations;

    const vars = step.variables;

    if (typeof vars.bucketIndex === "number") {
      annotations.push({
        id: `ann-hash-bucket-${vars.bucketIndex}`,
        targetId: `bucket-${vars.bucketIndex}`,
        type: "pointer",
        text: "HASH",
      });
    }

    if (typeof vars.slotIndex === "number") {
      annotations.push({
        id: `ann-probe-slot-${vars.slotIndex}`,
        targetId: `slot-${vars.slotIndex}`,
        type: "pointer",
        text: typeof vars.probe === "number" ? `PROBE ${vars.probe}` : "TARGET",
      });
    }

    return Object.freeze(annotations);
  }
}

export const defaultHashTableAdapter = new HashTableAdapter();
