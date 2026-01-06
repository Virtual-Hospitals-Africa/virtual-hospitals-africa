export default function asFormData(data: Record<string, unknown>) {
  const form_data = new FormData()

  function appendToFormData(obj: Record<string, unknown>, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const full_key = prefix ? `${prefix}.${key}` : key

      if (Array.isArray(value)) {
        // Handle arrays with bracket notation: key[0], key[1], etc.
        value.forEach((item, index) => {
          const array_key = `${full_key}[${index}]`
          if (
            item !== null && typeof item === 'object' &&
            !(item instanceof File) && !(item instanceof Blob)
          ) {
            // Recursively handle objects within arrays
            appendToFormData(item as Record<string, unknown>, array_key)
          } else {
            form_data.append(array_key, String(item))
          }
        })
      } else if (
        value !== null && typeof value === 'object' &&
        !(value instanceof File) && !(value instanceof Blob)
      ) {
        // Recursively handle nested objects
        appendToFormData(value as Record<string, unknown>, full_key)
      } else {
        // Append leaf values (primitives, Files, Blobs, etc.)
        form_data.append(full_key, String(value))
      }
    }
  }

  appendToFormData(data)
  return form_data
}
