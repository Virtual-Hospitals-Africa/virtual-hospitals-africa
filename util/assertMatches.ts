import { z } from "zod";

function isZodType(value: unknown): value is z.ZodType {
  return value !== null &&
    typeof value === "object" &&
    "safeParse" in value &&
    typeof value.safeParse === "function";
}

function zodify(value: unknown): z.ZodType {
  // Already a Zod type, return as-is
  if (isZodType(value)) {
    return value;
  }

  // Arrays become tuples with each element zodified
  if (Array.isArray(value)) {
    const elements = value.map(zodify);
    return elements.length
      ? z.tuple(elements as [z.ZodType, ...z.ZodType[]])
      : z.tuple([]);
  }

  // Objects get each value zodified
  if (typeof value === "object" && value !== null) {
    const shape: Record<string, z.ZodType> = {};
    for (const key of Object.keys(value)) {
      shape[key] = zodify((value as Record<string, unknown>)[key]);
    }
    return z.object(shape);
  }

  // Primitives become literals
  return z.literal(value as z.Primitive);
}

function getAtPath(obj: unknown, path: (string | number)[]): unknown {
  let value: unknown = obj;
  for (const key of path) {
    if (value && typeof value === "object") {
      value = (value as Record<string | number, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return value;
}

export function assertMatches(
  object: unknown,
  test: unknown,
): void {
  const result = zodify(test).safeParse(object);
  if (!result.success) {
    const enhancedIssues = result.error.issues.map((issue) => ({
      ...issue,
      actual_value: getAtPath(object, issue.path),
    }));
    throw new Error(JSON.stringify(enhancedIssues, null, 2));
  }
}
