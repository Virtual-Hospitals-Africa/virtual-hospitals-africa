import { Maybe, OrganizationSortOptions } from '../types.ts'
import AsyncSearch from './AsyncSearch.tsx'
import { NearestOrganizationSearchResult } from '../db/models/nearest_organizations.ts'

export default function OrganizationSearch(
  {
    name = 'organization',
    url = '/app/organizations',
    filters = {},
    sort,
    label,
    value,
    required,
    do_not_render_built_in_options,
    onSearchResults,
  }: {
    name?: string
    url?: string
    label?: string
    value?: Maybe<NearestOrganizationSearchResult>
    filters?: {
      specialties?: Array<string>
      is_physical?: boolean
      is_test?: boolean
    }
    sort?: {
      by: OrganizationSortOptions
      direction: 'asc' | 'desc'
    }
    required?: boolean
    do_not_render_built_in_options?: boolean
    onSelect?: (selected: NearestOrganizationSearchResult) => void
    onSearchResults?(values: {
      current_page: {
        results: NearestOrganizationSearchResult[]
        page: number
      }
    }): void
  },
) {
  const params = new URLSearchParams()
  for (const name in filters) {
    const key = name as keyof typeof filters
    const values = Array.isArray(filters[key]) ? filters[key] : [filters[key]]
    if (values.length === 0) continue
    params.set(name, values.join(','))
  }
  if (sort) {
    params.set('sort_by', sort.by)
    params.set('sort_direction', sort.direction)
  }

  const search_route = url.includes('?')
    ? `${url}&${params}`
    : `${url}?${params}`

  return (
    <AsyncSearch
      name={name}
      search_route={search_route}
      required={required}
      do_not_render_built_in_options={do_not_render_built_in_options}
      onSearchResults={onSearchResults}
      label={label}
      placeholder='Find an organization'
      value={value}
    />
  )
}
