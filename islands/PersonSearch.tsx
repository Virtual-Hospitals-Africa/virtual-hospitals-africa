import { Person, PersonData } from '../components/library/Person.tsx'
import AsyncSearch, { AsyncSearchPropsSingular } from './AsyncSearch.tsx'

function PersonOption({
  option,
  selected,
}: {
  option: PersonData & { name: string }
  selected: boolean
}) {
  return <Person person={option} bold={selected} />
}

export default function PersonSearch(
  props: Omit<
    AsyncSearchPropsSingular<PersonData & { name: string }>,
    'Option'
  >,
) {
  return <AsyncSearch {...props} Option={PersonOption} />
}
