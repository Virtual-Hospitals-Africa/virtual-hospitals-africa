import { CommonCSVReaderOptions, readCSV } from 'csv'
import { assertAllNotNull } from './assertAll.ts';

export default async function* parseCsv(
  filePath: string,
  opts: Partial<CommonCSVReaderOptions> = {},
) {
  const file = await Deno.open(filePath)

  let header: string[] = []
  let isFirstRow = true

  for await (const row of readCSV(file, opts)) {
    // Collecting data from the async iterable row into an array
    const rowDataArray: Array<string | null> = []
    for await (const cell of row) {
      rowDataArray.push(cell)
    }

    if (isFirstRow) {
      // Assuming the first row of the CSV contains the header
      assertAllNotNull(rowDataArray)
      header = rowDataArray
      isFirstRow = false
      continue
    }

    
    const rowData: Record<string, string | null> = {}
    header.forEach((column, i) => {
      const value = rowDataArray[i]
      rowData[column] = value !== '' ? value : null
    })
    console.log('rowData', rowData)

    yield rowData
  }

  file.close()
}
