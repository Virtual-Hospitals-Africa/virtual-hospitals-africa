import { NearestOrganizationSearchResult } from '../../db/models/nearest_organizations.ts'
import Table, {
  ExtendedActionData,
  TableColumn,
} from '../../components/library/Table.tsx'
import AvatarGroup from '../../components/library/AvatarGroup.tsx'
import { OrganizationCard } from './OrganizationCard.tsx'

const columns: TableColumn<NearestOrganizationSearchResult>[] = [
  {
    label: 'Organization',
    data: (row) => <OrganizationCard organization={row} />,
    cellClassName: 'mb-1 font-medium',
  },
  {
    label: 'Status',
    data: 'status',
  },
  {
    label: 'Doctors Available',
    data(row) {
      return (
        <AvatarGroup
          people={row.doctors.slice(0, 3)}
          plus_count={row.doctors.length - 3}
        />
      )
    },
  },
  {
    label: 'Actions',
    type: 'actions',
    data(row): ExtendedActionData {
      console.log('ewlkekwllkew')
      return {
        text: 'request review',
        href: `#request_review_from_organization_id=${row.id}`,
      }
    },
  },
]

export function OrganizationsTable(
  { organizations }: {
    organizations: NearestOrganizationSearchResult[]
  },
) {
  console.log('ZZZZZ', { organizations })
  return (
    <Table
      columns={columns}
      rows={organizations}
      EmptyState={() => (
        <p>No matching organizations found with those criteria.</p>
      )}
    />
  )
}
