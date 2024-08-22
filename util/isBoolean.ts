export default function isBoolean(value: unknown): value is boolean {
  const type = typeof value
  return type === 'boolean'
}
