import { assert } from 'std/assert/assert.ts'
import { HasStringId } from '../types.ts'
import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'

type OrganizationData = HasStringId<{ name: string; address: string | null }>

type OrganizationKind = 'physical' | 'virtual' | 'both'

type OrganizationSearchPropsGeneral<
  Kind extends OrganizationKind,
  OrganizationType extends OrganizationData,
> =
  & { kind: Kind }
  & Omit<
    AsyncSearchProps<OrganizationType>,
    'Option' | 'href' | 'optionHref'
  >

type OrganizationSearchProps =
  | OrganizationSearchPropsGeneral<
    'physical',
    HasStringId<{ name: string; address: string }>
  >
  | OrganizationSearchPropsGeneral<'virtual' | 'both', OrganizationData>

export default function OrganizationSearch(
  props: OrganizationSearchProps,
) {
  const params = new URLSearchParams()
  if (props.kind && props.kind !== 'both') {
    params.set('kind', props.kind)
  }
  const href = `/app/organizations?${params}`
  return (
    <AsyncSearch
      {...props}
      href={href}
      onSelect={(selected) => {
        if (selected && props.kind === 'physical') {
          assert(selected.address)
        }
        return props.onSelect?.(
          selected as HasStringId<{ name: string; address: string }>,
        )
      }}
    />
  )
}
