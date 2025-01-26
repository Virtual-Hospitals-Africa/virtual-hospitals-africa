import { useSignal } from '@preact/signals'
import FormRow from '../../components/library/FormRow.tsx'
import OrganizationSearch from '../OrganizationSearch.tsx'
import { NearestOrganizationSearchResult } from '../../db/models/nearest_organizations.ts'
import Table, {
  ExtendedActionData,
  TableColumn,
} from '../../components/library/Table.tsx'
import AvatarGroup from '../../components/library/AvatarGroup.tsx'
import { useEffect } from 'preact/hooks'
import { RequestingOrganizationDialog } from './OrganizationDialog.tsx'
import { OrganizationCard } from './OrganizationCard.tsx'
import { EncounterContext } from '../../routes/app/patients/[patient_id]/encounters/[encounter_id]/_middleware.tsx'

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
      return {
        text: 'review',
        href: `#request_review_from_organization_id=${row.id}`,
      }
    },
  },
]

export default function OrganizationsTable(
  { organizations }: {
    organizations: NearestOrganizationSearchResult[]
  },
) {
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

export function OrganizationView(props: {
  search_url: string
  concerning_patient: EncounterContext['state']['patient']
  organizations: NearestOrganizationSearchResult[]
}) {
  const organizations = useSignal(props.organizations)
  const requesting_organization = useSignal<
    NearestOrganizationSearchResult | null
  >(null)

  function checkHash() {
    const params = new URLSearchParams('?' + self.location.hash.slice(1))
    const request_review_from_organization_id = params.get(
      'request_review_from_organization_id',
    )
    requesting_organization.value = (request_review_from_organization_id &&
      organizations.value.find((o) =>
        o.id === request_review_from_organization_id
      )) || null
  }

  useEffect(() => {
    self.addEventListener('hashchange', checkHash)
    checkHash()
    return () => {
      self.removeEventListener('hashchange', checkHash)
    }
  }, [])

  return (
    <div className='flex flex-col w-full gap-2'>
      <FormRow>
        <OrganizationSearch
          name='review_request.organization'
          url={props.search_url}
          value={null}
          // value={review_request.value?.organization}
          sort={{
            by: 'nearest',
            direction: 'asc',
          }}
          filters={{
            accepting_patients: true,
          }}
          onUpdate={(organization_results) => {
            organizations.value = organization_results.current_page.results
            checkHash()
          }}
        />
      </FormRow>
      <OrganizationsTable
        organizations={organizations.value}
      />
      <RequestingOrganizationDialog
        requesting_organization={requesting_organization.value ?? undefined}
        concerning_patient={props.concerning_patient}
      />
    </div>
  )
}
