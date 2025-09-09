export default function isKeyOf<T extends Record<string, unknown>>(
  key: unknown,
  obj: T,
): key is keyof T {
  return (key as string) in obj
}
