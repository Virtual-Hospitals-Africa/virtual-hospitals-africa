import { Person, PersonData } from '../components/library/Person.tsx'
import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'

function PersonOption({
  option,
  selected,
}: {
  option: PersonData
  selected: boolean
}) {
  return <Person person={option} bold={selected} />
}

export default function PersonSearch(
  props: Omit<AsyncSearchProps<PersonData>, 'Option'>,
) {
  return <AsyncSearch {...props} Option={PersonOption} />
}
