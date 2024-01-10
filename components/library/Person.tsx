import { ComponentChildren, JSX } from 'preact'
import Avatar from './Avatar.tsx'
import cls from '../../util/cls.ts'
import { Maybe } from '../../types.ts'

export type PersonData = {
  id?: number | 'add'
  name: string
  display_name?: Maybe<string>
  avatar_url?: Maybe<string>
  description?: ComponentChildren
}

export function Person(
  { person, bold }: { person: PersonData; bold?: boolean },
): JSX.Element {
  return (
    <div className='flex items-center'>
      <Avatar
        src={person.avatar_url}
        className='h-6 w-6 flex-shrink-0 rounded-full'
      />
      <span className={cls('ml-3 truncate', bold && 'font-bold')}>
        <div>{person.display_name || person.name}</div>
        {person.description && (
          <div className='font-normal capitalize'>
            {person.description}
          </div>
        )}
      </span>
    </div>
  )
}
