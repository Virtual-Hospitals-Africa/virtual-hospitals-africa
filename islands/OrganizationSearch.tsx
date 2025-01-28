import { Maybe } from '../types.ts'
import AsyncSearch from './AsyncSearch.tsx'
import { NearestOrganizationSearchResult } from '../db/models/nearest_organizations.ts'

export default function OrganizationSearch(
  {
    name,
    url = '/app/organizations',
    filters = {},
    sort,
    label,
    required,
    do_not_render_built_in_options,
    onUpdate,
  }: {
    name: string
    url?: string
    label?: string
    value?: Maybe<NearestOrganizationSearchResult>
    filters?: {
      accepting_patients?: boolean
      is_physical?: boolean
    }
    sort: {
      by: 'nearest'
      direction: 'asc' | 'desc'
    }
    onSelect?: (selected: NearestOrganizationSearchResult) => void
    required?: boolean
    do_not_render_built_in_options?: boolean
    onUpdate?(values: {
      current_page: {
        results: NearestOrganizationSearchResult[]
        page: number
      }
    }): void
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
      do_not_render_built_in_options={do_not_render_built_in_options}
      onUpdate={onUpdate}
      label={label}
      placeholder='Find an organization'
    />
  )
}
