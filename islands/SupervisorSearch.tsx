import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'
import PersonSearch from './PersonSearch.tsx'

export default function SupervisorSearch(
  props: Omit<AsyncSearchProps, 'Option' | 'href'>,
) {
  return <PersonSearch
  name='pharmacist'
  href='/regulator/supervisors'
  label='Supervisor'
  addable
  />
}
