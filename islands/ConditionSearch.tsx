import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'

export default function ConditionSearch(
  props: Omit<AsyncSearchProps, 'Option' | 'search_route'>,
) {
  return <AsyncSearch {...props} search_route='/app/conditions' />
}
