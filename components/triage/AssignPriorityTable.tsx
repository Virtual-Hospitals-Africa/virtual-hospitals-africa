import { assert } from 'std/assert/assert.ts'
import {
  Priority,
  TriageAssignPriorityTableVital,
  WithTriageLevelFinding,
} from '../../types.ts'
import cls from '../../util/cls.ts'
import Table, { TableColumn } from '../library/Table.tsx'
import { ReferenceRangeIndicator } from '../vitals/SimpleReferenceRangeIndicator.tsx'
import capitalize from '../../util/capitalize.ts'
import { colorFromPriorityOrScoreComponent } from '../../shared/vitals.ts'
import { PRIORITY_COLORS } from '../../shared/priorities.ts'

type TriageAssignPriorityTableProps = {
  vitals: TriageAssignPriorityTableVital[]
  with_triage_level_findings: WithTriageLevelFinding[]
  total_score: number
  priority: Priority
}

type Row =
  | ({
    type: 'vital'
  } & TriageAssignPriorityTableVital)
  | {
    type: 'with_triage_level_finding'
    finding: WithTriageLevelFinding
  }

const columns: TableColumn<Row>[] = [
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
        {capitalize(row.finding.displays.finding)}
      </div>
    ),
  },
  {
    label: 'Finding',
    type: 'content',
    data: (row) => (
      <div className='whitespace-nowrap text-sm text-gray-900'>
        {row.finding.displays.value}
      </div>
    ),
  },
  {
    label: 'Previous',
    type: 'content',
    data: (row) => (
      row.type === 'vital' && row.previous?.value != null && (
        <div className='whitespace-nowrap text-sm text-gray-500'>
          {row.previous?.value}
        </div>
      )
    ),
  },
  {
    label: 'Reference Range',
    type: 'content',
    data: (row) => {
      if (row.type !== 'vital') return null
      const { finding, previous, reference_ranges } = row
      if (!reference_ranges) return null
      assert(
        finding.value,
        `If there's a reference range there must be a value`,
      )
      assert(
        finding.value.type === 'measurement',
        `If there's a reference range there must be a value`,
      )
      assert(
        finding.value.value !== null,
        `If there's a reference range there must be a value`,
      )
      assert(
        finding.value.units,
        `If there's a reference range there must be a units`,
      )
      return (
        <ReferenceRangeIndicator
          units={finding.value.units}
          value={finding.value.value}
          previous_value={previous?.value?.type === 'measurement'
            ? previous.value.value
            : undefined}
          reference_ranges={reference_ranges}
        />
      )
    },
  },
  {
    label: 'TEWS',
    type: 'content',
    tdClassName: ({ finding: { score, priority } }) => {
      if (priority == null && score == null) return ''
      const colors = colorFromPriorityOrScoreComponent(score, priority)
      return cls(colors.bg, colors.text)
    },
    data: ({ finding: { score, priority } }) => {
      if (priority == null && score == null) return null

      return (
        <div className='whitespace-nowrap text-sm font-semibold text-gray-900 text-center'>
          {priority || score}
        </div>
      )
    },
  },
]

function ConclusionRow(
  { total_score, priority }: Pick<
    TriageAssignPriorityTableProps,
    'total_score' | 'priority'
  >,
) {
  const colors = PRIORITY_COLORS[priority]
  return (
    <div
      className={`${colors.bg} py-4 px-3 flex justify-between items-center border border-t-0 border-gray-200 rounded-b-lg`}
    >
      <div className='flex-1 text-center'>
        <span
          className={`text-xl ${colors.text} font-bold uppercase`}
        >
          {priority}
        </span>
      </div>
      <div className='text-center'>
        <span className={`text-lg font-bold ${colors.text}`}>
          Total: {total_score}
        </span>
      </div>
    </div>
  )
}

export function TriageAssignPriorityTable(
  { vitals, with_triage_level_findings, total_score, priority }:
    TriageAssignPriorityTableProps,
) {
  return (
    <div className='relative'>
      <Table
        columns={columns}
        rows={[
          ...with_triage_level_findings.map((finding) => ({
            type: 'with_triage_level_finding' as const,
            finding,
          })),
          ...vitals.map((vital) => ({
            type: 'vital' as const,
            ...vital,
          })),
        ]}
        tableClassName='border-b-0 !rounded-b-none'
        EmptyState={() => <div>No measurements available</div>}
      />
      <ConclusionRow {...{ total_score, priority }} />
    </div>
  )
}
