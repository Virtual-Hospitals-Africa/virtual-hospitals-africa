import { RenderedDevice } from '../../types.ts'
import cls from '../../util/cls.ts'
import AsyncSearch, { AsyncSearchProps } from '../AsyncSearch.tsx'

function DeviceOption({
  option,
  selected,
}: {
  option: RenderedDevice
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

export default function DeviceSearch(
  props: Omit<AsyncSearchProps<RenderedDevice>, 'Option' | 'href'>,
) {
  return <AsyncSearch {...props} href='/app/devices' Option={DeviceOption} />
}
