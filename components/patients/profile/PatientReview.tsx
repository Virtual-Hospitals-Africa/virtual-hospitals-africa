import type { JSX } from 'preact'
import Table, { TableColumn } from '../../library/Table.tsx'
import { EmptyState } from '../../library/EmptyState.tsx'
import Badge from '../../library/Badge.tsx'
import { DocumentTextIcon } from '../../library/icons/heroicons/outline.tsx'
import type { Existence, SnomedCategory } from '../../../db.d.ts'

export type ReviewRow = {
  id: string
  created_at: Date | string
  specific_snomed_concept_name: string
  root_snomed_concept_name: string
  root_snomed_concept_category: SnomedCategory
  existence: Existence
}

const category_color: Partial<Record<SnomedCategory, 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'>> = {
  finding: 'blue',
  disorder: 'red',
  procedure: 'purple',
  'observable entity': 'green',
  'body structure': 'yellow',
}

export default function PatientReview({ records }: { records: ReviewRow[] }): JSX.Element {
  const columns: TableColumn<ReviewRow>[] = [
    {
      label: 'Date',
      type: 'date',
      data: 'created_at',
    },
    {
      label: 'Record',
      data: 'specific_snomed_concept_name',
    },
    {
      label: 'Category',
      data(row) {
        const color = category_color[row.root_snomed_concept_category] ?? 'gray'
        return <Badge color={color} content={row.root_snomed_concept_category} />
      },
    },
    {
      label: 'Status',
      data(row) {
        if (row.existence === 'Yes') return <Badge color='green' content='Present' />
        if (row.existence === 'No') return <Badge color='gray' content='Absent' />
        return <Badge color='yellow' content='Unknown' />
      },
    },
  ]

  return (
    <Table
      columns={columns}
      rows={records}
      EmptyState={() => (
        <EmptyState
          header='No clinical records'
          explanation='This patient has no recorded clinical findings'
          Icon={DocumentTextIcon}
        />
      )}
    />
  )
}
