import { organizations } from '../../db/models/organizations.ts'
import { jsonSearchHandler } from '../../util/jsonSearchHandler.ts'
import OrganizationsTable from '../../components/superadmin/OrganizationsTable.tsx'
import { HealthWorkerHomePage } from './_middleware.tsx'
import { searchPage } from '../../util/searchPage.ts'
import Pagination from '../../components/library/Pagination.tsx'
import { SearchInput } from '../../islands/form/inputs/search.tsx'
import FilterBar from '../../components/dashboard/FilterBar.tsx'
import SelectInput from '../../components/dashboard/filters/SelectInput.tsx'
import type { LoggedInHealthWorkerContext } from '../../types.ts'

const json_handler = jsonSearchHandler(organizations)

export const handler = {
  GET(ctx: LoggedInHealthWorkerContext) {
    const accept = ctx.req.headers.get('accept') || ''
    if (accept.includes('application/json') || !accept.includes('text/html')) {
      return json_handler.GET(ctx)
    }

    return page_handler(ctx)
  },
}

const KIND_OPTIONS = [
  { value: 'physical', label: 'Physical' },
  { value: 'virtual', label: 'Virtual' },
] as const

const page_handler = HealthWorkerHomePage(async function Organizations(ctx: LoggedInHealthWorkerContext) {
  const search = ctx.url.searchParams.get('search') || undefined
  const category = ctx.url.searchParams.get('category') || null
  const country = ctx.url.searchParams.get('country') || null
  const kind = ctx.url.searchParams.get('kind') as 'physical' | 'virtual' | null
  const page = searchPage(ctx)

  const [{ results, has_next_page }, category_rows, country_rows] = await Promise.all([
    organizations.search(
      ctx.state.trx,
      { search, category: category ?? undefined, country: country ?? undefined, kind, include_all_countries: true },
      { page },
    ),
    ctx.state.trx
      .selectFrom('organizations')
      .select('category')
      .distinct()
      .where('category', 'is not', null)
      .orderBy('category')
      .execute(),
    ctx.state.trx
      .selectFrom('organizations')
      .select('country')
      .distinct()
      .orderBy('country')
      .execute(),
  ])

  const category_options = category_rows
    .filter((r) => r.category)
    .map((r) => ({ value: r.category!, label: r.category! }))

  const country_options = country_rows.map((r) => ({ value: r.country, label: r.country }))

  return {
    title: 'Organizations',
    children: (
      <>
        <FilterBar action={ctx.url.pathname}>
          <SearchInput value={search} />
          <SelectInput param='category' value={category} options={category_options} />
          <SelectInput param='country' value={country} options={country_options} />
          <SelectInput param='kind' value={kind} options={KIND_OPTIONS} />
        </FilterBar>
        <OrganizationsTable organizations={results} />
        <Pagination page={page} has_next_page={has_next_page} />
      </>
    ),
  }
})
