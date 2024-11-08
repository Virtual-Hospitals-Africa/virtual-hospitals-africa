import { PencilSquareIcon } from '../../components/library/icons/heroicons/outline.tsx'
import type { DescriptionListCell } from '../../components/library/DescriptionList.tsx'
import { useState } from 'preact/hooks'
import cls from '../../util/cls.ts'

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
      className='group flex justify-between content-center rounded-md hover-desktop:bg-indigo-50 hover-desktop:ring-indigo-50 p-1'
      onMouseOver={() => setIsHoveredOnGroup(true)}
      onMouseLeave={() => setIsHoveredOnGroup(false)}
    >
      <div className='hover-desktop:text-indigo-900 flex content-center'>
        {row.length > 0
          ? row.map((cell, index) => {
            return (
              <div key={index}>
                {cell?.leading_separator === ' '
                  ? <span>&nbsp;</span>
                  : <span>&nbsp;{cell.leading_separator}</span>}
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
                      className={cls(
                        hoveredCellIndex === index && 'underline',
                        cell.className,
                      )}
                      href={cell.edit_href}
                    >
                      {cell.value}
                    </a>
                  )
                  : <span className={cell.className}>{cell.value}</span>}
              </div>
            )
          })
          : (
            <span className='italic hover-desktop:underline'>
              None Provided
            </span>
          )}
      </div>
      <PencilSquareIcon
        className={`self-center w-4 h-4 ${
          isHoveredOnGroup ? 'transition duration-120 opacity-1' : 'opacity-0'
        } show-on-mobile lg:block`}
      />
    </div>
  )
}
