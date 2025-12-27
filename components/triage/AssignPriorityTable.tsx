import { assert } from 'std/assert/assert.ts'
import { TriageAssignPriorityTableVital } from '../../types.ts'
import cls from '../../util/cls.ts'
import Table, { TableColumn } from '../library/Table.tsx'
import { ReferenceRangeIndicator } from '../vitals/SimpleReferenceRangeIndicator.tsx'
import isString from '../../util/isString.ts'
import capitalize from '../../util/capitalize.ts'

export function TriageAssignPriorityTable({ vitals }: {
  vitals: TriageAssignPriorityTableVital[]
}) {
  const columns: TableColumn<TriageAssignPriorityTableVital>[] = [
    {
      label: 'Vital',
      type: 'content',
      data: (row) => (
        <div
          className={cls('whitespace-nowrap text-sm text-gray-900', {
            // 'font-normal': !row.is_computed,
            // 'font-bold': !!row.is_computed,
            // 'pl-4': !!row.is_component_of_computed,
          })}
        >
          {capitalize(row.current.finding_display)}
        </div>
      ),
    },
    {
      label: 'Finding',
      type: 'content',
      data: (row) => (
        <div className='whitespace-nowrap text-sm text-gray-900'>
          {row.current.value_display}
        </div>
      ),
    },
    {
      label: 'Previous',
      type: 'content',
      data: (row) => (
        <div className='whitespace-nowrap text-sm text-gray-500'>
          {row.previous?.value}
        </div>
      ),
    },
    {
      label: 'Vital Range Visualized',
      type: 'content',
      data: ({ current, previous, reference_range }) => {
        if (!reference_range) return null
        assert(
          current.value,
          `If there's a reference range there must be a value`,
        )
        assert(
          current.units,
          `If there's a reference range there must be a units`,
        )
        return (
          <ReferenceRangeIndicator
            value={isString(current.value)
              ? parseFloat(current.value)
              : current.value}
            previous_value={previous?.value == null ? undefined : (
              isString(previous.value)
                ? parseFloat(previous.value)
                : previous.value
            )}
            normal_min={reference_range.normal_min}
            normal_max={reference_range.normal_max}
            critical_min={reference_range.critical_min}
            critical_max={reference_range.critical_max}
            units={current.units}
          />
        )
      },
    },
    {
      label: 'TEWS',
      type: 'content',
      data: (row) => (
        <div className='whitespace-nowrap text-sm font-semibold text-gray-900 text-center'>
          {row.current.score}
        </div>
      ),
    },
  ]

  return (
    <div className='relative'>
      <Table
        columns={columns}
        rows={vitals}
        EmptyState={() => <div>No measurements available</div>}
      />
      {
        /* <div
        className={`${priority.colors.bg} pt-7 pb-4 px-3 flex justify-between items-center -mt-4 -mx-[1px] -z-10 relative sm:rounded-b-lg`}
      >
        <div className='flex-1 text-center'>
          <span
            className={`text-xl ${priority.colors.text} font-bold uppercase`}
          >
            {priority.label}
          </span>
        </div>
        <div className='text-center'>
          <span className={`text-lg font-bold ${priority.colors.text}`}>
            Total: {tews.total_score}
          </span>
        </div>
      </div> */
      }
    </div>
  )
}
