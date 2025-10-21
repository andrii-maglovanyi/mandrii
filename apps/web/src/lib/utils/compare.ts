/**
 * Deep equality check for form values.
 * Handles Files (by comparing file properties), Arrays, and nested objects.
 */
export const areValuesEqual = (left: unknown, right: unknown): boolean => {
  // Primitive equality
  if (left === right) {
    return true;
  }

  // File comparison (by properties, not identity)
  if (left instanceof File && right instanceof File) {
    return (
      left.name === right.name &&
      left.size === right.size &&
      left.lastModified === right.lastModified &&
      left.type === right.type
    );
  }

  // Array comparison
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false;
    }
    return left.every((item, i) => areValuesEqual(item, right[i]));
  }

  // Object comparison
  if (typeof left === "object" && left !== null && typeof right === "object" && right !== null) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    return leftKeys.every((key) =>
      rightKeys.includes(key)
        ? areValuesEqual((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key])
        : false,
    );
  }

  return false;
};
