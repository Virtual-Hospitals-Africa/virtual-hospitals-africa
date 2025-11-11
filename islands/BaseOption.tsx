import Avatar from '../components/library/Avatar.tsx'
import { Maybe } from '../types.ts'
import { cls } from '../util/cls.ts'

export function BaseOption<
  T extends {
    id?: unknown
    name?: string
    display_name?: string
    description?: string
    avatar_url?: Maybe<string>
  },
>({
  option,
  selected,
}: {
  option: T
  active: boolean
  selected: boolean
}) {
  const avatar = option.avatar_url && (
    <Avatar
      src={option.avatar_url}
      className={cls(
        'flex-shrink-0 rounded-full',
        'h-10 w-10',
      )}
    />
  )
  
  return (
    <div>
      {avatar}
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
    </div>
  )
}
