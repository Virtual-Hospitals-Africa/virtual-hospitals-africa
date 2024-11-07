import { PencilSquareIcon } from '../../components/library/icons/heroicons/outline.tsx'
import type { DescriptionListCell } from '../../components/library/DescriptionList.tsx'
import { useState } from 'preact/hooks'

type RowElementProps = {
  row: DescriptionListCell[]
  row_number: number
}

export default function RowElement({ row, row_number }: RowElementProps) {
  const [isHoveredOnGroup, setIsHoveredOnGroup] = useState(false)
  const [hoveredCellIndex, setHoveredCellIndex] = useState(-1)

  return (
    <div
      style={{ gridColumn: 2, gridRow: row_number }}
      className='group flex justify-between content-center rounded-md hover:bg-indigo-50 hover:ring-indigo-50 p-2'
      onMouseOver={() => setIsHoveredOnGroup(true)}
      onMouseLeave={() => setIsHoveredOnGroup(false)}
    >
      <div className='group-hover:text-indigo-900 flex'>
        {row.map((cell, index) => {
          return (
            <div>
              {cell.leading_separator && <span>{cell.leading_separator}</span>}
              {cell.edit_href
                ? (
                  <a
                    style={{ display: 'inline-block' }}
                    onMouseOver={() => {
                      setHoveredCellIndex(index)
                    }}
                    onMouseLeave={() => {
                      setHoveredCellIndex(-1)
                    }}
                    className={`${hoveredCellIndex === index && 'underline'}`}
                    href={cell.edit_href}
                  >
                    {cell.value}
                  </a>
                )
                : (
                  <span>
                    {cell.value}
                  </span>
                )}
            </div>
          )
        })}
      </div>
      {isHoveredOnGroup && <PencilSquareIcon className='w-4 h-4' />}
    </div>
  )
}
