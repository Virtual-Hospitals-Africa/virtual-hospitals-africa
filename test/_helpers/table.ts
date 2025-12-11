import * as cheerio from 'cheerio'
import { assert } from 'std/assert/assert.ts'

type TableDisplay = Record<string, string | string[]>[]

export function getTableDisplay(
  $: cheerio.CheerioAPI,
  selector?: string,
): TableDisplay {
  const tables = $(selector || 'table')
  assert(
    tables.length === 1,
    `Expected exactly one table, found ${tables.length}`,
  )

  const table = tables.first()
  const columns: string[] = []
  table.find('th').each((_i, th) => {
    columns.push($(th).text())
  })

  const rows: TableDisplay = []
  table.find('tbody tr').each((_i, tr) => {
    const row: Record<string, string> = {}
    $(tr).find('td').each((i, td) => {
      const column = columns[i]
      assert(column, `No column header for index ${i}`)
      row[column] = $(td).text()
    })
    rows.push(row)
  })

  return rows
}
