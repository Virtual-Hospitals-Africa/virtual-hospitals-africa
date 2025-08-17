import { CommonCSVReaderOptions, readCSV } from 'csv'
import z from 'zod'
import snakeCase from './snakeCase.ts'

// TODO: Can't get last column properly, maybe because new line character
// So need a extra column in csv file
export default async function* parseCsv(
  filePath: string,
  opts: Partial<CommonCSVReaderOptions> = {},
) {
  const file = await Deno.open(filePath)

  let header: string[] = []
  let isFirstRow = true

  for await (const row of readCSV(file, opts)) {
    // Collecting data from the async iterable row into an array
    const rowDataArray: string[] = []
    for await (let cell of row) {
      if (cell.endsWith('\r')) {
        cell = cell.slice(0, cell.length - 1)
      }
      rowDataArray.push(cell)
    }

    if (isFirstRow) {
      if (rowDataArray.some((row) => row === '')) {
        throw new Error(
          `Error parsing ${filePath}. Check the header for extraneous trailing characters`,
        )
      }
      // Assuming the first row of the CSV contains the header
      header = rowDataArray
      isFirstRow = false
      continue
    }

    const rowData: Record<string, string | null> = {}

    let at_least_one_column_is_not_null = false
    header.forEach((column, i) => {
      const value = rowDataArray[i] || null
      rowData[column] = value
      if (value) {
        at_least_one_column_is_not_null = true
      }
    })

    if (at_least_one_column_is_not_null) {
      yield rowData
    }
  }

  file.close()
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
  filePath: string,
  opts: ParseTsvOptions = {},
) {
  for await (
    let row of parseCsv(filePath, { columnSeparator: '\t', ...opts })
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
  filePath: string,
  schema: Schema,
  opts: ParseTsvOptions = {},
): AsyncGenerator<z.infer<Schema>> {
  for await (
    const row of parseTsv(filePath, opts)
  ) {
    yield schema.parse(row)
  }
}
