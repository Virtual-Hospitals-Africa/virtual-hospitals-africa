import { patients } from '../../../db/models/patients.ts'
import PatientsTable from '../../../components/superadmin/PatientsTable.tsx'
import { SuperadminPage } from './_middleware.tsx'
import { searchPage } from '../../../util/searchPage.ts'
import Pagination from '../../../components/library/Pagination.tsx'
import { SearchInput } from '../../../islands/form/inputs/search.tsx'
import FilterBar from '../../../components/dashboard/FilterBar.tsx'
import SelectInput from '../../../components/dashboard/filters/SelectInput.tsx'

const SEX_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
] as const

const REGISTRATION_OPTIONS = [
  { value: 'complete', label: 'Complete' },
  { value: 'incomplete', label: 'Incomplete' },
] as const

export default SuperadminPage(async function Patients(ctx) {
  const search = ctx.url.searchParams.get('search') || undefined
  const sex = ctx.url.searchParams.get('sex') || null
  const registration_status = ctx.url.searchParams.get('registration_status') as 'complete' | 'incomplete' | null
  const page = searchPage(ctx)

  const { results, has_next_page } = await patients.search(
    ctx.state.trx,
    { search, include_incomplete_registration: true, sex, registration_status },
    { page },
  )

  return {
    title: 'Patients',
    children: (
      <>
        <FilterBar action={ctx.url.pathname}>
          <SearchInput value={search} />
          <SelectInput param='sex' value={sex} options={SEX_OPTIONS} />
          <SelectInput param='registration_status' value={registration_status} options={REGISTRATION_OPTIONS} placeholder='All' />
        </FilterBar>
        <PatientsTable patients={results} />
        <Pagination page={page} has_next_page={has_next_page} />
      </>
    ),
  }
})
