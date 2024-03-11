import { RenderedConsumable } from '../../types.ts'
import cls from '../../util/cls.ts'
import AsyncSearch, { AsyncSearchProps } from '../AsyncSearch.tsx'

function ConsumableOption({
  option,
  selected,
}: {
  option: RenderedConsumable
  selected: boolean
}) {
  return (
    <div className='flex flex-col'>
        <div className={cls('truncate text-base', selected && 'font-bold')}>
          {option.name}
        </div>
    </div>
  )
}

export default function ConsumableSearch(
  props: Omit<AsyncSearchProps<RenderedConsumable>, 'Option' | 'href'>,
) {
  return (
    <AsyncSearch {...props} href='/app/consumables' Option={ConsumableOption} />
  )
}
