import Avatar from '../components/library/Avatar.tsx'
import { Maybe } from '../types.ts'
import { cls } from '../util/cls.ts'

export function BaseOption<
  T extends {
    id?: string
    name?: Maybe<string>
    display_name?: Maybe<string>
    description?: Maybe<string> | Maybe<Array<string>>
    avatar_url?: Maybe<string>
  },
>({
  option,
  selected,
  option_name_field,
  option_description_field,
}: {
  option: T
  active: boolean
  selected: boolean
  option_name_field?: string
  option_description_field?: string
}) {
  // If the key is there
  const avatar = 'avatar_url' in option && (
    <Avatar
      src={option.avatar_url}
      className={cls(
        'shrink-0 rounded-full',
        'h-10 w-10',
      )}
    />
  )

  const name = option_name_field
    // deno-lint-ignore no-explicit-any
    ? (option as any)[option_name_field]
    : option.display_name || option.name

  const description = option_description_field
    // deno-lint-ignore no-explicit-any
    ? (option as any)[option_description_field]
    : option.description

  return (
    <div className='flex flex-row gap-2'>
      {avatar}
      <div className='flex flex-col'>
        <div className={cls('text-base', selected && 'font-bold')}>
          {name}
        </div>
        {option.description && (
          <div className={cls('text-xs', selected && 'font-bold')}>
            {Array.isArray(description) ? description.join(', ') : description}
          </div>
        )}
      </div>
    </div>
  )
}
