import AsyncSearch, { AsyncSearchPropsSingular } from './AsyncSearch.tsx'

type SurgeryData = { id: string; name: string }

export default function ConditionSearch(
  props: Omit<AsyncSearchPropsSingular<SurgeryData>, 'Option' | 'search_route'>,
) {
  return <AsyncSearch {...props} search_route='/app/surgeries' />
}
