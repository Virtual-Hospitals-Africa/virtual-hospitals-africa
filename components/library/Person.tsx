import { ComponentChildren, JSX } from 'preact'
import Avatar from './Avatar.tsx'
import cls from '../../util/cls.ts'

export type PersonData = {
  id: number | 'add'
  name: string
  avatar_url?: string
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
        <div>{person.name}</div>
        {person.description && (
          <div className='font-normal capitalize'>
            {person.description}
          </div>
        )}
      </span>
    </div>
  )
}
