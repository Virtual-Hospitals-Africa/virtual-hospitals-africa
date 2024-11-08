import type { JSX } from 'preact/jsx-runtime'
import { assert } from 'std/assert/assert.ts'
import DescriptionRow from '../../islands/summary/DescriptionRow.tsx'

export type DescriptionListCell = {
  value: string
  edit_href?: string
  className?: string
  leading_separator?: string
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
  link: string
  items: DescriptionListRows[]
  sections: DescriptionListSection[]
}

function createTitleElement(
  title: string,
  row_end_number: number,
  link?: string,
): JSX.Element {
  return (
    <a
      href={link}
      className={`text-lg rounded-md font-semibold text-left hover:text-indigo-900 hover:bg-indigo-50 hover:ring-indigo-50 ${
        link && 'hover:underline'
      } p-1`}
      style={{
        gridColumn: 1,
        gridRow: `${row_end_number}`,
      }}
    >
      <h3>
        {title}
      </h3>
    </a>
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
  let page_row_end: number = 1

  for (const page of pages) {
    elements.push(createTitleElement(page.title, page_row_end, page.link))

    if (page.items.length === 0 || page.items[0].length === 0) {
      elements.push(
        <DescriptionRow
          row={[{
            value: 'None Provided',
            edit_href: page.link,
            className: 'italic hover-desktop:underline',
          }]}
          row_number={page_row_end}
        />,
      )
      page_row_end += 1
    } else {
      for (const [item_index, item] of page.items.entries()) {
        for (const row of item) {
          assert(row.length > 0, 'Empty row')
          elements.push(<DescriptionRow row={row} row_number={page_row_end} />)
          page_row_end += 1
        }

        if (
          item_index === page.items.length - 1 && page.sections.length !== 0
        ) {
          elements.push(createEmptyRow(page_row_end, 'small'))
          page_row_end += 1
        }
      }
    }

    for (const [section_index, section] of page.sections.entries()) {
      elements.push(createTitleElement(section.title, page_row_end))

      if (section.items.length === 0 || section.items[0].length === 0) {
        elements.push(
          <DescriptionRow
            row={[{
              value: 'None Provided',
              edit_href: page.link,
              className: 'italic hover-desktop:underline',
            }]}
            row_number={page_row_end}
          />,
        )
        page_row_end += 1
      } else {
        for (const [item_index, item] of section.items.entries()) {
          for (const row of item) {
            assert(row.length > 0, 'Empty row')
            elements.push(
              <DescriptionRow row={row} row_number={page_row_end} />,
            )
            page_row_end += 1
          }

          if (
            section_index < page.sections.length - 1 &&
            item_index === section.items.length - 1
          ) {
            elements.push(createEmptyRow(page_row_end, 'large'))
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
        gridTemplateColumns: 'max-content max-content',
        alignItems: 'center',
      }}
    >
      {elements}
    </div>
  )
}
