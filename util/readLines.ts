// Helper function to read all data from a ReadableStream
export async function* readLines(
  reader: ReadableStream<Uint8Array>,
) {
  const streamReader = reader.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await streamReader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      // Split by newlines and process complete lines
      const lines = buffer.split('\n')
      // Keep the last partial line in the buffer
      buffer = lines.pop() || ''

      // Print complete lines to console
      for (const line of lines) {
        if (line.trim()) {
          yield line
        }
      }
    }
  } finally {
    streamReader.releaseLock()
  }

  if (buffer.trim()) {
    yield buffer
  }
}
