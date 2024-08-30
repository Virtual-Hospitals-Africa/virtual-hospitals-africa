import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'

export default function ConditionSearch(
  props: Omit<AsyncSearchProps, 'Option' | 'href'>,
) {
  return <AsyncSearch {...props} search_route='/app/conditions' />
}
