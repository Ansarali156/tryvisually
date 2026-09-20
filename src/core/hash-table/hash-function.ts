/**
 * Deterministic Hash Function for Hash Table
 *
 * Implements a classical polynomial rolling hash using prime base 31:
 * hash = (hash * 31 + charCode) % capacity
 *
 * Returns the computed index as well as a human-readable mathematical breakdown
 * for educational explanation during execution steps.
 */

export interface HashCalculationDetail {
  readonly char: string;
  readonly ascii: number;
  readonly intermediateHash: number;
}

export interface HashResult {
  readonly hash: number;
  readonly capacity: number;
  readonly details: readonly HashCalculationDetail[];
  readonly explanation: string;
}

/**
 * Computes a deterministic bucket/slot index for any non-empty string key.
 */
export function computeHash(key: string, capacity: number): HashResult {
  const safeCapacity = Math.max(1, capacity);

  if (!key || key.length === 0) {
    return {
      hash: 0,
      capacity: safeCapacity,
      details: [],
      explanation: `Empty key maps to index 0.`,
    };
  }

  let hash = 0;
  const details: HashCalculationDetail[] = [];

  for (let i = 0; i < key.length; i++) {
    const char = key[i];
    const ascii = key.charCodeAt(i);
    hash = (hash * 31 + ascii) % safeCapacity;
    details.push({
      char,
      ascii,
      intermediateHash: hash,
    });
  }

  // Ensure non-negative index
  const finalHash = ((hash % safeCapacity) + safeCapacity) % safeCapacity;

  const stepsPreview = details
    .map((d) => `'${d.char}'(${d.ascii})`)
    .join(" → ");

  return {
    hash: finalHash,
    capacity: safeCapacity,
    details,
    explanation: `hash("${key}"): ${stepsPreview} = ${finalHash} (mod ${safeCapacity})`,
  };
}
