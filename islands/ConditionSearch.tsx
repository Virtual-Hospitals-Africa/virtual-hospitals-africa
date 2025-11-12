import AsyncSearch, { AsyncSearchPropsSingular } from './AsyncSearch.tsx'

export default function ConditionSearch(
  props: Omit<AsyncSearchPropsSingular, 'Option' | 'search_route'>,
) {
  return <AsyncSearch {...props} search_route='/app/conditions' />
}
