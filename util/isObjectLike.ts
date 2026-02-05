export default function isObjectLike(
  value: unknown,
): value is Record<string, unknown> {
  return value != null && !Array.isArray(value) && typeof value === 'object'
}
