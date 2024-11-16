import { cls } from '../util/cls.ts'

export function BaseOption<
  T extends {
    id?: unknown
    name: string
    display_name?: string
    description?: string
  },
>({
  option,
  selected,
}: {
  option: T
  selected: boolean
}) {
  return (
    <div className='flex flex-col'>
      <div className={cls('text-base', selected && 'font-bold')}>
        {option.display_name || option.name}
      </div>
      {option.description && (
        <div className={cls('text-xs', selected && 'font-bold')}>
          {option.description}
        </div>
      )}
    </div>
  )
}
