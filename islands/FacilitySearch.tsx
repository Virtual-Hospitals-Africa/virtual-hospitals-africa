import { HasId } from '../types.ts'
import cls from '../util/cls.ts'
import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'

type FacilityData = HasId<{ name: string; address: string }>

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
      <div className={cls('truncate text-xs', selected && 'font-bold')}>
        {option.address}
      </div>
    </div>
  )
}

export default function FacilitySearch(
  props: Omit<AsyncSearchProps<FacilityData>, 'Option'>,
) {
  return <AsyncSearch {...props} Option={FacilityOption} />
}
