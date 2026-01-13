import * as cheerio from 'cheerio'
import { assert } from 'std/assert/assert.ts'

export function getGridDisplay(
  $: cheerio.CheerioAPI,
  selector: string,
): string[] {
  const grid = $(selector)

  assert(grid.length === 1, `Expected 1 element for selector "${selector}", found ${grid.length}`)
  assert(
    grid.hasClass('grid'),
    `Expected element "${selector}" to have class "grid", but found classes: "${grid.attr('class')}"`,
  )

  return grid.children().map(function () {
    return $(this).text()
  }).toArray()
}
