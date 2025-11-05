export default function asFormData(data: Record<string, unknown>) {
  const form_data = new FormData()

  function appendToFormData(obj: Record<string, unknown>, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const full_key = prefix ? `${prefix}.${key}` : key

      // Check if value is a plain object (not File, Blob, Array, etc.)
      if (
        value !== null && typeof value === 'object' && !Array.isArray(value) &&
        !(value instanceof File) && !(value instanceof Blob)
      ) {
        // Recursively handle nested objects
        appendToFormData(value as Record<string, unknown>, full_key)
      } else {
        // Append leaf values (primitives, arrays, Files, Blobs, etc.)
        form_data.append(full_key, String(value))
      }
    }
  }

  appendToFormData(data)
  return form_data
}
