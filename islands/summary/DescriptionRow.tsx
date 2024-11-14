import { useState } from 'preact/hooks'
import cls from '../../util/cls.ts'
import type { DescriptionListCell } from '../../components/library/DescriptionList.tsx'
import { DescriptionListCellAction } from '../../components/library/DescriptionList.tsx'
import { PencilSquareIcon } from '../../components/library/icons/heroicons/outline.tsx'
import capitalize from '../../util/capitalize.ts'
import { assert } from 'std/assert/assert.ts'
import { EyeIcon } from '../../components/library/icons/heroicons/solid.tsx'

type DescriptionRowProps = {
  row: DescriptionListCell[]
  row_number: number
}

export default function DescriptionRow(
  { row, row_number }: DescriptionRowProps,
) {
  const [isHoveredOnGroup, setIsHoveredOnGroup] = useState(false)
  const [hoveredCellIndex, setHoveredCellIndex] = useState(-1)
  const [first_cell] = row
  assert(first_cell, 'DescriptionRow must have at least one cell')
  const first_edit_href = first_cell.href
  assert(first_edit_href, 'First cell of DescriptionRow must have edit_href')

  return (
    <div style={{ gridColumn: 2, gridRow: row_number }}>
      <div
        role='button'
        className='group flex justify-between content-center rounded-md hover-desktop:bg-indigo-50 hover-desktop:ring-indigo-50 p-1 w-max'
        onMouseOver={() => setIsHoveredOnGroup(true)}
        onMouseLeave={() => setIsHoveredOnGroup(false)}
        onClick={() => self.location.href = first_edit_href}
      >
        <div className='hover-desktop:text-indigo-900 flex content-center'>
          {row.map((cell, index) => (
            <div key={index}>
              {cell.leading_separator}
              {cell.href
                ? (
                  <a
                    title={`${capitalize(cell.action || 'view')} ${
                      capitalize(cell.name)
                    }`}
                    style={{ display: 'inline-block' }}
                    onMouseOver={() => setHoveredCellIndex(index)}
                    onMouseLeave={() => setHoveredCellIndex(-1)}
                    className={cls(
                      hoveredCellIndex === index && 'underline',
                      cell.className,
                    )}
                    href={cell.href}
                  >
                    {cell.value}
                  </a>
                )
                : <span className={cell.className}>{cell.value}</span>}
            </div>
          ))}
        </div>
        {first_cell.action === DescriptionListCellAction.Edit && (
          <PencilSquareIcon
            className={cls(
              'self-center w-4 h-4 show-on-mobile lg:block',
              isHoveredOnGroup
                ? 'transition duration-120 opacity-1'
                : 'opacity-0',
            )}
          />
        )}
        {first_cell.action === DescriptionListCellAction.View && (
          <EyeIcon
            className={cls(
              'self-center w-4 h-4 show-on-mobile lg:block',
              isHoveredOnGroup
                ? 'transition duration-120 opacity-1'
                : 'opacity-0',
            )}
          />
        )}
      </div>
    </div>
  )
}
