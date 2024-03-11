import { RenderedProcurer } from '../../types.ts'
import cls from '../../util/cls.ts'
import AsyncSearch, { AsyncSearchProps } from '../AsyncSearch.tsx'

function ProcurerOption({
  option,
  selected,
}: {
  option: RenderedProcurer
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

export default function ProcurerSearch(
  props: Omit<AsyncSearchProps<RenderedProcurer>, 'Option' | 'href'>,
) {
  return (
    <AsyncSearch {...props} href='/app/procurers' Option={ProcurerOption} />
  )
}
