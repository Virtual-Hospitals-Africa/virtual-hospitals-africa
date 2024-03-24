import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'

export default function ConditionSearch(
  props: Omit<AsyncSearchProps, 'Option' | 'href'>,
) {
  return <AsyncSearch {...props} href='/app/conditions' />
}
