import { ComponentChildren, JSX } from 'preact'
import Avatar from './Avatar.tsx'
import cls from '../../util/cls.ts'
import { Maybe } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import isString from '../../util/isString.ts'

export type PersonData = {
  id?: string | 'add'
  name: string
  display_name?: Maybe<string>
  href?: Maybe<string>
  avatar_url?: Maybe<string>
  description?: ComponentChildren
}

export function assertPersonLike(
  person: unknown,
): asserts person is PersonData {
  assert(isObjectLike(person))
  assert(isString(person.name))
}

export function Person(
  { person, bold, size = 'md' }: {
    person: PersonData
    bold?: boolean
    size?: 'md' | 'lg'
  },
): JSX.Element {
  const Component = person.href ? 'a' : 'div'
  return (
    <Component
      className={cls(
        'flex items-center',
        person.href && 'hover:text-white',
      )}
      href={person.href ?? undefined}
    >
      <Avatar
        src={person.avatar_url}
        className={cls(
          'flex-shrink-0 rounded-full',
          size === 'lg' ? 'h-10 w-10' : 'h-6 w-6',
        )}
      />
      <span className={cls('ml-3 truncate', bold && 'font-bold')}>
        <div>{person.display_name || person.name}</div>
        {person.description && (
          <div className='font-normal capitalize'>
            {person.description}
          </div>
        )}
      </span>
    </Component>
  )
}
