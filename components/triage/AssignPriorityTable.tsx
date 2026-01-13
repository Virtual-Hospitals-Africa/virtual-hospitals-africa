import { assert } from 'std/assert/assert.ts'
import { Priority, RenderedFindingRelativeToHealthWorker, TriageAssignPriorityTableRow } from '../../types.ts'
import cls from '../../util/cls.ts'
import Table, { TableColumn } from '../library/Table.tsx'
import { ReferenceRangeIndicator } from '../vitals/SimpleReferenceRangeIndicator.tsx'
import capitalize from '../../util/capitalize.ts'
import { colorFromPriorityOrScoreComponent } from '../../shared/vitals.ts'
import { PRIORITY_COLORS } from '../../shared/priorities.ts'
import findMatching from '../../util/findMatching.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'

type TriageAssignPriorityTableProps = {
  vitals: TriageAssignPriorityTableRow[]
  with_triage_level_findings: RenderedFindingRelativeToHealthWorker[]
  total_score: number
  priority: Priority
}

function assessmentDisplay(row: TriageAssignPriorityTableRow) {
  if (row.type === 'assessment') {
    return findMatching(row.finding.evaluations, (evaluation) => evaluation.value?.type === 'score').displays.finding
  }
  if (row.type === 'measurement') {
    return row.finding.displays.finding
  }
  if (row.finding.as_part_of_procedure.workflow_step_name) {
    return row.finding.as_part_of_procedure.workflow_step_name
  }
  throw new Error(humanReadableJson(row))
}

const columns: TableColumn<TriageAssignPriorityTableRow>[] = [
  {
    label: 'Assessment',
    type: 'content',
    tdClassName: 'max-w-12 word-break',
    data: (row, index, rows) => {
      const display = assessmentDisplay(row)
      const prior_row_display = index && assessmentDisplay(rows[index - 1])
      if (display === prior_row_display) return null
      return capitalize(display)
    },
  },
  {
    label: 'Finding',
    type: 'content',
    data: (row) => (
      row.finding.displays.value || row.finding.displays.finding
    ),
  },
  {
    label: 'Previous',
    type: 'content',
    data: (row) => (
      row.previous?.value
    ),
  },
  {
    label: 'Reference Range',
    type: 'content',
    headerClassName: 'text-center!',
    tdClassName: 'py-1! grid place-items-center min-w-75',
    // cellClassName: 'min-h-12 max-h-16',
    no_wrapper: true,
    data: (row) => {
      const { finding, previous, reference_ranges } = row
      if (!reference_ranges) return null
      assert(
        finding.value,
        `If there's a reference range there must be a value`,
      )
      assert(
        finding.value.type === 'measurement',
        `If there's a reference range there must be a measurement`,
      )
      assert(
        finding.value.value !== null,
        `If there's a reference range there must be a measurement value`,
      )
      assert(
        finding.value.units,
        `If there's a reference range there must be a units`,
      )
      return (
        <ReferenceRangeIndicator
          units={finding.value.units}
          value={finding.value.value}
          previous_value={previous?.value?.type === 'measurement' ? previous.value.value : undefined}
          reference_ranges={reference_ranges}
        />
      )
    },
  },
  {
    label: 'Priority / Score',
    type: 'content',

    headerClassName: 'text-center!',
    tdClassName: ({ finding: { score, priority } }) => {
      if (priority == null && score == null) return ''
      const colors = colorFromPriorityOrScoreComponent(score, priority)
      return cls(colors.bg, colors.text)
    },
    cellClassName: 'text-center font-semibold',
    data: ({ finding: { priority, score } }) => priority || score,
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
  { vitals, with_triage_level_findings, total_score, priority }: TriageAssignPriorityTableProps,
) {
  const rows: TriageAssignPriorityTableRow[] = [
    ...with_triage_level_findings.map((finding) => ({
      type: 'chief complaint/warning sign' as const,
      previous: null, // TODO populate this from last encounter
      finding,
    })),
    ...vitals,
  ]
  return (
    <div className='relative'>
      <Table
        columns={columns}
        rows={rows}
        tableClassName='border-b-0 !rounded-b-none'
        EmptyState={() => <div>No measurements available</div>}
      />
      <ConclusionRow {...{ total_score, priority }} />
    </div>
  )
}
