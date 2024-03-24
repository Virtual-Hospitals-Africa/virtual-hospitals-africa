import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'

type SurgeryData = { id: string; name: string }

export default function ConditionSearch(
  props: Omit<AsyncSearchProps<SurgeryData>, 'Option' | 'href'>,
) {
  return <AsyncSearch {...props} href='/app/surgeries' />
}
