import cls from '../util/cls.ts'
import AsyncSearch, { AsyncSearchProps } from './AsyncSearch.tsx'

function ConditionOption({
  option,
  selected,
}: {
  option: { name: string }
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
  props: Omit<AsyncSearchProps, 'Option' | 'href'>,
) {
  return (
    <AsyncSearch {...props} href='/app/conditions' Option={ConditionOption} />
  )
}
