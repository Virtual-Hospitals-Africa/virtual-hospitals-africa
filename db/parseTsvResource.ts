import { z } from 'zod'
import { map } from '../util/inParallel.ts'
import { parseTsv } from '../util/parseCsv.ts'

export function parseTsvResource<T extends z.ZodRawShape>(
  file_name: string,
  schema: z.ZodObject<T>,
): Promise<z.infer<z.ZodObject<T>>[]> {
  return map(
    parseTsv(`./db/resources/${file_name}.tsv`),
    schema.parse,
  )
}
