import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'

type SurgeryData = { id: string; name: string }

export default function ConditionSearch(
  props: Omit<AsyncSearchProps<SurgeryData>, 'Option' | 'search_route'>,
) {
  return <AsyncSearch {...props} search_route='/app/surgeries' />
}
