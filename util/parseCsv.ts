import { CommonCSVReaderOptions, readCSV } from 'csv'

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
      // Assuming the first row of the CSV contains the header
      header = rowDataArray
      isFirstRow = false
      continue
    }

    const rowData: Record<string, string | null> = {}

    header.forEach((column, i) => {
      rowData[column] = rowDataArray[i] || null
    })

    yield rowData
  }

  file.close()
}

export async function* parseTsv(
  filePath: string,
  opts: Omit<Partial<CommonCSVReaderOptions>, 'columnSeparator'> = {},
) {
  yield* parseCsv(filePath, { ...opts, columnSeparator: '\t' })
}
