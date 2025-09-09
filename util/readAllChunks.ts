// Helper function to read all data from a ReadableStream
export default async function readAllChunks(
  reader: ReadableStream<Uint8Array>,
): Promise<{
  chunks: Uint8Array[]
  total_length: number
}> {
  const chunks: Uint8Array[] = []
  let total_length = 0
  const stream_reader = reader.getReader()

  try {
    while (true) {
      const { done, value } = await stream_reader.read()
      if (done) break
      chunks.push(value)
      total_length += value.length
    }
  } finally {
    stream_reader.releaseLock()
  }

  return { chunks, total_length }
}
