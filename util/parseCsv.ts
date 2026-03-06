import { CommonCSVReaderOptions, readCSV } from 'csv'
import z from 'zod'
import snakeCase from './snakeCase.ts'

// TODO: Can't get last column properly, maybe because new line character
// So need a extra column in csv file
export default async function* parseCsv(
  file_path: string,
  opts: Partial<CommonCSVReaderOptions> = {},
) {
  let file: Deno.FsFile | undefined
  try {
    file = await Deno.open(file_path)

    let header: string[] = []
    let is_first_row = true

    for await (const row of readCSV(file, opts)) {
      // Collecting data from the async iterable row into an array
      const row_data_array: string[] = []
      for await (let cell of row) {
        if (cell.endsWith('\r')) {
          cell = cell.slice(0, cell.length - 1)
        }
        row_data_array.push(cell)
      }

      if (is_first_row) {
        if (row_data_array.some((row) => row === '')) {
          throw new Error(
            `Error parsing ${file_path}. Check the header for extraneous trailing characters`,
          )
        }
        // Assuming the first row of the CSV contains the header
        header = row_data_array
        is_first_row = false
        continue
      }

      const row_data: Record<string, string | null> = {}

      let at_least_one_column_is_not_null = false
      header.forEach((column, i) => {
        const value = row_data_array[i] || null
        row_data[column] = value
        if (value) {
          at_least_one_column_is_not_null = true
        }
      })

      if (at_least_one_column_is_not_null) {
        yield row_data
      }
    }
  } catch (err) {
    console.error(file_path)
    throw err
  } finally {
    file?.close()
  }
}

export type ParseTsvOptions =
  & Omit<Partial<CommonCSVReaderOptions>, 'columnSeparator'>
  & {
    convert_to_snake_case?: boolean
    interpret_integers?: boolean
  }

function interpretIntegers(row: Record<string, string | null>) {
  return Object.fromEntries(
    Object.entries(row).map((
      [key, value],
    ) => [
      key,
      typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value,
    ]),
  )
}

export async function* parseTsv(
  file_path: string,
  opts: ParseTsvOptions = {},
) {
  for await (
    let row of parseCsv(file_path, { columnSeparator: '\t', ...opts })
  ) {
    if (opts.convert_to_snake_case) {
      row = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [snakeCase(key), value]),
      )
    }
    if (opts.interpret_integers) {
      yield interpretIntegers(row)
    } else {
      yield row
    }
  }
}

export async function* parseTsvTyped<Schema extends z.ZodTypeAny>(
  file_path: string,
  schema: Schema,
  opts: ParseTsvOptions = {},
): AsyncGenerator<z.infer<Schema>> {
  for await (
    const row of parseTsv(file_path, opts)
  ) {
    yield schema.parse(row)
  }
}

export async function* parseCsvTyped<Schema extends z.ZodTypeAny>(
  file_path: string,
  schema: Schema,
  opts: ParseTsvOptions = {},
): AsyncGenerator<z.infer<Schema>> {
  for await (
    const row of parseCsv(file_path, opts)
  ) {
    yield schema.parse(row)
  }
}

/**
 * Core synchronous parser for CSV/TSV data
 */
export function parseCsvSync(
  file_path: string,
  opts: ParseTsvOptions & {
    separator: string
  } = { separator: ',' },
  // deno-lint-ignore no-explicit-any
): Record<string, any>[] {
  const content = Deno.readTextFileSync(file_path)

  // Split by newline and filter out empty lines
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '')
  if (lines.length === 0) return []

  // Process Header
  let header = lines[0].split(opts.separator).map((h) => h.trim())

  if (header.some((h) => h === '')) {
    throw new Error(`Error parsing ${file_path}. Extraneous trailing characters in header.`)
  }

  if (opts.convert_to_snake_case) {
    header = header.map((h) => snakeCase(h))
  }

  // Process Rows
  return lines.slice(1).map((line) => {
    const values = line.split(opts.separator)
    // deno-lint-ignore no-explicit-any
    const row: Record<string, any> = {}

    header.forEach((key, i) => {
      let value: string | number | null = values[i]?.trim() || null

      if (opts.interpret_integers && value !== null && /^\d+$/.test(value)) {
        value = Number(value)
      }

      row[key] = value
    })

    return row
  })
}

/**
 * Synchronous TSV Parser with Zod validation
 */
export function parseTsvTypedSync<Schema extends z.ZodTypeAny>(
  file_path: string,
  schema: Schema,
  opts: Omit<ParseTsvOptions, 'columnSeparator'> = {},
): z.infer<Schema>[] {
  const rows = parseCsvSync(file_path, { ...opts, separator: '\t' })
  return rows.map((row) => schema.parse(row))
}
