import { readCSV } from 'csv'

// TODO: Can't get last column properly, maybe because new line character
// So need a extra column in csv file
export default async function* parseCsv(filePath: string) {
  const file = await Deno.open(filePath)

  let header: string[] = []
  let isFirstRow = true

  for await (const row of readCSV(file)) {
    // Collecting data from the async iterable row into an array
    const rowDataArray: string[] = []
    for await (const cell of row) {
      rowDataArray.push(cell)
    }

    if (isFirstRow) {
      // Assuming the first row of the CSV contains the header
      header = rowDataArray
      isFirstRow = false
      continue
    }

    const rowData: Record<string, string> = {}

    header.forEach((column, i) => {
      rowData[column] = rowDataArray[i]
    })

    yield rowData
  }

  file.close()
}
