import { Maybe } from '../types.ts'
import AsyncSearch from './AsyncSearch.tsx'
import cls from '../util/cls.ts'

// TODO @mike implementing the info on the card
function OrganizationCard<T>({ option: organization, selected }: {
  option: {
    id: string
    name: string
    address: string
    location: {
      latitude: number
      longitude: number
    }
    distance_meters: number
    google_maps_link: string
  }
  selected: boolean
}) {
  return (
    <a href={`#request_review_from_organization_id=${organization.id}`}>
      <div className='flex flex-col'>
        <div className={cls('text-base', selected && 'font-bold')}>
          {organization.name}
        </div>
        <div className={cls('text-xs', selected && 'font-bold')}>
          {organization.address} {organization.distance_meters}{' '}
          {organization.google_maps_link}
        </div>
      </div>
    </a>
  )
}

export default function OrganizationSearch(
  {
    name,
    url = '/app/organizations',
    filters = {},
    sort,
    label = 'Virtual Organization',
    required,
  }: {
    name: string
    url?: string
    label?: string
    value?: Maybe<{
      id: string
      name: string
      address: string | null
    }>
    filters?: {
      accepting_patients?: boolean
      is_physical?: boolean
    }
    sort: {
      by: 'nearest'
      direction: 'asc' | 'desc'
    }
    onSelect?: (selected: { id: string; name: string; address: string }) => void
    required?: boolean
  },
) {
  const params = new URLSearchParams()
  for (const name in filters) {
    params.set(name, 'true')
  }
  params.set('sort_by', sort.by)
  params.set('sort_direction', sort.direction)

  const search_route = `${url}?${params}`
  console.log({ search_route })
  return (
    <AsyncSearch
      name={name}
      label={label}
      // deno-lint-ignore no-explicit-any
      Option={OrganizationCard as any}
      search_route={search_route}
      // onSelect={(selected) => {
      //   if (selected && props.kind === 'physical') {
      //     assert(selected.address)
      //   }
      //   return props.onSelect?.(
      //     selected as HasStringId<{ name: string; address: string }>,
      //   )
      // }}
      required={required}
    />
  )
}
