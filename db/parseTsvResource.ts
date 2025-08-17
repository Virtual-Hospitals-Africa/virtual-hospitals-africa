import { z } from 'zod'
import { collect } from '../util/inParallel.ts'
import { parseTsv, ParseTsvOptions } from '../util/parseCsv.ts'

export async function* mapTsvResource<T extends z.ZodRawShape>(
  file_name: string,
  schema: z.ZodObject<T>,
  options?: ParseTsvOptions,
) {
  for await (
    const row of parseTsv(
      `./db/resources/${file_name}.tsv`.replace('.txt.tsv', '.txt'),
      options || {},
    )
  ) {
    try {
      const parsed = schema.parse(row)
      yield parsed
    } catch (e) {
      console.error(e)
      console.error(row)
      throw e
    }
  }
}

export function collectTsvResource<T extends z.ZodRawShape>(
  file_name: string,
  schema: z.ZodObject<T>,
  options?: ParseTsvOptions,
): Promise<z.infer<z.ZodObject<T>>[]> {
  return collect(
    mapTsvResource(file_name, schema, options),
  )
}

export async function* chunkTsvResource<T extends z.ZodRawShape>(
  file_name: string,
  schema: z.ZodObject<T>,
  options?: ParseTsvOptions & {
    chunk_size?: number
  },
) {
  const chunk_size = options?.chunk_size || 1000
  let rows: z.infer<z.ZodObject<T>>[] = []
  for await (
    const row of mapTsvResource(file_name, schema, options)
  ) {
    rows.push(row)
    if (rows.length >= chunk_size) {
      yield rows
      rows = []
    }
  }
  if (rows.length) {
    yield rows
  }
}
