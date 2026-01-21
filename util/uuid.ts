export default function generateUUID(): string {
  return crypto.randomUUID()
}

export function isUUID(uuid: unknown): uuid is string {
  if (typeof uuid !== 'string') {
    return false
  }
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    .test(uuid)
}
