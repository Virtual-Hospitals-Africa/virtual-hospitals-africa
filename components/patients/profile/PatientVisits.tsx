import type { RenderedPatientEncounter } from '../../../types.ts'
import Table, { TableColumn } from '../../library/Table.tsx'
import { EmptyState } from '../../library/EmptyState.tsx'
import Badge from '../../library/Badge.tsx'
import { ClockIcon } from '../../library/icons/heroicons/outline.tsx'
import words from '../../../util/words.ts'
import FilterBar from '../../dashboard/FilterBar.tsx'
import SelectInput from '../../dashboard/filters/SelectInput.tsx'

type OrgLookup = Record<string, string>

type VisitRow = RenderedPatientEncounter & { id: string }

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
] as const

export default function PatientVisits(
  { encounters, org_names, status, action, organization_id, patient_id }: {
    encounters: RenderedPatientEncounter[]
    org_names: OrgLookup
    status: string | null
    action: string
    organization_id: string
    patient_id: string
  },
) {
  const rows: VisitRow[] = encounters.map((e) => ({ ...e, id: e.patient_encounter_id }))

  const columns: TableColumn<VisitRow>[] = [
    {
      label: 'Date',
      type: 'date',
      data: 'arrived_timestamp',
    },
    {
      label: 'Reason',
      data(row) {
        return row.reason ? words(row.reason).join(' ') : null
      },
    },
    {
      label: 'Status',
      data(row) {
        return row.status.open ? <Badge color='green' content='Open' /> : <Badge color='gray' content='Closed' />
      },
    },
    {
      label: 'Priority',
      data(row) {
        if (!row.priority) return null
        const colors: Record<string, 'red' | 'yellow' | 'green' | 'gray'> = {
          Emergency: 'red',
          'Very urgent': 'red',
          Urgent: 'yellow',
          'Non-urgent': 'green',
          Deceased: 'gray',
        }
        return <Badge color={colors[row.priority.name] ?? 'gray'} content={row.priority.name} />
      },
    },
    {
      label: 'Organization',
      data(row) {
        const name = org_names[row.organization_id]
        if (!name) return row.organization_id
        return (
          <a href={`/app/organizations/${row.organization_id}`} class='text-indigo-600 hover:text-indigo-900'>
            {name}
          </a>
        )
      },
    },
    {
      label: 'Actions',
      type: 'actions',
      data(row) {
        if (!row.status.open) return null
        return {
          text: 'Resume Encounter',
          href: `/app/organizations/${organization_id}/patients/${patient_id}/open_encounter`,
        }
      },
    },
  ]

  return (
    <>
      <FilterBar action={action}>
        <SelectInput param='status' value={status} options={STATUS_OPTIONS} />
      </FilterBar>
      <Table
        columns={columns}
        rows={rows}
        EmptyState={() => (
          <EmptyState
            header='No visits'
            explanation='This patient has no recorded visits'
            Icon={ClockIcon}
          />
        )}
      />
    </>
  )
}
