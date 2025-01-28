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
import { Button } from '../../components/library/Button.tsx'
import Dropdown, { DropdownItem } from '../../islands/Dropdown.tsx'

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

const getFilterUrl = (url: string, available?: boolean) => {
  const currentUrl = new URL(url)
  const params = currentUrl.searchParams
  if (available === undefined) {
    params.delete('available')
  } else {
    params.set('available', String(available))
  }
  return currentUrl.toString()
}

const getDropdownItems = (url: string): DropdownItem[] => [
  {
    title: 'Yes',
    href: getFilterUrl(url, true),
  },
  {
    title: 'No',
    href: getFilterUrl(url, false),
  },
  {
    title: 'All',
    href: getFilterUrl(url),
  },
]
export function OrganizationView(props: {
  current_url: string
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
        <Dropdown
          button={
            <Button
              className='d-flex items-center gap-1'
              variant='outline'
              size='sm'
              color='gray'
              type='button'
            >
              Accepting Patients
              <svg
                width='20'
                height='18'
                viewBox='0 0 20 18'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M18.3346 1.5H1.66797L8.33464 9.38333V14.8333L11.668 16.5V9.38333L18.3346 1.5Z'
                  stroke='currentColor'
                  stroke-width='1.66667'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                />
              </svg>
            </Button>
          }
          items={getDropdownItems(props.current_url)}
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
