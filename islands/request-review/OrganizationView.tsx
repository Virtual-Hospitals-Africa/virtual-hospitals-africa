import { useSignal } from '@preact/signals'
import { DOCTOR_SPECIALTIES } from '../../types.ts'
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
import Filter, { Option } from '../../islands/Filter.tsx'

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

enum SortOptions {
  Closest = 'Closest',
  ShortestWaitingTime = 'Shortest Waiting Time',
}

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

  const search_url = useSignal(props.search_url)
  const sort = useSignal<SortOptions>(SortOptions.Closest)
  const filters = useSignal<Set<string>>(new Set())

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

  const getSortItems = (): DropdownItem[] => {
    return Object.values(SortOptions).map((option) => ({
      title: option,
      selected: sort.value === option,
      onClick: () => {
        sort.value = option
      },
    }))
  }

  const updateFilter = (newValue: string, filters: Set<string>) => {
    if (filters.has(newValue)) {
      filters.delete(newValue)
    } else {
      filters.add(newValue)
    }
    return new Set([...filters])
  }

  const getAcceptedPatientFilterItems = (
    selectedFilters: Set<string>,
  ): Option<string>[] => {
    return DOCTOR_SPECIALTIES.map((specialty) => ({
      value: specialty,
      label: specialty,
      checked: selectedFilters.has(specialty),
      onChanged: (newValue) => {
        filters.value = updateFilter(newValue, filters.value)
      },
    }))
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
      <div className='grid grid-cols-[1fr_auto_156px] gap-2'>
        <OrganizationSearch
          name='review_request.organization'
          url={search_url.value}
          value={null}
          // value={review_request.value?.organization}
          sort={{
            by: sort.value,
            direction: 'asc',
          }}
          filters={{
            specialties: [...filters.value],
          }}
          onUpdate={(organization_results) => {
            organizations.value = organization_results.current_page.results
            checkHash()
          }}
          do_not_render_built_in_options
        />
        <Filter
          id='specialties'
          name='specialties'
          options={getAcceptedPatientFilterItems(filters.value)}
        />
        <Dropdown
          button={
            <Button
              className='d-flex items-center gap-2 w-full'
              variant='outline'
              size='sm'
              color='gray'
              type='button'
            >
              <p className='truncate flex-1'>
                {sort.value}
              </p>
              <svg
                width='16'
                height='14'
                viewBox='0 0 16 14'
                fill='currentColor'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path d='M1 0C0.734784 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734784 0 1C0 1.26522 0.105357 1.51957 0.292893 1.70711C0.48043 1.89464 0.734784 2 1 2H12C12.2652 2 12.5196 1.89464 12.7071 1.70711C12.8946 1.51957 13 1.26522 13 1C13 0.734784 12.8946 0.48043 12.7071 0.292893C12.5196 0.105357 12.2652 0 12 0H1ZM1 4C0.734784 4 0.48043 4.10536 0.292893 4.29289C0.105357 4.48043 0 4.73478 0 5C0 5.26522 0.105357 5.51957 0.292893 5.70711C0.48043 5.89464 0.734784 6 1 6H6C6.26522 6 6.51957 5.89464 6.70711 5.70711C6.89464 5.51957 7 5.26522 7 5C7 4.73478 6.89464 4.48043 6.70711 4.29289C6.51957 4.10536 6.26522 4 6 4H1ZM1 8C0.734784 8 0.48043 8.10536 0.292893 8.29289C0.105357 8.48043 0 8.73478 0 9C0 9.26522 0.105357 9.51957 0.292893 9.70711C0.48043 9.89464 0.734784 10 1 10H5C5.26522 10 5.51957 9.89464 5.70711 9.70711C5.89464 9.51957 6 9.26522 6 9C6 8.73478 5.89464 8.48043 5.70711 8.29289C5.51957 8.10536 5.26522 8 5 8H1ZM11 13C11 13.2652 11.1054 13.5196 11.2929 13.7071C11.4804 13.8946 11.7348 14 12 14C12.2652 14 12.5196 13.8946 12.7071 13.7071C12.8946 13.5196 13 13.2652 13 13V7.414L14.293 8.707C14.4816 8.88916 14.7342 8.98995 14.9964 8.98767C15.2586 8.9854 15.5094 8.88023 15.6948 8.69482C15.8802 8.50941 15.9854 8.2586 15.9877 7.9964C15.99 7.7342 15.8892 7.4816 15.707 7.293L12.707 4.293C12.5195 4.10553 12.2652 4.00021 12 4.00021C11.7348 4.00021 11.4805 4.10553 11.293 4.293L8.293 7.293C8.19749 7.38525 8.12131 7.49559 8.0689 7.6176C8.01649 7.7396 7.9889 7.87082 7.98775 8.0036C7.9866 8.13638 8.0119 8.26806 8.06218 8.39095C8.11246 8.51385 8.18671 8.6255 8.28061 8.71939C8.3745 8.81329 8.48615 8.88754 8.60905 8.93782C8.73194 8.9881 8.86362 9.0134 8.9964 9.01225C9.12918 9.0111 9.2604 8.98351 9.3824 8.9311C9.50441 8.87869 9.61475 8.80251 9.707 8.707L11 7.414V13Z' />
              </svg>
            </Button>
          }
          items={getSortItems()}
        />
      </div>
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
