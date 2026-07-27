import { health_workers } from '../../db/models/health_workers.ts'
import HealthWorkersTable from '../../components/superadmin/HealthWorkersTable.tsx'
import { HealthWorkerHomePage } from './_middleware.tsx'
import { searchPage } from '../../util/searchPage.ts'
import Pagination from '../../components/library/Pagination.tsx'
import { SearchInput } from '../../islands/form/inputs/search.tsx'
import FilterBar from '../../components/dashboard/FilterBar.tsx'
import SelectInput from '../../components/dashboard/filters/SelectInput.tsx'
import type { LoggedInHealthWorkerContext } from '../../types.ts'

const ROLE_OPTIONS = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'receptionist', label: 'Receptionist' },
] as const

export default HealthWorkerHomePage(async function HealthWorkers(ctx: LoggedInHealthWorkerContext) {
  const search = ctx.url.searchParams.get('search') || undefined
  const role = ctx.url.searchParams.get('role') || null
  const organization_id = ctx.url.searchParams.get('organization_id') || undefined
  const page = searchPage(ctx)

  const org_options = ctx.state.health_worker.organizations.map((o) => ({
    value: o.id,
    label: o.name,
  }))

  const { results, has_next_page } = await health_workers.search(
    ctx.state.trx,
    {
      search,
      roles: role ? [role] : undefined,
      organization_id,
    },
    { page },
  )

  return {
    title: 'Health Workers',
    children: (
      <>
        <FilterBar action={ctx.url.pathname}>
          <SearchInput value={search} />
          <SelectInput param='role' value={role} options={ROLE_OPTIONS} />
          {org_options.length > 1 && (
            <SelectInput param='organization_id' value={organization_id ?? null} options={org_options} placeholder='All Organizations' />
          )}
        </FilterBar>
        <HealthWorkersTable health_workers={results} />
        <Pagination page={page} has_next_page={has_next_page} />
      </>
    ),
  }
})
