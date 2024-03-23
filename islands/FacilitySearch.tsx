import { assert } from 'std/assert/assert.ts'
import { HasId } from '../types.ts'
import cls from '../util/cls.ts'
import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'

type FacilityData = HasId<{ name: string; address: string | null }>

type FacilityKind = 'physical' | 'virtual' | 'both'

type FacilitySearchPropsGeneral<
  Kind extends FacilityKind,
  FacilityType extends FacilityData,
> =
  & { kind: Kind }
  & Omit<
    AsyncSearchProps<FacilityType>,
    'Option' | 'href' | 'optionHref'
  >

type FacilitySearchProps =
  | FacilitySearchPropsGeneral<
    'physical',
    HasId<{ name: string; address: string }>
  >
  | FacilitySearchPropsGeneral<'virtual' | 'both', FacilityData>

function FacilityOption({
  option,
  selected,
}: {
  option: FacilityData
  selected: boolean
}) {
  return (
    <div className='flex flex-col'>
      <div className={cls('truncate text-base', selected && 'font-bold')}>
        {option.name}
      </div>
      {option.address && (
        <div className={cls('truncate text-xs', selected && 'font-bold')}>
          {option.address}
        </div>
      )}
    </div>
  )
}

export default function FacilitySearch(
  props: FacilitySearchProps,
) {
  const params = new URLSearchParams()
  if (props.kind && props.kind !== 'both') {
    params.set('kind', props.kind)
  }
  const href = `/app/facilities?${params}`
  return (
    <AsyncSearch
      {...props}
      href={href}
      Option={FacilityOption}
      onSelect={(selected) => {
        if (selected && props.kind === 'physical') {
          assert(selected.address)
        }
        return props.onSelect?.(
          selected as HasId<{ name: string; address: string }>,
        )
      }}
    />
  )
}
