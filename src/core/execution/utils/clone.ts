/**
 * Safe Deep Cloning and Deep Freezing Utilities
 * 
 * Ensures execution states are strictly immutable snapshots with zero state drift
 * across non-linear time travel jumps and replays.
 */

export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {
      // Fallback for non-cloneable objects or test environments
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as unknown as T;
  }

  const copy = {} as Record<string, unknown>;
  for (const [key, val] of Object.entries(value)) {
    copy[key] = deepClone(val);
  }
  return copy as T;
}

export function deepFreeze<T>(object: T): Readonly<T> {
  if (object === null || typeof object !== "object") {
    return object;
  }

  // Retrieve property names
  const propNames = Object.getOwnPropertyNames(object);

  // Freeze properties before freezing self
  for (const name of propNames) {
    const value = (object as Record<string, unknown>)[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }

  return Object.freeze(object);
}
