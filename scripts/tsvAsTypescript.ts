import { parseTsvTyped } from '../util/parseCsv.ts'
import { collect } from '../util/inParallel.ts'
import { assert } from 'std/assert/assert.ts'
import z from 'zod'

export function tsvAsRows<Schema extends z.ZodTypeAny>(
  filepath: string,
  schema: Schema,
) {
  assert(filepath.endsWith('.tsv'), 'File name must end with .tsv')
  return collect(parseTsvTyped(filepath, schema))
}

export async function rewriteTsvAsTypescript<Schema extends z.ZodTypeAny>(
  filepath: string,
  schema?: Schema,
) {
  const rows = await tsvAsRows(
    filepath,
    schema || {
      parse(x: unknown) {
        return x
      },
    } as unknown as z.ZodTypeAny,
  )
  const output_file_path = filepath.replace('.tsv', '.ts')
  const content = `export default ${JSON.stringify(rows, null, 2)}\n`
  await Deno.writeTextFile(output_file_path, content, { create: true })
  console.log(`Written ${rows.length} rows to ${output_file_path}`)
}

if (import.meta.main) {
  const [filepath] = Deno.args

  if (!filepath) {
    console.error(
      'Usage: deno run --allow-read --allow-write scripts/tsvAsTypescript.ts <input.tsv> <output.ts>',
    )
    Deno.exit(1)
  }

  await rewriteTsvAsTypescript(filepath)
}
