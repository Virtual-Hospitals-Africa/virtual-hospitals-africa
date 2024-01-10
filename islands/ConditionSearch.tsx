import cls from '../util/cls.ts'
import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'

type ConditionData = { id: string; name: string }

function ConditionOption({
  option,
  selected,
}: {
  option: ConditionData
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

export default function ConditionSearch(
  props: Omit<AsyncSearchProps<ConditionData>, 'Option' | 'href'>,
) {
  return (
    <AsyncSearch {...props} href='/app/conditions' Option={ConditionOption} />
  )
}
