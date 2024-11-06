import { PencilSquareIcon } from './icons/heroicons/outline.tsx'
import type { JSX } from 'preact/jsx-runtime'
import { assert } from 'std/assert/assert.ts'

export type DescriptionListCell = {
  value: string
  edit_href?: string
  leading_separator?: string
  italics?: boolean
}

export type EmptyRow = []

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
  const cell_elements: JSX.Element[] = []
  for (const cell of row) {
    cell.leading_separator && (
      cell_elements.push(<span>{cell.leading_separator}</span>)
    )
    const element = cell.edit_href
      ? (
        <a
          className={`inline-block ${cell.italics ? 'italic' : 'not-italic'}`}
          href={cell.edit_href}
        >
          {cell.value}
        </a>
      )
      : (
        <span className={cell.italics ? 'italic' : 'not-italic'}>
          {cell.value}
        </span>
      )
    cell_elements.push(element)
  }
  const row_element = <div>{cell_elements}</div>
  return (
    <>
      <div
        style={{ gridColumn: 2, gridRow: row_number }}
      >
        {row_element}
      </div>
      <div
        className='w-4 h-4 text-gray-500'
        style={{ gridColumn: 3, gridRow: row_number }}
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
      style={{ gridColumn: '1 / 3', gridRow: row_number }}
    >
    </div>
  )
}

function createEmptyRow(
  row_number: number,
  size: 'small' | 'large',
): JSX.Element {
  return (
    <div
      style={{
        gridColumn: '1 / 3',
        gridRow: row_number,
        height: size === 'large' ? 24 : 12,
      }}
    />
  )
}

export const DescriptionList = (
  { pages }: { pages: DescriptionListItemProps[] },
) => {
  const elements: JSX.Element[] = []
  let page_row_start: number = 0
  let page_row_end: number = 1

/*
  return (
    <>
      <div
        style={{ gridColumn: 2, gridRow: row_number }}
      >
        {row_element}
      </div>
      <div
        className='w-4 h-4 text-gray-500'
        style={{ gridColumn: 3, gridRow: row_number }}
      >
        <PencilSquareIcon />
      </div>
    </>
  )
*/

  for (const page of pages) {
    const titleElement = createTitleElement(page.title, page_row_start + 1, page_row_end)
    if (titleElement) elements.push(titleElement)
    page_row_start = page_row_end

    if (page.items.length === 0) {
      elements.push(
        <>
          <div
            className="italic"
            style={{ gridColumn: 2, gridRow: page_row_end }}
          >
            None provided
          </div>
          <div 
          className='w-4 h-4 text-gray-500'
          style={{ gridColumn: 3, gridRow: page_row_end }}
          >
            <PencilSquareIcon />
          </div>
        </>
      )
      page_row_end += 1
    } else {
      // Render each item in the page
      for (const [item_index, item] of page.items.entries()) {
        if (item_index) {
          elements.push(createEmptyRow(page_row_end, 'small'))
          page_row_end += 1
        }

        for (const row of item) {
          assert(row.length > 0, 'Empty row')
          const rowElement = createRowElement(row, page_row_end)
          if (rowElement) elements.push(rowElement)
          page_row_end += 1
        }
      }
    }

    page_row_start = page_row_end

    for (const section of page.sections) {
      const sectionTitleElement = createTitleElement(section.title, page_row_start, page_row_end)
      if (sectionTitleElement) elements.push(sectionTitleElement)
      page_row_start = page_row_end

      if (section.items.length === 0) {
        elements.push(
          <>
            <div
              className="italic"
              style={{ gridColumn: 2, gridRow: page_row_end }}
            >
              None provided
            </div>
            <div 
              className='w-4 h-4 text-gray-500'
              style={{ gridColumn: 3, gridRow: page_row_end }}
              >
                <PencilSquareIcon />
            </div>
          </>
        )
        page_row_end += 1
      } else {
        for (const item of section.items) {
          for (const row of item) {
            assert(row.length > 0, 'Empty row')
            const rowElement = createRowElement(row, page_row_end)
            if (rowElement) elements.push(rowElement)
            page_row_end += 1
          }
        }
      }
    }
    elements.push(createDividerElement(page_row_end))
    page_row_end += 1
  }

  return (
    <div
      className='grid gap-x-4 gap-y-0.5'
      style={{
        gridTemplateColumns: 'max-content max-content 20px',
        alignItems: 'start',
      }}
    >
      {elements}
    </div>
  )
}

