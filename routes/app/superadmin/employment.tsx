import { employment } from '../../../db/models/employment.ts'
import EmploymentTable from '../../../components/superadmin/EmploymentTable.tsx'
import { SuperadminPage } from './_middleware.tsx'
import { searchPage } from '../../../util/searchPage.ts'
import Pagination from '../../../components/library/Pagination.tsx'
import { SearchInput } from '../../../islands/form/inputs/search.tsx'
import FilterBar from '../../../components/dashboard/FilterBar.tsx'
import SelectInput from '../../../components/dashboard/filters/SelectInput.tsx'

const ROLE_OPTIONS = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'receptionist', label: 'Receptionist' },
] as const

const ADMIN_OPTIONS = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
] as const

export default SuperadminPage(async function Employment(ctx) {
  const search = ctx.url.searchParams.get('search') || undefined
  const role = ctx.url.searchParams.get('role') || null
  const is_admin_param = ctx.url.searchParams.get('is_admin')
  const is_admin = is_admin_param === 'true' ? true : is_admin_param === 'false' ? false : null
  const page = searchPage(ctx)

  const { results, has_next_page } = await employment.search(
    ctx.state.trx,
    { search, role, is_admin },
    { page },
  )

  return {
    title: 'Employment',
    children: (
      <>
        <FilterBar action={ctx.url.pathname}>
          <SearchInput value={search} />
          <SelectInput param='role' value={role} options={ROLE_OPTIONS} />
          <SelectInput param='is_admin' value={is_admin_param} options={ADMIN_OPTIONS} placeholder='All' />
        </FilterBar>
        <EmploymentTable rows={results} />
        <Pagination page={page} has_next_page={has_next_page} />
      </>
    ),
  }
})
