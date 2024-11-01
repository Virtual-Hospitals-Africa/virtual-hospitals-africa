import { PencilSquareIcon } from './icons/heroicons/outline.tsx'
import { Maybe } from '../../types.ts'
import type { JSX } from 'preact/jsx-runtime'

export type DescriptionListCell = {
  value: string
  edit_href?: string
  leading_separator?: string
}

export type EmptyRow = []

// value: 'Present'
export type DescriptionListRow = DescriptionListCell[] | EmptyRow
export type DescriptionListRows = DescriptionListRow[]

type DescriptionListSection = {
  title: string
  items: DescriptionListRows[]
}

export type DescriptionListItemProps = {
  title: string
  items: DescriptionListRows[]
  sections: DescriptionListSection[]
}

function createRowElement(
  row: DescriptionListCell[],
  row_number: number,
): JSX.Element {
  if (row.length === 0) {
    return createEmptyRow(row_number)
  }
  const cell_elements: JSX.Element[] = []
  for (const cell of row) {
    cell.leading_separator && (
      cell_elements.push(<span>{cell.leading_separator}</span>)
    )
    cell.edit_href
      ? (
        cell_elements.push(
          <a
            style={{ display: 'inline-block' }}
            href={cell.edit_href}
          >
            {cell.value}
          </a>,
        )
      )
      : (
        cell_elements.push(
          <span>
            {cell.value}
          </span>,
        )
      )
  }
  const row_element = <div>{cell_elements}</div>
  return (
    <>
      <div
        className='grid gap-x-4 gap-y-0.5'
        style={{ gridColumn: 2, gridRow: `${row_number}` }}
      >
        {row_element}
      </div>
      <div
        className='grid gap-x-4 gap-y-0.5 w-4 h-4 text-gray-500'
        style={{ gridColumn: 3, gridRow: `${row_number}` }}
      >
        <PencilSquareIcon />
      </div>
    </>
  )
}

function createTitleElement(
  title: string,
  row_start_number: number,
  row_end_number: number,
): JSX.Element {
  return (
    <h3
      className='text-lg font-semibold text-left'
      style={{
        gridColumn: 1,
        gridRow: `${row_start_number} / ${row_end_number}`,
      }}
    >
      {title}
    </h3>
  )
}

function createDividerElement(row_number: number): JSX.Element {
  return (
    <div
      className='border-b border-gray-200 mt-2 mb-2'
      style={{ gridColumn: '1 / 3', gridRow: `${row_number}` }}
    >
    </div>
  )
}

function createEmptyRow(row_number: number): JSX.Element {
  return (
    <div
      style={{ gridColumn: '1 / 3', gridRow: `${row_number}`, height: 24 }}
    />
  )
}

export const DescriptionList = (
  { pages }: { pages: DescriptionListItemProps[] },
) => {
  const elements: JSX.Element[] = []
  let page_row_start: number = 0
  let page_row_end: number = 1
  for (const [page_index, page] of pages.entries()) {
    for (const [item_index, item] of page.items.entries()) {
      for (const [row_index, row] of item.entries()) {
        if (row.length === 0) {
          console.log('empty row')
        }
        elements.push(createRowElement(row, page_row_end))
        page_row_end += 1
      }
    }
    elements.push(
      createTitleElement(page.title, page_row_start + 1, page_row_end),
    )
    page_row_start = page_row_end

    if (page.sections.length > 0) {
      page_row_end += 1
      elements.push(createEmptyRow(page_row_end))
      page_row_end += 1
      page_row_start = page_row_end
    }

    for (const [section_index, section] of page.sections.entries()) {
      for (const [item_index, item] of section.items.entries()) {
        for (const [row_index, row] of item.entries()) {
          if (row.length === 0) {
            console.log('empty row')
          }
          elements.push(createRowElement(row, page_row_end))
          page_row_end += 1
        }
      }
      elements.push(
        createTitleElement(section.title, page_row_start, page_row_end),
      )
      page_row_start = page_row_end
    }
    elements.push(createDividerElement(page_row_end))
    page_row_end += 1
  }

  return (
    <div
      className='grid gap-x-4 gap-y-0.5'
      style={{
        gridTemplateColumns: 'auto 1fr 20px',
        alignItems: 'start',
      }}
    >
      {elements}
    </div>
  )
}
